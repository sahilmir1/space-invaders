const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const uri =
  "mongodb+srv://sahilmir1:sahil@cluster0.jwbtf.mongodb.net/spaceinvader?retryWrites=true&w=majority";

// Connect to MongoDB Atlas
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Mongoose connected");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Define Schema and Model
const scoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const Score = mongoose.model("Score", scoreSchema);

// API Routes
app.post("/submit-score", async (req, res) => {
  const { name, score } = req.body;

  if (!name || typeof score !== "number") {
    return res.status(400).json({ message: "Invalid name or score" });
  }

  try {
    const newScore = new Score({ name, score });
    await newScore.save();
    res.status(201).json({ message: "Score submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving score", error });
  }
});

app.get("/scores", async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1 }).limit(10);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving scores", error });
  }
});
