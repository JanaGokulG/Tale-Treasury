// services/trophyService.js
import Trophy, { TROPHY_DEFINITIONS } from "../models/Trophy.js";
import User from "../models/User.js";
import { CompletedStory } from "../models/Story.js";

// Award trophy only if not already earned (unique index handles duplicates)
async function awardIfNew(userId, trophyId) {
  try {
    const doc = await Trophy.create({ userId, trophyId });
    console.log(`🏆 Awarded: ${trophyId}`);
    return doc;
  } catch (err) {
    if (err.code === 11000) return null; // already earned, fine
    throw err;
  }
}

// Call this after any relevant user action
export async function checkAndAwardTrophies(userId) {
  const newlyEarned = [];

  const user = await User.findById(userId);
  if (!user) return newlyEarned;

  // ── 1. 7-Day Streak — tracked in User.currentStreak ────────────────────
  if (user.currentStreak >= 7) {
    const awarded = await awardIfNew(userId, "seven_day_streak");
    if (awarded) newlyEarned.push("seven_day_streak");
  }

  // ── 2–6. Story-based trophies ───────────────────────────────────────────
  const allStories = await CompletedStory.find({ userId });

  // 📖 First Story Read — read at least 1 story
  if (allStories.length >= 1) {
    const awarded = await awardIfNew(userId, "first_story_read");
    if (awarded) newlyEarned.push("first_story_read");
  }

  // 🌙 Night Owl — read 3 stories between midnight and 5 AM
  const nightReads = allStories.filter(s => {
    const h = new Date(s.createdAt).getHours();
    return h >= 0 && h < 5;
  });
  if (nightReads.length >= 3) {
    const awarded = await awardIfNew(userId, "night_owl");
    if (awarded) newlyEarned.push("night_owl");
  }

  // ✨ Story Weaver — generate 5 stories
  if (allStories.length >= 5) {
    const awarded = await awardIfNew(userId, "story_weaver");
    if (awarded) newlyEarned.push("story_weaver");
  }

  // 🌟 Archive Keeper — save 10 stories
  if (allStories.length >= 10) {
    const awarded = await awardIfNew(userId, "archive_keeper");
    if (awarded) newlyEarned.push("archive_keeper");
  }

  // 🎭 Genre Explorer — read stories from 4 different genres
  const genres = new Set(allStories.map(s => s.genre).filter(Boolean));
  if (genres.size >= 4) {
    const awarded = await awardIfNew(userId, "genre_explorer");
    if (awarded) newlyEarned.push("genre_explorer");
  }

  return newlyEarned;
}

// Returns full trophy list with earned: true/false for the frontend
export async function getUserTrophies(userId) {
  const earned = await Trophy.find({ userId }).select("trophyId earnedAt");
  const earnedMap = new Map(earned.map(t => [t.trophyId, t.earnedAt]));

  return TROPHY_DEFINITIONS.map(def => ({
    ...def,
    earned:   earnedMap.has(def.id),
    earnedAt: earnedMap.get(def.id) || null,
  }));
}