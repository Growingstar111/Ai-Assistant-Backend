

const { GoogleGenAI } = require("@google/genai");
const { Conversation } = require("../model/conversation");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function main(message) {
const prompt = `You are a friendly, intelligent, and helpful AI chatbot built with the MERN stack and powered by the Gemini AI API. 
You have a human-like personality and can converse naturally, remember the context of the current conversation, and respond appropriately.

Guidelines:
- Understand the user’s intent before replying.
- Give clear, concise, and meaningful answers (a few sentences is enough unless the user asks for more details).
- Provide reasoning or examples only if it helps the user understand better.
- Be polite, friendly, and engaging in every response.
- Avoid repeating phrases and robotic responses.
- If you don’t know the answer, admit it honestly.
- Support casual conversation, greetings, small talk, and emotional cues.
- Help with general topics like learning, coding, productivity, lifestyle, daily tasks, or general knowledge.

Always respond as a helpful assistant with a warm and approachable personality, making the conversation feel natural and interactive.`

  const response = await ai.models.generateContent({
 
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  console.log(response.text);
  return response.text;
}

async function chatWithAi(req, res) {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({
      message: "Invalid input",
    });
  }
  let conversation = await Conversation.findOne({ user: req.userID });
  if (!conversation) {
    conversation = new Conversation({ user: req.userID, messages: [] });
  }
  conversation.messages.push({ role: "user", content: message });

  const response = await main(message);

  conversation.messages.push({ role: "assistant", content: response });
  await conversation.save();
  return res.status(200).json({ reply: response });
}

async function getAllChats(req, res) {
  const userId = req.userID;
  console.log(userId);

  const chats = await Conversation.aggregate([
    {
      $match: {
        user: userId,
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "user",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
      },
    },
    {
      $project: {
        user: {
          _id: 1,
          email: 1,
        },
        _id: 1,
        title: 1,
        messages: 1,
      },
    },
  ]);
  //   console.log(chats);
  return res.status(200).json({ data: chats });
}

async function deleteHistory(req, res) {
 
  try {
    // Assuming user ID is sent in a query param or from authentication context
    const userId = req.userID;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const result = await Conversation.deleteMany({ user: userId });
    res.json({ message: `${result.deletedCount} conversations deleted` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  
}

module.exports = { chatWithAi, getAllChats, deleteHistory };
