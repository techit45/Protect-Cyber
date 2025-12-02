export interface StoredMessage {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
  preview: string; // First 50 characters for display
}

export class MessageStorage {
  private messages: Map<string, StoredMessage[]> = new Map();
  private readonly MAX_MESSAGES_PER_USER = 10;
  private readonly MESSAGE_RETENTION_HOURS = 24;

  constructor() {
    // Clean up old messages every hour
    setInterval(() => this.cleanupOldMessages(), 60 * 60 * 1000);
  }

  storeMessage(userId: string, messageText: string): string {
    if (!this.messages.has(userId)) {
      this.messages.set(userId, []);
    }

    const userMessages = this.messages.get(userId)!;
    const messageId = this.generateMessageId();
    
    const storedMessage: StoredMessage = {
      id: messageId,
      userId,
      text: messageText,
      timestamp: Date.now(),
      preview: this.createPreview(messageText)
    };

    // Add to the beginning of array (newest first)
    userMessages.unshift(storedMessage);

    // Keep only the latest messages
    if (userMessages.length > this.MAX_MESSAGES_PER_USER) {
      userMessages.splice(this.MAX_MESSAGES_PER_USER);
    }

    console.log(`📝 Stored message for user ${userId}: ${storedMessage.preview}`);
    return messageId;
  }

  getRecentMessages(userId: string, limit: number = 5): StoredMessage[] {
    const userMessages = this.messages.get(userId) || [];
    return userMessages.slice(0, limit);
  }

  getMessageById(userId: string, messageId: string): StoredMessage | null {
    const userMessages = this.messages.get(userId) || [];
    return userMessages.find(msg => msg.id === messageId) || null;
  }

  getUserMessageCount(userId: string): number {
    return this.messages.get(userId)?.length || 0;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private createPreview(text: string): string {
    if (text.length <= 50) return text;
    return text.substring(0, 47) + '...';
  }

  private cleanupOldMessages(): void {
    const cutoffTime = Date.now() - (this.MESSAGE_RETENTION_HOURS * 60 * 60 * 1000);
    let totalCleaned = 0;

    for (const [userId, userMessages] of this.messages.entries()) {
      const originalLength = userMessages.length;
      
      // Remove messages older than retention period
      const filteredMessages = userMessages.filter(msg => msg.timestamp > cutoffTime);
      
      if (filteredMessages.length !== originalLength) {
        this.messages.set(userId, filteredMessages);
        totalCleaned += (originalLength - filteredMessages.length);
      }

      // Remove empty user entries
      if (filteredMessages.length === 0) {
        this.messages.delete(userId);
      }
    }

    if (totalCleaned > 0) {
      console.log(`🧹 Cleaned up ${totalCleaned} old messages`);
    }
  }

  getTotalStoredMessages(): number {
    let total = 0;
    for (const userMessages of this.messages.values()) {
      total += userMessages.length;
    }
    return total;
  }
}