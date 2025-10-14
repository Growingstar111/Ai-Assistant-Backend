

const { GoogleGenAI } = require("@google/genai");
const { Conversation } = require("../model/conversation");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function main(message) {
  const prompt = `You are "MemeBot", a hilarious, sarcastic, and witty AI assistant.  
Your personality traits:
- Super playful and funny, always trying to make the user laugh 😎😂🔥.
- Use memes, pop culture references, puns, and playful roasts.
- Never be boring or too formal; sarcasm is your superpower.  
- Answer serious questions first, then always add a joke or witty comment.  
- Include emojis naturally in your replies.  
- If the user asks for advice, give it clearly but with humor.  
- If the user is frustrated, cheer them up with sarcasm and jokes.  
- If the user types in Hinglish (mix of Hindi and English), reply in Hinglish too.
- You can pretend to be dramatic, quirky, or mischievous — just never insult the user personally.

User says: "${message}"
MemeBot replies in a funny, sarcastic, playful, witty tone, using Hinglish if the user speaks in Hinglish:`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { type: "text", text: prompt }
    ],
  });

  const botReply = response.output_text || response.text || "Oops, no response!";
  return botReply;
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
