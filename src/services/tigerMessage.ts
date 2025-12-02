/**
 * Tiger Message API Integration
 * สำหรับ ProtectCyber LINE Bot
 */

import axios from 'axios';

export interface TigerMessageConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  channelId: string;
}

export interface TigerMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  data?: any;
}

export class TigerMessageService {
  private config: TigerMessageConfig;
  private apiClient: any;

  constructor(config: TigerMessageConfig) {
    this.config = config;
    this.apiClient = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * ส่งข้อความผ่าน Tiger Message
   */
  async sendMessage(
    userId: string, 
    message: string, 
    messageType: 'text' | 'flex' | 'image' = 'text'
  ): Promise<TigerMessageResponse> {
    try {
      const payload = {
        to: userId,
        messages: [{
          type: messageType,
          text: messageType === 'text' ? message : undefined,
          contents: messageType === 'flex' ? JSON.parse(message) : undefined
        }]
      };

      const response = await this.apiClient.post('/v1/messages/send', payload);
      
      return {
        success: true,
        messageId: response.data.messageId,
        data: response.data
      };
    } catch (error: any) {
      console.error('Tiger Message send error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * ส่งข้อความไปหา Admin
   */
  async sendToAdmin(
    userId: string,
    userMessage: string,
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'
  ): Promise<TigerMessageResponse> {
    try {
      const adminMessage = {
        type: 'flex',
        altText: `🚨 Admin Alert - ${threatLevel}`,
        contents: {
          type: 'bubble',
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [{
              type: 'text',
              text: `🚨 Admin Alert - ${threatLevel}`,
              weight: 'bold',
              color: threatLevel === 'CRITICAL' ? '#FF0000' : '#FF6B00'
            }]
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'ผู้ใช้ต้องการความช่วยเหลือ',
                weight: 'bold',
                margin: 'md'
              },
              {
                type: 'text',
                text: `User ID: ${userId}`,
                size: 'sm',
                color: '#666666'
              },
              {
                type: 'text',
                text: `Message: ${userMessage}`,
                wrap: true,
                margin: 'md'
              },
              {
                type: 'text',
                text: `Threat Level: ${threatLevel}`,
                size: 'sm',
                color: threatLevel === 'CRITICAL' ? '#FF0000' : '#FF6B00',
                margin: 'md'
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [{
              type: 'button',
              action: {
                type: 'postback',
                label: 'ตอบกลับผู้ใช้',
                data: `admin_reply_${userId}`
              },
              style: 'primary'
            }]
          }
        }
      };

      // ส่งไปยัง Admin Channel
      const adminChannelId = process.env.TIGER_ADMIN_CHANNEL_ID;
      if (!adminChannelId) {
        throw new Error('Admin channel ID not configured');
      }

      return await this.sendMessage(
        adminChannelId,
        JSON.stringify(adminMessage.contents),
        'flex'
      );
    } catch (error: any) {
      console.error('Tiger Message admin alert error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Broadcast ข้อความไปยังผู้ใช้หลายคน
   */
  async broadcast(
    userIds: string[],
    message: string,
    messageType: 'text' | 'flex' = 'text'
  ): Promise<TigerMessageResponse> {
    try {
      const payload = {
        to: userIds,
        messages: [{
          type: messageType,
          text: messageType === 'text' ? message : undefined,
          contents: messageType === 'flex' ? JSON.parse(message) : undefined
        }]
      };

      const response = await this.apiClient.post('/v1/messages/broadcast', payload);
      
      return {
        success: true,
        messageId: response.data.messageId,
        data: response.data
      };
    } catch (error: any) {
      console.error('Tiger Message broadcast error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * ตรวจสอบสถานะข้อความ
   */
  async getMessageStatus(messageId: string): Promise<TigerMessageResponse> {
    try {
      const response = await this.apiClient.get(`/v1/messages/${messageId}/status`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Tiger Message status error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * สร้าง Rich Menu ผ่าน Tiger Message
   */
  async createRichMenu(richMenuData: any): Promise<TigerMessageResponse> {
    try {
      const response = await this.apiClient.post('/v1/richmenu', richMenuData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Tiger Message Rich Menu error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Analytics และ Reporting
   */
  async getAnalytics(
    startDate: string,
    endDate: string,
    metrics: string[] = ['messages', 'users', 'engagement']
  ): Promise<TigerMessageResponse> {
    try {
      const params = {
        start_date: startDate,
        end_date: endDate,
        metrics: metrics.join(',')
      };

      const response = await this.apiClient.get('/v1/analytics', { params });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Tiger Message analytics error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}