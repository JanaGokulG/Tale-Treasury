import Story, { CompletedStory } from "../models/Story.js";
// Save or update the active story session
export const saveStorySession = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      genre, ageGroup, prompt, storyTitle,
      storySegments, currentText, choices,
      isFinalChapter, storyDone, wordCount, isGenerating
    } = req.body;

    // Upsert: one active story per user
    const story = await Story.findOneAndUpdate(
      { userId },
      {
        genre, ageGroup, prompt, storyTitle,
        storySegments, currentText, choices,
        isFinalChapter, storyDone, wordCount, isGenerating
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, story });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save story session" });
  }
};

// Get the active story session
export const getStorySession = async (req, res) => {
  try {
    const story = await Story.findOne({ userId: req.user.id });
    res.json({ story: story || null });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch story session" });
  }
};

// Clear the story session (new story / cancel)
export const clearStorySession = async (req, res) => {
  try {
    await Story.findOneAndDelete({ userId: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear story session" });
  }
};
export const saveCompletedStory = async (req, res) => {
  try {
    const { genre, ageGroup, prompt, storyTitle, chapters, finalText, wordCount } = req.body;
    const saved = await CompletedStory.create({
      userId: req.user.id, genre, ageGroup, prompt, storyTitle, chapters, finalText, wordCount,
    });
    res.json({ success: true, story: saved });
  } catch (err) {
    res.status(500).json({ message: "Failed to save completed story" });
  }
};
export const getCompletedStories = async (req, res) => {
  try {
    const stories = await CompletedStory.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ stories });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch completed stories" });
  }
};