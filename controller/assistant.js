// const { GoogleGenAI } = require("@google/genai");
const { GoogleGenAI } = require("@google/genai");
const { User } = require("../model/user");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const moment = require("moment");

async function assistantFunc(message, assistantName, authorName) {
  try {
    const prompt = `You are a virtual assistant named ${assistantName} created by ${authorName}.
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
"type": "general" | "google_search" | "youtube_search" | "youtube_play" | "get_time" | "get_date" | "get_day" | "get_month" | "calculator_open" | "instagram_open" | "facebook_open" | "weather-show",
"userInput": "<original user input>" {only remove your name from userInput if exists) and agar kisi ne google ya youtube pe kuch search karne ko bola hai to userInput me only bo search baala text jaye},
"response": "<a short spoken response to read out loud to the user>"
}

instructions:
- "type": determine the intent of the user.
- "userInput": original sentence the user spoke.
- "response": A short voice-friendly reply, e.g., "Sure, playing it now", "Here's what I found", "Today is Tuesday", etc.

Type meanings:
- "general": if it's a factual or informational question.
- "google_search": if user wants to search something on Google.
- "youtube_search": if user wants to search something on YouTube.
- "youtube_play": if user wants to directly play a video or song.
- "calculator_open": if user wants to open a calculator.
- "instagram_open": if user wants to open instagram.
- "facebook_open": if user wants to open facebook.
- "weather-show": if user wants to know weather.
- "get_time": if user asks for current time.
- "get_date": if user asks for today's date.
- "get_day": if user asks what day it is.
- "get_month": if user asks for the current month.

Important:
- Use ${authorName} agar koi puche tume kisne banaya
- Only respond with the JSON object, nothing else.

now your userInput- ${message}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    // console.log(response);
    return response.text;
  } catch (error) {
    console.log("error---", error);
    return console.error(error);
  }
}

async function setUpAssistant(req, res) {
  try {
    const user = await User.findById(req.userID);
    if (!user) {
      return res.status(404).json({ message: "User  not found" });
    }

    const { assistantName } = req.body;

    if (!assistantName) {
      return res.status(400).json({ message: "Assistant name is required" });
    }
    const trimmedName = assistantName.trim();
    if (trimmedName.length > 100) {
      return res
        .status(400)
        .json({ message: "Assistant name too long (max 100 characters)" });
    }

    const assistant = await User.findOneAndUpdate(
      { _id: req.userID },
      {
        $set: {
          assistantName: trimmedName,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
    res.status(200).json({
      success: true,
      message: "Assistant setup completed successfully",
      assistant: {
        id: assistant._id,
        assistantName: assistant.assistantName,
      },
    });
  } catch (error) {
    console.error("Error in setUpAssistant:", error);
    return res.status(500).json({ message: "Something went wrong..." });
  }
}
async function askToAssistant(req, res) {
  try {
    const user = await User.findById(req.userID);
    const { message } = req.body;

    const authorName = user.name;
    const assistantName = user.assistantName;

    if (!assistantName) {
      return res.status(400).json({
        message: "Please complete your Assistant setup",
      });
    }

    
    let resultText;
    try {
      resultText = await assistantFunc(message, assistantName, authorName);
    } catch (error) {
      console.error("Error calling assistantFunc:", error);
      return res.status(502).json({
        message: "AI service unavailable or network error. Please try again later.",
      });
    }

  
    if (!resultText || typeof resultText !== "string") {
      console.error("AI did not return valid text:", resultText);
      return res.status(502).json({
        message: "AI service returned no data. Please try again later.",
      });
    }

    let aiResponse;
    try {
      const cleanText = resultText.replace(/```json|```/g, "").trim();
      aiResponse = JSON.parse(cleanText);
    } catch (err) {
      console.warn("Invalid AI JSON format:", resultText);
      return res.status(200).json({
        success: true,
        type: "general",
        userInput: message,
        response: "Sorry, I couldn’t understand the AI’s response. Please try again.",
      });
    }

    const { type, userInput, response } = aiResponse;
    let finalResponse = response;

  
    switch (type) {
      case "get_time":
        finalResponse = `The current time is ${moment().format("hh:mm A")}`;
        break;

      case "get_date":
        finalResponse = `Today's date is ${moment().format("dddd, MMMM Do YYYY")}`;
        break;

      case "get_day":
        finalResponse = `Today is ${moment().format("dddd")}`;
        break;

      case "get_month":
        finalResponse = `We are in ${moment().format("MMMM")}`;
        break;

      // direct action cases
      case "weather-show":
      case "calculator_open":
      case "instagram_open":
      case "facebook_open":
      case "google_search":
      case "youtube_search":
      case "youtube_play":
        return res.json({
          type,
          userInput,
          response: finalResponse,
        });

      default:
        finalResponse = response || "I'm not sure how to handle that.";
    }

    return res.status(200).json({
      success: true,
      type,
      userInput,
      response: finalResponse,
    });
  } catch (error) {
    console.error("Error in askToAssistant:", error);
    return res.status(500).json({
      message: "Something went wrong on the server.",
    });
  }
}


module.exports = { askToAssistant, setUpAssistant };
