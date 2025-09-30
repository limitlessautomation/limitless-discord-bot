import LiveStream from '../models/LiveStream.js';

export class LiveStreamAnalytics {
  constructor() {
    this.activeStreams = new Map(); // streamId -> dbId mapping
  }

  async createStreamRecord(streamData, channelId, messageId) {
    try {
      const newStream = new LiveStream({
        tiktokUsername: streamData.uniqueId,
        streamId: streamData.streamId,
        startTime: new Date(),
        viewers: streamData.viewerCount || 0,
        discordMessageId: messageId,
        discordChannelId: channelId,
      });

      const savedStream = await newStream.save();
      this.activeStreams.set(streamData.streamId, savedStream._id);
      console.log(`✅ Created stream record for ${streamData.streamId}`);
      return savedStream;
    } catch (error) {
      console.error('Error creating stream record:', error);
      throw error;
    }
  }

  async updateStreamStats(streamId, updates) {
    try {
      const dbId = this.activeStreams.get(streamId);
      if (!dbId) {
        console.warn(`No active stream found for ID: ${streamId}`);
        return;
      }

      await LiveStream.findByIdAndUpdate(dbId, updates);
    } catch (error) {
      console.error('Error updating stream stats:', error);
    }
  }

  async finalizeStream(streamId) {
    try {
      const dbId = this.activeStreams.get(streamId);
      if (!dbId) {
        console.warn(`No active stream found for finalization: ${streamId}`);
        return null;
      }

      const streamDoc = await LiveStream.findById(dbId);
      if (streamDoc) {
        const duration = (new Date() - streamDoc.startTime) / 1000;
        streamDoc.endTime = new Date();
        streamDoc.duration = Math.round(duration);
        await streamDoc.save();
        
        console.log(`✅ Finalized stream ${streamId}: ${Math.round(duration)}s duration`);
      }

      this.activeStreams.delete(streamId);
      return streamDoc;
    } catch (error) {
      console.error('Error finalizing stream:', error);
      throw error;
    }
  }

  async getActiveStreamCount() {
    return this.activeStreams.size;
  }

  async getStreamById(streamId) {
    const dbId = this.activeStreams.get(streamId);
    if (!dbId) return null;
    
    try {
      return await LiveStream.findById(dbId);
    } catch (error) {
      console.error('Error getting stream by ID:', error);
      return null;
    }
  }
}
