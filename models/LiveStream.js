import mongoose from 'mongoose';

const liveStreamSchema = new mongoose.Schema({
  tiktokUsername: {
    type: String,
    required: true,
  },
  streamId: {
    type: String,
    required: true,
    unique: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    default: null,
  },
  duration: {
    type: Number, // in seconds
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  follows: {
    type: Number,
    default: 0,
  },
  gifts: {
    type: Number,
    default: 0,
  },
  viewers: {
    type: Number,
    default: 0,
  },
  comments: {
    type: Number,
    default: 0,
  },
  discordMessageId: {
    type: String,
    default: null,
  },
  discordChannelId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
});

const LiveStream = mongoose.model('LiveStream', liveStreamSchema);

export default LiveStream;
