const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  icon: { type: String, default: '🏆' },
  rarity: { type: String, enum: ['common','rare','epic','legendary'], default: 'common' },
  xpReward: { type: Number, default: 50 },
  condition: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

// Seed default achievements
const defaultAchievements = [
  { key: 'first_win', name: 'First Blood', description: 'Win your first match', icon: '🩸', rarity: 'common', xpReward: 50 },
  { key: 'wins_10', name: 'On a Roll', description: 'Win 10 matches', icon: '🎯', rarity: 'common', xpReward: 100 },
  { key: 'wins_50', name: 'Veteran', description: 'Win 50 matches', icon: '⚔️', rarity: 'rare', xpReward: 250 },
  { key: 'wins_100', name: 'Century', description: 'Win 100 matches', icon: '💯', rarity: 'epic', xpReward: 500 },
  { key: 'wins_500', name: 'Unstoppable', description: 'Win 500 matches', icon: '🔥', rarity: 'legendary', xpReward: 1000 },
  { key: 'tournament_win', name: 'Tournament Champion', description: 'Win a tournament', icon: '🏆', rarity: 'epic', xpReward: 500 },
  { key: 'chess_master', name: 'Chess Master', description: 'Win 20 chess games', icon: '♟️', rarity: 'rare', xpReward: 200 },
  { key: 'typing_champion', name: 'Typing Champion', description: 'Reach 100 WPM', icon: '⌨️', rarity: 'epic', xpReward: 300 },
  { key: 'streak_7', name: 'Week Warrior', description: '7-day login streak', icon: '📅', rarity: 'rare', xpReward: 150 },
  { key: 'ludo_king', name: 'Ludo King', description: 'Win 10 Ludo games', icon: '🎲', rarity: 'rare', xpReward: 200 },
  { key: 'legendary_player', name: 'Legendary', description: 'Reach Legend rank', icon: '👑', rarity: 'legendary', xpReward: 2000 },
  { key: 'social_butterfly', name: 'Social Butterfly', description: 'Add 10 friends', icon: '🦋', rarity: 'common', xpReward: 100 },
  { key: 'level_10', name: 'Rising Star', description: 'Reach Level 10', icon: '⭐', rarity: 'common', xpReward: 100 },
  { key: 'level_50', name: 'Veteran Player', description: 'Reach Level 50', icon: '🌟', rarity: 'epic', xpReward: 500 },
];

achievementSchema.statics.seedAchievements = async function() {
  for (const ach of defaultAchievements) {
    await this.findOneAndUpdate({ key: ach.key }, ach, { upsert: true, new: true });
  }
};

module.exports = mongoose.model('Achievement', achievementSchema);
