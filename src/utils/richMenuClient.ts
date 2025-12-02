/**
 * Unified Rich Menu Client Utility
 * ระบบจัดการ Rich Menu แบบรวมศูนย์สำหรับ ProtectCyber
 */

import { Client, RichMenu, PostbackAction, MessageAction, URIAction } from '@line/bot-sdk';
import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';

export interface RichMenuSize {
  width: number;
  height: number;
}

export interface RichMenuArea {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  action: PostbackAction | MessageAction | URIAction;
}

export interface RichMenuTemplate {
  id: string;
  name: string;
  description: string;
  size: RichMenuSize;
  areas: RichMenuArea[];
  chatBarText: string;
  selected: boolean;
  layout: 'main' | 'elderly' | 'emergency' | 'custom';
  imageConfig: {
    width: number;
    height: number;
    buttons: RichMenuButton[];
    backgroundColor: string;
    style: 'standard' | 'elderly-friendly' | 'emergency' | 'minimal';
  };
}

export interface RichMenuButton {
  id: string;
  text: string;
  textTh: string;
  textEn: string;
  action: PostbackAction | MessageAction | URIAction;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  style: {
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    borderRadius: number;
    icon?: string;
  };
}

export interface MenuDeploymentOptions {
  setAsDefault: boolean;
  deleteExisting: boolean;
  targetUsers?: string[];
  aliasId?: string;
  description?: string;
}

class RichMenuClientService {
  private client: Client;
  private readonly serviceLogger = logger;
  private readonly imageCache: Map<string, Buffer> = new Map();
  private readonly menuCache: Map<string, RichMenu> = new Map();

  constructor() {
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || !process.env.LINE_CHANNEL_SECRET) {
      throw new Error('LINE credentials not configured');
    }

    this.client = new Client({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
      channelSecret: process.env.LINE_CHANNEL_SECRET
    });

