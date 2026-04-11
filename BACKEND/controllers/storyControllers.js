import Story from "../models/Story.js";

// Save or update the active story session
export const saveStorySession = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      genre, ageGroup, prompt, storyTitle,
      storySegments, currentText, choices,
      isFinalChapter, storyDone, wordCount, isGenerating
    } = req.body;

    // Upsert: the one active session per user
    const story = await Story.findOneAndUpdate(
      { userId: req.user._id, isArchived: false },
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
    const story = await Story.findOne({ userId: req.user._id, isArchived: false });
    res.json({ story: story || null });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch story session" });
  }
};

// Clear the story session (new story / cancel)
export const clearStorySession = async (req, res) => {
  try {
    await Story.findOneAndDelete({ userId: req.user._id, isArchived: false });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear story session" });
  }
};

// Archive a story
export const archiveStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      genre, ageGroup, prompt, storyTitle,
      storySegments, currentText, choices,
      isFinalChapter, storyDone, wordCount, chapters
    } = req.body;

    // Create a new archived story document
    const archivedStory = new Story({
      userId,
      genre,
      ageGroup,
      prompt,
      storyTitle,
      storySegments,
      currentText,
      choices,
      isFinalChapter,
      storyDone,
      wordCount,
      chapters,
      isArchived: true
    });

    await archivedStory.save();

    res.json({ success: true, story: archivedStory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to archive story" });
  }
};

// Get all archived stories for a user
export const getArchivedStories = async (req, res) => {
  try {
    const stories = await Story.find({ userId: req.user._id, isArchived: true })
      .sort({ createdAt: -1 });
    res.json({ success: true, stories });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch archived stories" });
  }
};

// Get a specific archived story by ID
export const getStoryById = async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id, userId: req.user._id });
    if (!story) return res.status(404).json({ message: "Story not found" });
    res.json({ success: true, story });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch story" });
  }
};

// Delete a story from the archive
export const deleteArchivedStory = async (req, res) => {
  try {
    const story = await Story.findOneAndDelete({ _id: req.params.id, userId: req.user._id, isArchived: true });
    if (!story) return res.status(404).json({ message: "Story not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete story" });
  }
};