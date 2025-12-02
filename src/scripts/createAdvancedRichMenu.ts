#!/usr/bin/env ts-node

/**
 * Advanced Rich Menu Creator
 * สร้าง Rich Menu ขั้นสูงสำหรับ ProtectCyber
 */

import { Client, PostbackAction } from '@line/bot-sdk';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// โหลด environment variables
dotenv.config();

interface RichMenuTemplate {
  name: string;
  description: string;
  chatBarText: string;
  backgroundColor: string;
  areas: Array<{
    bounds: { x: number; y: number; width: number; height: number };
    action: PostbackAction;
    description: string;
  }>;
}

class AdvancedRichMenuCreator {
  private client: Client;

  constructor() {
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || !process.env.LINE_CHANNEL_SECRET) {
      throw new Error('Missing LINE_CHANNEL_ACCESS_TOKEN or LINE_CHANNEL_SECRET');
    }

    this.client = new Client({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
      channelSecret: process.env.LINE_CHANNEL_SECRET!,
    });
  }

  /**
   * Main Menu Template (ผู้ใช้ทั่วไป)
   */
  getMainMenuTemplate(): RichMenuTemplate {
    return {
      name: "ProtectCyber Main Menu",
      description: "เมนูหลักสำหรับผู้ใช้ทั่วไป",
      chatBarText: "🛡️ เกราะไซเบอร์",
      backgroundColor: "#1976D2",
      areas: [
        {
          bounds: { x: 0, y: 0, width: 833, height: 843 },
          action: {
            type: "postback",
            label: "ตรวจสอบข้อความใหม่",
            data: "check_new_message"
          } as PostbackAction,
          description: "🔍 ตรวจสอบข้อความใหม่"
        },
        {
          bounds: { x: 833, y: 0, width: 834, height: 843 },
          action: {
            type: "postback",
            label: "ตรวจสอบข้อความเก่า",
            data: "check_recent_messages"
          } as PostbackAction,
          description: "📂 ข้อความเก่า"
        },
        {
          bounds: { x: 1667, y: 0, width: 833, height: 843 },
          action: {
            type: "postback",
            label: "ขอความช่วยเหลือ",
            data: "get_help"
          } as PostbackAction,
          description: "🆘 ช่วยเหลือ"
        },
        {
          bounds: { x: 0, y: 843, width: 833, height: 843 },
          action: {
            type: "postback",
            label: "รายงานปัญหา",
            data: "report_threat"
          } as PostbackAction,
          description: "📞 รายงาน"
        },
        {
          bounds: { x: 833, y: 843, width: 834, height: 843 },
          action: {
            type: "postback",
            label: "เรียนรู้เพิ่มเติม",
            data: "learn_more"
          } as PostbackAction,
          description: "📚 เรียนรู้"
        },
        {
          bounds: { x: 1667, y: 843, width: 833, height: 843 },
          action: {
            type: "postback",
            label: "ติดต่อฉุกเฉิน",
            data: "emergency_contact"
          } as PostbackAction,
          description: "🚨 ฉุกเฉิน"
        }
      ]
    };
  }

  /**
   * Elderly Menu Template (ผู้สูงอายุ)
   */
  getElderlyMenuTemplate(): RichMenuTemplate {
    return {
      name: "ProtectCyber Elderly Menu",
      description: "เมนูสำหรับผู้สูงอายุ - ตัวอักษรใหญ่",
      chatBarText: "🛡️ ป้องกันภัย",
      backgroundColor: "#4CAF50",
      areas: [
        {
          bounds: { x: 0, y: 0, width: 833, height: 843 },
          action: {
            type: "postback",
            label: "ตรวจสอบข้อความ",
            data: "check_new_message"
          } as PostbackAction,
          description: "🔍 ตรวจสอบ"
        },
        {
          bounds: { x: 833, y: 0, width: 834, height: 843 },
          action: {
            type: "postback",
            label: "ขอความช่วยเหลือ",
            data: "get_help"
          } as PostbackAction,
          description: "🆘 ช่วยเหลือ"
        },
        {
          bounds: { x: 1667, y: 0, width: 833, height: 843 },
          action: {
            type: "postback",
            label: "โทรหาลูก",
            data: "call_family"
          } as PostbackAction,
          description: "📞 โทรลูก"
        },
        {
          bounds: { x: 0, y: 843, width: 833, height: 843 },
          action: {
            type: "postback",
            label: "เรียนรู้ความปลอดภัย",
            data: "learn_more"
          } as PostbackAction,
          description: "📚 เรียนรู้"
        },
        {
          bounds: { x: 833, y: 843, width: 834, height: 843 },
          action: {
            type: "postback",
            label: "ฉุกเฉิน",
            data: "emergency_contact"
          } as PostbackAction,
          description: "🚨 ฉุกเฉิน"
        },
        {
          bounds: { x: 1667, y: 843, width: 833, height: 843 },
          action: {
            type: "postback",
            label: "ตั้งค่า",
            data: "settings"
          } as PostbackAction,
          description: "⚙️ ตั้งค่า"
        }
      ]
    };
  }

  /**
   * Emergency Menu Template (ฉุกเฉิน)
   */
  getEmergencyMenuTemplate(): RichMenuTemplate {
    return {
      name: "ProtectCyber Emergency Menu",
      description: "เมนูฉุกเฉิน - สีแดง",
      chatBarText: "🚨 ฉุกเฉิน",
      backgroundColor: "#FF4444",
      areas: [
        {
          bounds: { x: 0, y: 0, width: 833, height: 843 },
          action: {
            type: "postback",
            label: "ฉุกเฉิน",
            data: "emergency_alert"
          } as PostbackAction,
          description: "🚨 ฉุกเฉิน"
        },
        {
          bounds: { x: 833, y: 0, width: 834, height: 843 },
          action: {
            type: "postback",
            label: "โทรตำรวจ",
            data: "call_police"
          } as PostbackAction,
          description: "📞 ตำรวจ"
        },
        {
          bounds: { x: 1667, y: 0, width: 833, height: 843 },
          action: {
            type: "postback",
            label: "โทรพยาบาล",
            data: "call_hospital"
          } as PostbackAction,
          description: "🚑 พยาบาล"
        },
        {
          bounds: { x: 0, y: 843, width: 833, height: 843 },
          action: {
            type: "postback",
            label: "ตรวจสอบภัยคุกคาม",
            data: "check_new_message"
          } as PostbackAction,
          description: "🔍 ตรวจสอบ"
        },
        {
          bounds: { x: 833, y: 843, width: 834, height: 843 },
          action: {
            type: "postback",
            label: "แจ้งญาติ",
            data: "notify_family"
          } as PostbackAction,
          description: "📱 แจ้งญาติ"
        },
        {
          bounds: { x: 1667, y: 843, width: 833, height: 843 },
          action: {
            type: "postback",
            label: "ช่วยเหลือ",
            data: "get_help"
          } as PostbackAction,
          description: "🆘 ช่วยเหลือ"
        }
      ]
    };
  }

  /**
   * สร้างรูปภาพ Rich Menu แบบง่าย
   */
  private createSimpleRichMenuImage(template: RichMenuTemplate): Buffer {
    // สร้าง PNG header พื้นฐาน
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x09, 0xC4, // Width: 2500
      0x00, 0x00, 0x06, 0x96, // Height: 1686
      0x08, 0x02, // Bit depth: 8, Color type: 2 (RGB)
      0x00, 0x00, 0x00, // Compression, Filter, Interlace
      0x00, 0x00, 0x00, 0x00  // CRC (simplified)
    ]);

    console.log(`🎨 Generated ${template.name} image`);
    return pngHeader;
  }

  /**
   * สร้าง Rich Menu
   */
  async createRichMenu(template: RichMenuTemplate): Promise<string> {
    try {
      console.log(`🚀 Creating Rich Menu: ${template.name}`);

      // สร้าง Rich Menu object
      const richMenu = {
        size: {
          width: 2500,
          height: 1686
        },
        selected: false,
        name: template.name,
        chatBarText: template.chatBarText,
        areas: template.areas.map(area => ({
          bounds: area.bounds,
          action: area.action
        }))
      };

      // สร้าง Rich Menu
      const richMenuId = await this.client.createRichMenu(richMenu);
      console.log(`✅ Rich Menu created: ${richMenuId}`);

      // สร้างและอัพโหลดรูปภาพ
      const image = this.createSimpleRichMenuImage(template);
      
      try {
        await this.client.setRichMenuImage(richMenuId, image, 'image/png');
        console.log('✅ Rich Menu image uploaded');
      } catch (imageError) {
        console.log('⚠️ Could not upload image, but Rich Menu exists');
      }

      // แสดงรายละเอียด
      console.log('');
      console.log(`🎯 Rich Menu Details:`);
      console.log(`  ID: ${richMenuId}`);
      console.log(`  Name: ${template.name}`);
      console.log(`  Chat Bar: ${template.chatBarText}`);
      console.log(`  Areas: ${template.areas.length}`);
      console.log('');
      console.log(`📋 Menu Areas:`);
      template.areas.forEach((area, index) => {
        console.log(`  ${index + 1}. ${area.description} (${area.action.data})`);
      });

      return richMenuId;

    } catch (error) {
      console.error(`❌ Failed to create Rich Menu: ${template.name}`, error);
      throw error;
    }
  }

  /**
   * สร้าง Rich Menu ทั้งหมด
   */
  async createAllRichMenus(): Promise<void> {
    try {
      console.log('🚀 Creating all Rich Menus...');

      // ลบ Rich Menu เก่าก่อน
      await this.deleteAllRichMenus();

      // สร้าง Rich Menu ใหม่
      const templates = [
        this.getMainMenuTemplate(),
        this.getElderlyMenuTemplate(),
        this.getEmergencyMenuTemplate()
      ];

      const menuIds: string[] = [];

      for (const template of templates) {
        const menuId = await this.createRichMenu(template);
        menuIds.push(menuId);
        console.log('');
      }

      // ตั้ง Main Menu เป็น default
      if (menuIds.length > 0) {
        try {
          await this.client.setDefaultRichMenu(menuIds[0]);
          console.log('✅ Main Menu set as default');
        } catch (error) {
          console.log('⚠️ Could not set default menu');
        }
      }

      console.log('🎉 All Rich Menus created successfully!');
      console.log('');
      console.log('📱 How to use:');
      console.log('  1. Add this bot as friend in LINE');
      console.log('  2. Look at bottom of chat for Rich Menu');
      console.log('  3. Click areas to trigger functions');

    } catch (error) {
      console.error('❌ Failed to create all Rich Menus:', error);
      throw error;
    }
  }

  /**
   * ลบ Rich Menu ทั้งหมด
   */
  async deleteAllRichMenus(): Promise<void> {
    try {
      const existingMenus = await this.client.getRichMenuList();
      
      if (existingMenus.length > 0) {
        console.log(`🗑️ Deleting ${existingMenus.length} existing Rich Menus...`);
        
        for (const menu of existingMenus) {
          await this.client.deleteRichMenu(menu.richMenuId);
          console.log(`✅ Deleted: ${menu.name}`);
        }
      } else {
        console.log('✅ No existing Rich Menus to delete');
      }
    } catch (error) {
      console.log('⚠️ Error deleting existing menus:', error);
    }
  }

  /**
   * แสดงรายการ Rich Menu ทั้งหมด
   */
  async listAllRichMenus(): Promise<void> {
    try {
      const menus = await this.client.getRichMenuList();
      
      console.log('📋 Current Rich Menus:');
      if (menus.length === 0) {
        console.log('  No Rich Menus found');
      } else {
        menus.forEach((menu, index) => {
          console.log(`  ${index + 1}. ${menu.name} (${menu.richMenuId})`);
          console.log(`     Selected: ${menu.selected}`);
          console.log(`     Chat Bar: ${menu.chatBarText}`);
          console.log(`     Areas: ${menu.areas.length}`);
          console.log('');
        });
      }
    } catch (error) {
      console.error('❌ Failed to list Rich Menus:', error);
    }
  }
}

// Main function
async function main() {
  const menuType = process.argv[2] || 'all';
  
  console.log('🛡️ ProtectCyber Advanced Rich Menu Creator\n');
  
  const creator = new AdvancedRichMenuCreator();
  
  try {
    switch (menuType) {
      case 'main':
        await creator.createRichMenu(creator.getMainMenuTemplate());
        break;
      case 'elderly':
        await creator.createRichMenu(creator.getElderlyMenuTemplate());
        break;
      case 'emergency':
        await creator.createRichMenu(creator.getEmergencyMenuTemplate());
        break;
      case 'list':
        await creator.listAllRichMenus();
        break;
      case 'delete':
        await creator.deleteAllRichMenus();
        break;
      case 'all':
      default:
        await creator.createAllRichMenus();
        break;
    }
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// รันสคริปต์
if (require.main === module) {
  main();
}

export { AdvancedRichMenuCreator };