    this.serviceLogger.info('RichMenuClient', 'Rich Menu Client initialized');
  }

  /**
   * สร้าง Rich Menu จาก template
   */
  public async createRichMenuFromTemplate(
    template: RichMenuTemplate, 
    options: MenuDeploymentOptions = { setAsDefault: false, deleteExisting: false }
  ): Promise<string> {
    try {
      this.serviceLogger.info('RichMenuClient', `Creating Rich Menu: ${template.name}`, {
        templateId: template.id,
        layout: template.layout
      });

      // Delete existing menus if requested
      if (options.deleteExisting) {
        await this.deleteAllRichMenus();
      }

      // Generate image for the menu
      const imageBuffer = await this.generateMenuImage(template);
      
      // Create Rich Menu object
      const richMenu: RichMenu = {
        size: template.size,
        selected: template.selected,
        name: template.name,
        chatBarText: template.chatBarText,
        areas: template.areas
      };

      // Note: richMenuAlias is not available in the current LINE SDK version
      // It would be added here if supported

      // Create the Rich Menu
      const richMenuId = await this.client.createRichMenu(richMenu);
      
      // Upload the image
      await this.client.setRichMenuImage(richMenuId, imageBuffer, 'image/png');

      // Set as default if requested
      if (options.setAsDefault) {
        await this.client.setDefaultRichMenu(richMenuId);
      }

      // Link to specific users if provided
      if (options.targetUsers && options.targetUsers.length > 0) {
        await this.linkMenuToUsers(richMenuId, options.targetUsers);
      }

      // Cache the menu
      this.menuCache.set(template.id, richMenu);

      this.serviceLogger.info('RichMenuClient', 'Rich Menu created successfully', {
        richMenuId,
        templateId: template.id,
        setAsDefault: options.setAsDefault,
        targetUsers: options.targetUsers?.length || 0
      });

      return richMenuId;

    } catch (error) {
      this.serviceLogger.error('RichMenuClient', 'Failed to create Rich Menu', error as Error, {
        templateId: template.id
      });
      throw error;
    }
  }

  /**
   * สร้างภาพ Rich Menu จาก template
   */
  public async generateMenuImage(template: RichMenuTemplate): Promise<Buffer> {
    try {
      const cacheKey = `${template.id}_${JSON.stringify(template.imageConfig)}`;
      
      // Check cache first
      if (this.imageCache.has(cacheKey)) {
        return this.imageCache.get(cacheKey)!;
      }

      const config = template.imageConfig;
      const canvas = createCanvas(config.width, config.height);
      const ctx = canvas.getContext('2d');

      // Set background
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, config.width, config.height);

      // Draw buttons
      for (const button of config.buttons) {
        await this.drawButton(ctx, button, config.style);
      }

      // Generate buffer
      const buffer = canvas.toBuffer('image/png');
      
      // Cache the image
      this.imageCache.set(cacheKey, buffer);

      this.serviceLogger.debug('RichMenuClient', 'Menu image generated', {
        templateId: template.id,
        imageSize: buffer.length,
        buttonCount: config.buttons.length
      });

      return buffer;

    } catch (error) {
      this.serviceLogger.error('RichMenuClient', 'Failed to generate menu image', error as Error, {
        templateId: template.id
      });
      throw error;
    }
  }

  /**
   * รับ Rich Menu templates ที่มีอยู่
   */
  public getAvailableTemplates(): RichMenuTemplate[] {
    return [
      this.getMainMenuTemplate(),
      this.getElderlyMenuTemplate(),
      this.getEmergencyMenuTemplate(),
      this.getMinimalMenuTemplate()
    ];
  }

  /**
   * ลบ Rich Menu ทั้งหมด
   */
  public async deleteAllRichMenus(): Promise<void> {
    try {
      const existingMenus = await this.client.getRichMenuList();
      
      for (const menu of existingMenus) {
        await this.client.deleteRichMenu(menu.richMenuId);
        this.serviceLogger.debug('RichMenuClient', 'Deleted Rich Menu', {
          richMenuId: menu.richMenuId,
          name: menu.name
        });
      }

      // Clear caches
      this.menuCache.clear();

      this.serviceLogger.info('RichMenuClient', 'All Rich Menus deleted', {
        deletedCount: existingMenus.length
      });

    } catch (error) {
      this.serviceLogger.error('RichMenuClient', 'Failed to delete Rich Menus', error as Error);
      throw error;
    }
  }

  /**
   * เชื่อมโยง Rich Menu กับผู้ใช้
   */
  public async linkMenuToUsers(richMenuId: string, userIds: string[]): Promise<void> {
    try {
      const promises = userIds.map(userId => 
        this.client.linkRichMenuToUser(userId, richMenuId)
      );

      await Promise.all(promises);

      this.serviceLogger.info('RichMenuClient', 'Rich Menu linked to users', {
        richMenuId,
        userCount: userIds.length
      });

    } catch (error) {
      this.serviceLogger.error('RichMenuClient', 'Failed to link Rich Menu to users', error as Error, {
        richMenuId,
        userCount: userIds.length
      });
      throw error;
    }
  }

  /**
   * ยกเลิกการเชื่อมโยง Rich Menu จากผู้ใช้
   */
  public async unlinkMenuFromUsers(userIds: string[]): Promise<void> {
    try {
      const promises = userIds.map(userId => 
        this.client.unlinkRichMenuFromUser(userId)
      );

      await Promise.all(promises);

      this.serviceLogger.info('RichMenuClient', 'Rich Menu unlinked from users', {
        userCount: userIds.length
      });

    } catch (error) {
      this.serviceLogger.error('RichMenuClient', 'Failed to unlink Rich Menu from users', error as Error, {
        userCount: userIds.length
      });
      throw error;
    }
  }

  /**
   * รับรายการ Rich Menu ที่มีอยู่
   */
  public async getExistingRichMenus(): Promise<RichMenu[]> {
    try {
      const menus = await this.client.getRichMenuList();
      return menus;
    } catch (error) {
      this.serviceLogger.error('RichMenuClient', 'Failed to get existing Rich Menus', error as Error);
      throw error;
    }
  }

  /**
   * ตรวจสอบสถานะ Rich Menu ของผู้ใช้
   */
  public async getUserRichMenuStatus(userId: string): Promise<{
    hasRichMenu: boolean;
    richMenuId?: string;
    menuName?: string;
  }> {
    try {
      const richMenuId = await this.client.getRichMenuIdOfUser(userId);
      
      if (richMenuId) {
        const menuList = await this.client.getRichMenuList();
        const menu = menuList.find(m => m.richMenuId === richMenuId);
        
        return {
          hasRichMenu: true,
          richMenuId,
          menuName: menu?.name
        };
      }

      return { hasRichMenu: false };

    } catch (error) {
      this.serviceLogger.error('RichMenuClient', 'Failed to get user Rich Menu status', error as Error, {
        userId
      });
      return { hasRichMenu: false };
    }
  }

  // Private helper methods
  private async drawButton(
    ctx: CanvasRenderingContext2D, 
    button: RichMenuButton, 
    style: 'standard' | 'elderly-friendly' | 'emergency' | 'minimal'
  ): Promise<void> {
    const { position, style: buttonStyle } = button;

    // Draw button background
    ctx.fillStyle = buttonStyle.backgroundColor;
    this.drawRoundedRect(ctx, position.x, position.y, position.width, position.height, buttonStyle.borderRadius);
    ctx.fill();

    // Draw border for elderly-friendly style
    if (style === 'elderly-friendly') {
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw icon if provided
    if (buttonStyle.icon) {
      try {
        const iconSize = style === 'elderly-friendly' ? 40 : 24;
        ctx.font = `${iconSize}px Arial`;
        ctx.fillStyle = buttonStyle.textColor;
        ctx.textAlign = 'center';
        ctx.fillText(
          buttonStyle.icon, 
          position.x + position.width / 2, 
          position.y + iconSize + 10
        );
      } catch (error) {
        // Fallback if icon loading fails
        this.serviceLogger.warn('RichMenuClient', 'Failed to draw icon', {
          buttonId: button.id,
          icon: buttonStyle.icon
        });
      }
    }

    // Draw text
    const fontSize = style === 'elderly-friendly' ? Math.max(buttonStyle.fontSize, 16) : buttonStyle.fontSize;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = buttonStyle.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Use Thai text by default, fallback to English if needed
    const text = button.textTh || button.text;
    const textY = buttonStyle.icon ? 
      position.y + position.height - 20 : 
      position.y + position.height / 2;

    // Handle text wrapping for long text
    this.wrapText(ctx, text, position.x + position.width / 2, textY, position.width - 10, fontSize);
  }

  private drawRoundedRect(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  private wrapText(
    ctx: CanvasRenderingContext2D, 
    text: string, 
    x: number, 
    y: number, 
    maxWidth: number, 
    lineHeight: number
  ): void {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  // Template definitions
  private getMainMenuTemplate(): RichMenuTemplate {
    return {
      id: 'main_menu',
      name: 'เมนูหลัก - ProtectCyber',
      description: 'เมนูหลักสำหรับผู้ใช้ทั่วไป',
      size: { width: 2500, height: 1686 },
      chatBarText: '🛡️ เมนูป้องกัน',
      selected: false,
      layout: 'main',
      areas: [
        {
          bounds: { x: 0, y: 0, width: 833, height: 843 },
          action: { type: 'postback', data: 'check_new_message' }
        },
        {
          bounds: { x: 833, y: 0, width: 834, height: 843 },
          action: { type: 'postback', data: 'view_history' }
        },
        {
          bounds: { x: 1667, y: 0, width: 833, height: 843 },
          action: { type: 'postback', data: 'get_help' }
        },
        {
          bounds: { x: 0, y: 843, width: 833, height: 843 },
          action: { type: 'postback', data: 'report_problem' }
        },
        {
          bounds: { x: 833, y: 843, width: 834, height: 843 },
          action: { type: 'postback', data: 'learn_more' }
        },
        {
          bounds: { x: 1667, y: 843, width: 833, height: 843 },
          action: { type: 'postback', data: 'emergency_contact' }
        }
      ],
      imageConfig: {
        width: 2500,
        height: 1686,
        backgroundColor: '#FFFFFF',
        style: 'standard',
        buttons: [
          {
            id: 'check_new',
            text: 'ตรวจสอบข้อความใหม่',
            textTh: 'ตรวจสอบข้อความใหม่',
            textEn: 'Check New Message',
            action: { type: 'postback', data: 'check_new_message' },
            position: { x: 0, y: 0, width: 833, height: 843 },
            style: {
              backgroundColor: '#4CAF50',
              textColor: '#FFFFFF',
              fontSize: 18,
              borderRadius: 10,
              icon: '🔍'
            }
          },
          {
            id: 'view_history',
            text: 'ข้อความเก่า',
            textTh: 'ข้อความเก่า',
            textEn: 'Message History',
            action: { type: 'postback', data: 'view_history' },
            position: { x: 833, y: 0, width: 834, height: 843 },
            style: {
              backgroundColor: '#2196F3',
              textColor: '#FFFFFF',
              fontSize: 18,
              borderRadius: 10,
              icon: '📂'
            }
          },
          {
            id: 'get_help',
            text: 'ช่วยเหลือ',
            textTh: 'ช่วยเหลือ',
            textEn: 'Get Help',
            action: { type: 'postback', data: 'get_help' },
            position: { x: 1667, y: 0, width: 833, height: 843 },
            style: {
              backgroundColor: '#FF9800',
              textColor: '#FFFFFF',
              fontSize: 18,
              borderRadius: 10,
              icon: '🆘'
            }
          },
          {
            id: 'report_problem',
            text: 'รายงานปัญหา',
            textTh: 'รายงานปัญหา',
            textEn: 'Report Problem',
            action: { type: 'postback', data: 'report_problem' },
            position: { x: 0, y: 843, width: 833, height: 843 },
            style: {
              backgroundColor: '#9C27B0',
              textColor: '#FFFFFF',
              fontSize: 18,
              borderRadius: 10,
              icon: '📞'
            }
          },
          {
            id: 'learn_more',
            text: 'เรียนรู้เพิ่มเติม',
            textTh: 'เรียนรู้เพิ่มเติม',
            textEn: 'Learn More',
            action: { type: 'postback', data: 'learn_more' },
            position: { x: 833, y: 843, width: 834, height: 843 },
            style: {
              backgroundColor: '#607D8B',
              textColor: '#FFFFFF',
              fontSize: 18,
              borderRadius: 10,
              icon: '📚'
            }
          },
          {
            id: 'emergency',
            text: 'ฉุกเฉิน',
            textTh: 'ฉุกเฉิน',
            textEn: 'Emergency',
            action: { type: 'postback', data: 'emergency_contact' },
            position: { x: 1667, y: 843, width: 833, height: 843 },
            style: {
              backgroundColor: '#F44336',
              textColor: '#FFFFFF',
              fontSize: 18,
              borderRadius: 10,
              icon: '🚨'
            }
          }
        ]
      }
    };
  }

  private getElderlyMenuTemplate(): RichMenuTemplate {
    return {
      id: 'elderly_menu',
      name: 'เมนูผู้สูงอายุ - ProtectCyber',
      description: 'เมนูขนาดใหญ่สำหรับผู้สูงอายุ',
      size: { width: 2500, height: 843 },
      chatBarText: '🛡️ เมนูง่าย',
      selected: false,
      layout: 'elderly',
      areas: [
        {
          bounds: { x: 0, y: 0, width: 1250, height: 843 },
          action: { type: 'postback', data: 'check_message_elderly' }
        },
        {
          bounds: { x: 1250, y: 0, width: 1250, height: 843 },
          action: { type: 'postback', data: 'get_help_elderly' }
        }
      ],
      imageConfig: {
        width: 2500,
        height: 843,
        backgroundColor: '#FFFFFF',
        style: 'elderly-friendly',
        buttons: [
          {
            id: 'check_message',
            text: 'ตรวจสอบข้อความ',
            textTh: 'ตรวจสอบข้อความ',
            textEn: 'Check Message',
            action: { type: 'postback', data: 'check_message_elderly' },
            position: { x: 0, y: 0, width: 1250, height: 843 },
            style: {
              backgroundColor: '#4CAF50',
              textColor: '#FFFFFF',
              fontSize: 24,
              borderRadius: 15,
              icon: '🔍'
            }
          },
          {
            id: 'get_help',
            text: 'ขอความช่วยเหลือ',
            textTh: 'ขอความช่วยเหลือ',
            textEn: 'Get Help',
            action: { type: 'postback', data: 'get_help_elderly' },
            position: { x: 1250, y: 0, width: 1250, height: 843 },
            style: {
              backgroundColor: '#FF9800',
              textColor: '#FFFFFF',
              fontSize: 24,
              borderRadius: 15,
              icon: '🆘'
            }
          }
        ]
      }
    };
  }

  private getEmergencyMenuTemplate(): RichMenuTemplate {
    return {
      id: 'emergency_menu',
      name: 'เมนูฉุกเฉิน - ProtectCyber',
      description: 'เมนูสำหรับสถานการณ์ฉุกเฉิน',
      size: { width: 2500, height: 843 },
      chatBarText: '🚨 ฉุกเฉิน',
      selected: false,
      layout: 'emergency',
      areas: [
        {
          bounds: { x: 0, y: 0, width: 833, height: 843 },
          action: { type: 'postback', data: 'call_police_191' }
        },
        {
          bounds: { x: 833, y: 0, width: 834, height: 843 },
          action: { type: 'postback', data: 'call_thaicert_1441' }
        },
        {
          bounds: { x: 1667, y: 0, width: 833, height: 843 },
          action: { type: 'postback', data: 'confirm_safe' }
        }
      ],
      imageConfig: {
        width: 2500,
        height: 843,
        backgroundColor: '#FFFFFF',
        style: 'emergency',
        buttons: [
          {
            id: 'call_police',
            text: 'โทร 191 ตำรวจ',
            textTh: 'โทร 191 ตำรวจ',
            textEn: 'Call 191 Police',
            action: { type: 'postback', data: 'call_police_191' },
            position: { x: 0, y: 0, width: 833, height: 843 },
            style: {
              backgroundColor: '#F44336',
              textColor: '#FFFFFF',
              fontSize: 20,
              borderRadius: 10,
              icon: '👮‍♂️'
            }
          },
          {
            id: 'call_thaicert',
            text: 'โทร 1441 ThaiCERT',
            textTh: 'โทร 1441 ThaiCERT',
            textEn: 'Call 1441 ThaiCERT',
            action: { type: 'postback', data: 'call_thaicert_1441' },
            position: { x: 833, y: 0, width: 834, height: 843 },
            style: {
              backgroundColor: '#FF5722',
              textColor: '#FFFFFF',
              fontSize: 20,
              borderRadius: 10,
              icon: '🛡️'
            }
          },
          {
            id: 'confirm_safe',
            text: 'ยืนยันปลอดภัย',
            textTh: 'ยืนยันปลอดภัย',
            textEn: 'Confirm Safe',
            action: { type: 'postback', data: 'confirm_safe' },
            position: { x: 1667, y: 0, width: 833, height: 843 },
            style: {
              backgroundColor: '#4CAF50',
              textColor: '#FFFFFF',
              fontSize: 20,
              borderRadius: 10,
              icon: '✅'
            }
          }
        ]
      }
    };
  }

  private getMinimalMenuTemplate(): RichMenuTemplate {
    return {
      id: 'minimal_menu',
      name: 'เมนูแบบย่อ - ProtectCyber',
      description: 'เมนูแบบย่อสำหรับการใช้งานเบื้องต้น',
      size: { width: 2500, height: 843 },
      chatBarText: '🛡️ เมนูย่อ',
      selected: false,
      layout: 'custom',
      areas: [
        {
          bounds: { x: 0, y: 0, width: 1250, height: 843 },
          action: { type: 'postback', data: 'quick_check' }
        },
        {
          bounds: { x: 1250, y: 0, width: 1250, height: 843 },
          action: { type: 'postback', data: 'quick_help' }
        }
      ],
      imageConfig: {
        width: 2500,
        height: 843,
        backgroundColor: '#F5F5F5',
        style: 'minimal',
        buttons: [
          {
            id: 'quick_check',
            text: 'ตรวจสอบด่วน',
            textTh: 'ตรวจสอบด่วน',
            textEn: 'Quick Check',
            action: { type: 'postback', data: 'quick_check' },
            position: { x: 0, y: 0, width: 1250, height: 843 },
            style: {
              backgroundColor: '#E3F2FD',
              textColor: '#1976D2',
              fontSize: 18,
              borderRadius: 5,
              icon: '⚡'
            }
          },
          {
            id: 'quick_help',
            text: 'ช่วยเหลือด่วน',
            textTh: 'ช่วยเหลือด่วน',
            textEn: 'Quick Help',
            action: { type: 'postback', data: 'quick_help' },
            position: { x: 1250, y: 0, width: 1250, height: 843 },
            style: {
              backgroundColor: '#FFF3E0',
              textColor: '#F57C00',
              fontSize: 18,
              borderRadius: 5,
              icon: '🆘'
            }
          }
        ]
      }
    };
  }
}

// Export singleton instance
export const richMenuClient = new RichMenuClientService();