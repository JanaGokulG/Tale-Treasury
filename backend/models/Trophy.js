// models/Trophy.js
import mongoose from "mongoose";

export const TROPHY_DEFINITIONS = [
  { id: "first_story_read",  emoji: "📖", label: "First Story Read",              description: "Read your very first story" },
  { id: "night_owl",         emoji: "🌙", label: "Night Owl",                     description: "Read 3 stories after midnight" },
  { id: "seven_day_streak",  emoji: "🔥", label: "7-Day Streak",                  description: "Log in 7 days in a row" },
  { id: "story_weaver",      emoji: "✨", label: "Story Weaver",                  description: "Generate 5 stories" },
  { id: "archive_keeper",    emoji: "🌟", label: "Archive Keeper",                description: "Save 10 stories to your archive" },
  { id: "genre_explorer",    emoji: "🎭", label: "Genre Explorer",                description: "Read stories from 4 different genres" },
];

const trophySchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  trophyId: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now },
});

trophySchema.index({ userId: 1, trophyId: 1 }, { unique: true });

export default mongoose.model("Trophy", trophySchema);