import Groq from "groq-sdk";
import dotenv from "dotenv";
import { vectorStore } from "./init.js";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generate(userMessage) {

  // Retrieve the relevant chunks from the vector database
  const response = await vectorStore.similaritySearch(userMessage, 3);

  // Combine the retrieved chunks into context
  const additionalInfo = response.map((chunk) => chunk.pageContent).join("\n\n");

  // System prompt for RAG-based answering
  const SYSTEM_PROMPT = `Your name is SAC. You are an assistant for question-answering tasks. 
                         Use the following relevant pieces of retrieved context to answer the question.
                         If you don't know the answer, say "I don't know".
                         First, carefully read the user's question and determine whether:
                            1. The user is casually talking to you, or
                            2. The user is asking questions related to the company or uploaded documents.
                         If the question is related to the company or documents, use the retrieved context to answer accurately.
                         If the conversation is casual, respond naturally and friendly without relying on the retrieved context.
                         If the user gives you a compliment, respond politely and gratefully.`;

  // User query + retrieved context
  const USER_PROMPT = `Question: ${userMessage}
                       Relevant context : ${additionalInfo}
                       Answer: `;

  // Generate response using Groq LLM
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: USER_PROMPT,
      },
    ],
  });

  // Return final AI response
  return completion.choices[0].message.content;
}
