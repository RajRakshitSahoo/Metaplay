const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  avatar: { type: String, default: '' },
  banner: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 200 },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Progression
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  xpToNextLevel: { type: Number, default: 100 },
  rank: { type: String, default: 'Bronze', enum: ['Bronze','Silver','Gold','Platinum','Diamond','Master','Grandmaster'] },
  playerLevel: { type: String, default: 'Rookie', enum: ['Rookie','Amateur','Challenger','Expert','Master','Legend'] },

  // Stats
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    favoriteGame: { type: String, default: '' },
    totalPlayTime: { type: Number, default: 0 },
  },

  // Per-game stats
  gameStats: {
    type: Map,
    of: new mongoose.Schema({
      played: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
      rank: { type: String, default: 'Bronze' },
      xp: { type: Number, default: 0 },
    }, { _id: false }),
    default: {},
  },

  achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
  }],

  status: { type: String, enum: ['online', 'offline', 'in-game', 'away'], default: 'offline' },
  lastSeen: { type: Date, default: Date.now },
  socketId: { type: String, default: '' },

  // Customization
  theme: { type: String, default: 'cyberpunk' },
  boardTheme: { type: String, default: 'default' },

  // Daily login
  lastLoginDate: Date,
  loginStreak: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addXP = async function(amount, reason) {
  this.xp += amount;
  // Level up logic
  while (this.xp >= this.xpToNextLevel) {
    this.xp -= this.xpToNextLevel;
    this.level += 1;
    this.xpToNextLevel = Math.floor(100 * Math.pow(1.3, this.level - 1));
    // Update player level
    if (this.level < 5) this.playerLevel = 'Rookie';
    else if (this.level < 15) this.playerLevel = 'Amateur';
    else if (this.level < 30) this.playerLevel = 'Challenger';
    else if (this.level < 50) this.playerLevel = 'Expert';
    else if (this.level < 80) this.playerLevel = 'Master';
    else this.playerLevel = 'Legend';
  }
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
