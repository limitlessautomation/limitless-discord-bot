import { TikTokLiveConnection, WebcastEvent, ControlEvent } from 'tiktok-live-connector';
import { EmbedBuilder } from 'discord.js';
import { LiveStreamAnalytics } from './LiveStreamAnalytics.js';

export class TikTokLiveService {
  constructor(discordClient, tiktokIdentifier, announcementChannelId) {
    this.client = discordClient;
    this.identifier = tiktokIdentifier;
    this.channelId = announcementChannelId;
    this.connection = null;
    this.analytics = new LiveStreamAnalytics();
    this.activeMessages = new Map(); // streamId -> messageId mapping
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    
    // Determine if using user ID (numeric) or username (starts with @)
    this.isUserId = !isNaN(tiktokIdentifier) && tiktokIdentifier.length > 5;
    this.identifierType = this.isUserId ? 'User ID' : 'Username';
  }

  async connect() {
    try {
      console.log(`🔌 Connecting to TikTok Live (${this.identifierType}): ${this.identifier}`);
      this.connection = new TikTokLiveConnection(this.identifier, {
        enableExtendedGiftInfo: true,
        requestPollingIntervalMs: 1000,
      });
      
      this.setupEventListeners();
      await this.connection.connect();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log(`✅ Connected to TikTok Live (${this.identifierType}): ${this.identifier}`);
    } catch (error) {
      console.error('❌ Failed to connect to TikTok Live:', error);
      this.isConnected = false;
      throw error;
    }
  }

  setupEventListeners() {
    // Connection events
    this.connection.on(ControlEvent.CONNECTED, (state) => {
      console.log(`🟢 TikTok Live connected: ${state.roomId}`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.connection.on(ControlEvent.DISCONNECTED, () => {
      console.log('🔴 TikTok Live disconnected');
      this.isConnected = false;
      this.handleReconnection();
    });

    this.connection.on(ControlEvent.ERROR, (error) => {
      console.error('❌ TikTok Live error:', error);
      this.isConnected = false;
    });

    // Stream events
    this.connection.on(WebcastEvent.LIVE_START, this.handleStreamStart.bind(this));
    this.connection.on(WebcastEvent.STREAM_END, this.handleStreamEnd.bind(this));
    
    // Analytics events
    this.connection.on(WebcastEvent.LIKE, this.handleLike.bind(this));
    this.connection.on(WebcastEvent.FOLLOW, this.handleFollow.bind(this));
    this.connection.on(WebcastEvent.GIFT, this.handleGift.bind(this));
    this.connection.on(WebcastEvent.CHAT, this.handleChat.bind(this));
    this.connection.on(WebcastEvent.ROOM_USER, this.handleViewerCount.bind(this));
    this.connection.on(WebcastEvent.MEMBER, this.handleMember.bind(this));
  }

  async handleStreamStart(data) {
    try {
      console.log(`🎥 Stream started: ${data.streamId}`);
      
      const channel = this.client.channels.cache.get(this.channelId);
      if (!channel) {
        console.error(`❌ Channel not found: ${this.channelId}`);
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('🔴 I\'m Live on TikTok!')
        .setDescription('Come join the stream!')
        .setURL(`https://www.tiktok.com/@${this.username}/live`)
        .setColor('#FF0050')
        .setTimestamp()
        .addFields(
          { name: 'Stream Title', value: data.title || 'Live Stream', inline: true },
          { name: 'Viewers', value: String(data.viewerCount || 0), inline: true }
        )
        .setFooter({ text: `@${this.username}` })
        .setThumbnail(`https://www.tiktok.com/@${this.username}`);

      const message = await channel.send({ embeds: [embed] });
      
      // Store message ID and create analytics record
      this.activeMessages.set(data.streamId, message.id);
      await this.analytics.createStreamRecord(data, this.channelId, message.id);
      
      console.log(`✅ Live announcement sent for stream: ${data.streamId}`);
    } catch (error) {
      console.error('❌ Error handling stream start:', error);
    }
  }

  async handleStreamEnd(data) {
    try {
      console.log(`⏹️ Stream ended: ${data.streamId}`);
      
      const messageId = this.activeMessages.get(data.streamId);
      if (!messageId) {
        console.warn(`⚠️ No message ID found for stream: ${data.streamId}`);
        return;
      }

      const channel = this.client.channels.cache.get(this.channelId);
      if (!channel) {
        console.error(`❌ Channel not found: ${this.channelId}`);
        return;
      }

      // Delete Discord announcement
      try {
        const message = await channel.messages.fetch(messageId);
        if (message) {
          await message.delete();
          console.log(`🗑️ Live announcement deleted for stream: ${data.streamId}`);
        }
      } catch (deleteError) {
        if (deleteError.code === 10008) {
          console.log(`ℹ️ Message already deleted for stream: ${data.streamId}`);
        } else {
          console.error('❌ Error deleting message:', deleteError);
        }
      }

      // Finalize analytics
      await this.analytics.finalizeStream(data.streamId);
      this.activeMessages.delete(data.streamId);
      
    } catch (error) {
      console.error('❌ Error handling stream end:', error);
    }
  }

  async handleLike(data) {
    try {
      await this.analytics.updateStreamStats(data.streamId, { 
        $inc: { likes: data.likeCount || 1 } 
      });
    } catch (error) {
      console.error('❌ Error handling like event:', error);
    }
  }

  async handleFollow(data) {
    try {
      await this.analytics.updateStreamStats(data.streamId, { 
        $inc: { follows: 1 } 
      });
    } catch (error) {
      console.error('❌ Error handling follow event:', error);
    }
  }

  async handleGift(data) {
    try {
      const giftCount = data.giftCount || 1;
      await this.analytics.updateStreamStats(data.streamId, { 
        $inc: { gifts: giftCount } 
      });
    } catch (error) {
      console.error('❌ Error handling gift event:', error);
    }
  }

  async handleChat(data) {
    try {
      await this.analytics.updateStreamStats(data.streamId, { 
        $inc: { comments: 1 } 
      });
    } catch (error) {
      console.error('❌ Error handling chat event:', error);
    }
  }

  async handleViewerCount(data) {
    try {
      await this.analytics.updateStreamStats(data.streamId, { 
        viewers: data.viewerCount 
      });
    } catch (error) {
      console.error('❌ Error handling viewer count event:', error);
    }
  }

  async handleMember(data) {
    try {
      // Handle member join/leave events if needed
      // This could be used for additional analytics
    } catch (error) {
      console.error('❌ Error handling member event:', error);
    }
  }

  async handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(async () => {
        try {
          await this.connect();
        } catch (error) {
          console.error('❌ Reconnection failed:', error);
        }
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached. Giving up.');
    }
  }

  disconnect() {
    if (this.connection) {
      this.connection.disconnect();
      this.isConnected = false;
      console.log('🔌 TikTok Live service disconnected');
    }
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      username: this.username,
      channelId: this.channelId,
      activeStreams: this.activeMessages.size,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}
