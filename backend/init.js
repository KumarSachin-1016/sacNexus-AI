import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

if (
  !process.env.OPENAI_API_KEY ||
  !process.env.PINECONE_API_KEY ||
  !process.env.PINECONE_INDEX_NAME
) {
  throw new Error(
    "Missing environment variables"
  );
}

// OpenAI embedding model configuration

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: process.env.OPENAI_API_KEY,
});

// Pinecone database connection

const pinecone = new PineconeClient({apiKey: process.env.PINECONE_API_KEY});

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// Vector store setup for semantic search

export const vectorStore = new PineconeStore(embeddings, {
  pineconeIndex,
  maxConcurrency: 5, 
  textKey: "text",
});

// Function for initial document indexing

export async function indexDocument(filePath) {
  const loader = new PDFLoader(filePath, { splitPages: false });
  const document = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });
  const texts = await splitter.splitText(document[0].pageContent);

  const documents = texts.map((chunk) => {
    return {
      pageContent: chunk,
      metadata: document[0].metadata,
    };
  });

console.log("Adding Documents");

await vectorStore.addDocuments(documents);

console.log("Data inserted successfully");
}

// Function for dynamic PDF upload and re-indexing

export async function uploadDocument(filePath) {

  try {

  // Delete old vectors
  await pineconeIndex.namespace("").deleteAll();

  // Load PDF
  const loader = new PDFLoader(filePath);

  const docs = await loader.load();

  // Split
  const splitter =
    new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });

  const splitDocs = await splitter.splitDocuments(docs);

  await vectorStore.addDocuments(splitDocs);

  console.log("New document indexed");

} catch (error) {
   
    console.log(error);
    throw new Error(
      "Document upload failed"
    );
}
}
