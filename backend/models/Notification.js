const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['friend_request','match_invite','tournament_start','achievement','level_up','rank_up','friend_online','system'],
    required: true,
  },
  title: String,
  message: String,
  data: { type: mongoose.Schema.Types.Mixed },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
