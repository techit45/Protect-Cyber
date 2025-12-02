/**
 * Deploy Compact Rich Menu
 * สร้าง Rich Menu ที่มีขนาดเล็กและไม่บังปุ่มอื่น
 */

import { Client } from '@line/bot-sdk';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '/Users/techit/Desktop/Code/ProtectCyber/.env' });

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!
});

class CompactRichMenuDeploy {
  private readonly MENU_WIDTH = 2500;
  private readonly MENU_HEIGHT = 843; // ลดความสูงลงมาเป็นครึ่งเดียว

  /**
   * สร้าง Rich Menu แบบกระทัดรัด
   */
  async deployCompactRichMenu(): Promise<string> {
    try {
      console.log('🎨 Starting Compact Rich Menu deployment...');

      // สร้าง Rich Menu configuration แบบกระทัดรัด
      const richMenuConfig = {
        size: {
          width: this.MENU_WIDTH,
          height: this.MENU_HEIGHT
        },
        selected: true,
        name: "ProtectCyber Compact Menu",
        chatBarText: "เมนูหลัก",
        areas: [
          // ปุ่มตรวจสอบข้อความ (ซ้าย)
          {
            bounds: {
              x: 0,
              y: 0,
              width: 834,
              height: this.MENU_HEIGHT
            },
            action: {
              type: 'postback' as const,
              data: 'check_new_message',
              displayText: 'ตรวจสอบข้อความใหม่'
            }
          },
          // ปุ่มช่วยเหลือ (กลาง)
          {
            bounds: {
              x: 834,
              y: 0,
              width: 832,
              height: this.MENU_HEIGHT
            },
            action: {
              type: 'postback' as const,
              data: 'help_support',
              displayText: 'ช่วยเหลือและสนับสนุน'
            }
          },
          // ปุ่มประวัติ (ขวา)
          {
            bounds: {
              x: 1666,
              y: 0,
              width: 834,
              height: this.MENU_HEIGHT
            },
            action: {
              type: 'postback' as const,
              data: 'view_history',
              displayText: 'ดูประวัติการตรวจสอบ'
            }
          }
        ]
      };

      console.log('📋 Creating Compact Rich Menu (no image needed)...');
      const richMenuId = await client.createRichMenu(richMenuConfig);
      console.log(`✅ Rich Menu created with ID: ${richMenuId}`);

      console.log('🎯 Setting as default Rich Menu...');
      await client.setDefaultRichMenu(richMenuId);
      console.log('✅ Rich Menu set as default successfully');

      return richMenuId;

    } catch (error) {
      console.error('❌ Error deploying Compact Rich Menu:', error);
      throw error;
    }
  }

  /**
   * ลบ Rich Menu ทั้งหมด
   */
  async deleteAllRichMenus(): Promise<void> {
    try {
      console.log('🗑️ Deleting all Rich Menus...');
      
      const richMenus = await client.getRichMenuList();
      
      if (richMenus.length === 0) {
        console.log('📭 No Rich Menus to delete');
        return;
      }
      
      for (const richMenu of richMenus) {
        await client.deleteRichMenu(richMenu.richMenuId);
        console.log(`🗑️ Deleted Rich Menu: ${richMenu.richMenuId}`);
      }
      
      console.log('✅ All Rich Menus deleted successfully');
      
    } catch (error) {
      console.error('❌ Error deleting Rich Menus:', error);
      throw error;
    }
  }

  /**
   * แสดงรายละเอียด Rich Menu
   */
  async showCompactRichMenuDetails(): Promise<void> {
    try {
      console.log('📋 Compact Rich Menu Layout Details:');
      console.log('🔸 Total Size: 2500x843 pixels (half height)');
      console.log('🔸 Left Button: 834x843 pixels');
      console.log('  - Function: ตรวจสอบข้อความใหม่');
      console.log('  - Color: Green theme (ระบบจะแสดงเป็นสีเขียว)');
      console.log('🔸 Middle Button: 832x843 pixels');
      console.log('  - Function: ช่วยเหลือและสนับสนุน');
      console.log('  - Color: Blue theme (ระบบจะแสดงเป็นสีน้ำเงิน)');
      console.log('🔸 Right Button: 834x843 pixels');
      console.log('  - Function: ดูประวัติการตรวจสอบ');
      console.log('  - Color: Gray theme (ระบบจะแสดงเป็นสีเทา)');
      console.log('');
      console.log('🎯 Text-only menu - ไม่ใช้รูปภาพ ไม่บังปุ่มอื่น');
      console.log('📱 เหมาะสำหรับผู้สูงอายุ - ปุ่มใหญ่ ข้อความชัด');
      
    } catch (error) {
      console.error('❌ Error showing Rich Menu details:', error);
    }
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Compact Rich Menu deployment...');
    
    // ตรวจสอบ environment variables
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN === 'your_line_channel_access_token_here') {
      console.error('❌ Please set LINE_CHANNEL_ACCESS_TOKEN in .env file');
      process.exit(1);
    }
    
    const deployer = new CompactRichMenuDeploy();
    
    // แสดงรายละเอียด Rich Menu
    await deployer.showCompactRichMenuDetails();
    
    // ลบ Rich Menu เก่าก่อน
    await deployer.deleteAllRichMenus();
    
    // สร้าง Rich Menu ใหม่
    const richMenuId = await deployer.deployCompactRichMenu();
    
    console.log('\n🎉 Compact Rich Menu deployment completed successfully!');
    console.log(`📱 Rich Menu ID: ${richMenuId}`);
    console.log('📋 Rich Menu is now active with compact layout!');
    console.log('');
    console.log('🎯 Features:');
    console.log('  ✅ ปุ่มซ้าย: ตรวจสอบข้อความใหม่');
    console.log('  ✅ ปุ่มกลาง: ช่วยเหลือและสนับสนุน');
    console.log('  ✅ ปุ่มขวา: ดูประวัติการตรวจสอบ');
    console.log('  ✅ ขนาดกระทัดรัด - ไม่บังส่วนอื่น');
    console.log('  ✅ Text-only - โหลดเร็ว ใช้งานง่าย');
    
  } catch (error) {
    console.error('\n❌ Compact Rich Menu deployment failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { CompactRichMenuDeploy };