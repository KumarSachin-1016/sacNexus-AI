import express from "express";
import cors from "cors";
import multer from "multer";
import { generate } from "./chat.js";
import { uploadDocument } from "./init.js";

const app = express();

// Enable CORS for frontend-backend communication
app.use(cors());

// Enable JSON body parsing
app.use(express.json());

const port = 3000;

// Multer configuration for PDF uploads

const upload = multer({
  dest: "uploads/",
});

// Chat API endpoint

app.post("/chat", async (req, res) => {

  try{

    // Validate Fields
    if (!req.body.message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { message } = req.body;
    const result = await generate(message);
    res.json({ Assistant_Message: result});

  } catch (error) {

    console.log(error);
    res.status(500).json({
      error: "Failed to generate response",
    });

  }
});

// API endpoint for dynamic PDF upload

app.post("/upload",upload.single("pdf"),async (req, res) => {

    try {

      await uploadDocument(req.file.path);

      res.json({ message: "Document uploaded successfully" });

    } catch (error) {

      console.log(error);
      res.status(500).json({
        error: "Upload failed",
      });
    }
});

// Start Express server

app.listen(port,"127.0.0.1", () => {
  console.log(`Server is running on port ${port}`);
});