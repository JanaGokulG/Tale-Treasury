import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    genre: String,
    ageGroup: String,
    prompt: String,
    storyTitle: String,
    storySegments: { type: Array, default: [] },
    currentText: { type: String, default: "" },
    choices: { type: Array, default: [] },
    isFinalChapter: { type: Boolean, default: false },
    storyDone: { type: Boolean, default: false },
    wordCount: { type: Number, default: 0 },
    isGenerating: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Story = mongoose.model("Story", storySchema);
export default Story;// Add this at the bottom of Story.js
const completedStorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    genre: String,
    ageGroup: String,
    prompt: String,
    storyTitle: String,
    chapters: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },    finalText: { type: String, default: "" },
    wordCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const CompletedStory = mongoose.model("CompletedStory", completedStorySchema);