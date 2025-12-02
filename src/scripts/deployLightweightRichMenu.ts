/**
 * Deploy Lightweight Rich Menu
 * สร้าง Rich Menu ที่ใช้รูปภาพขนาดเล็กและไม่บังปุ่มอื่น
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

class LightweightRichMenuDeploy {
  private readonly MENU_WIDTH = 2500;
  private readonly MENU_HEIGHT = 843; // ใช้ความสูงเท่ากับภาพ

  /**
   * สร้าง Rich Menu แบบ 3 ปุ่มในแถวเดียว
   */
  async deployLightweightRichMenu(): Promise<string> {
    try {
      console.log('🎨 Starting Lightweight Rich Menu deployment...');
      
      const assetsPath = path.join(__dirname, '../assets/rich-menu-images');
      const imagePath = path.join(assetsPath, 'proper-rich-menu.png');
      
      if (!fs.existsSync(imagePath)) {
        throw new Error(`❌ Proper image not found: ${imagePath}`);
      }
      
      const imageBuffer = fs.readFileSync(imagePath);
      const sizeKB = (imageBuffer.length / 1024).toFixed(2);
      
      console.log(`📷 Using proper Rich Menu image: ${sizeKB} KB`);

      // สร้าง Rich Menu configuration แบบ 3 ปุ่มในแถวเดียว
      const richMenuConfig = {
        size: {
          width: this.MENU_WIDTH,
          height: this.MENU_HEIGHT
        },
        selected: true,
        name: "ProtectCyber Lightweight Menu",
        chatBarText: "เมนูหลัก",
        areas: [
          // ปุ่มซ้าย - ตรวจสอบข้อความ (833 pixels wide)
          {
            bounds: {
              x: 0,
              y: 0,
              width: 833,
              height: this.MENU_HEIGHT
            },
            action: {
              type: 'postback' as const,
              data: 'check_new_message',
              displayText: 'ตรวจสอบข้อความใหม่'
            }
          },
          // ปุ่มกลาง - ช่วยเหลือ (834 pixels wide)
          {
            bounds: {
              x: 833,
              y: 0,
              width: 834,
              height: this.MENU_HEIGHT
            },
            action: {
              type: 'postback' as const,
              data: 'help_support',
              displayText: 'ช่วยเหลือและสนับสนุน'
            }
          },
          // ปุ่มขวา - ประวัติ (833 pixels wide)
          {
            bounds: {
              x: 1667,
              y: 0,
              width: 833,
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

      console.log('📋 Creating Lightweight Rich Menu...');
      const richMenuId = await client.createRichMenu(richMenuConfig);
      console.log(`✅ Rich Menu created with ID: ${richMenuId}`);

      console.log('📤 Uploading minimal Rich Menu image...');
      await client.setRichMenuImage(richMenuId, imageBuffer, 'image/png');
      console.log('✅ Rich Menu image uploaded successfully');

      console.log('🎯 Setting as default Rich Menu...');
      await client.setDefaultRichMenu(richMenuId);
      console.log('✅ Rich Menu set as default successfully');

      return richMenuId;

    } catch (error) {
      console.error('❌ Error deploying Lightweight Rich Menu:', error);
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
  async showLightweightRichMenuDetails(): Promise<void> {
    try {
      console.log('📋 Lightweight Rich Menu Layout Details:');
      console.log('🔸 Total Size: 2500x843 pixels (single row)');
      console.log('🔸 Left Button: 833x843 pixels');
      console.log('  - Function: ตรวจสอบข้อความใหม่');
      console.log('  - Position: 0-833px');
      console.log('🔸 Middle Button: 834x843 pixels');
      console.log('  - Function: ช่วยเหลือและสนับสนุน');
      console.log('  - Position: 833-1667px');
      console.log('🔸 Right Button: 833x843 pixels');
      console.log('  - Function: ดูประวัติการตรวจสอบ');
      console.log('  - Position: 1667-2500px');
      console.log('');
      console.log('🎯 Minimal image - ไม่บังปุ่มอื่น');
      console.log('📱 เหมาะสำหรับผู้สูงอายุ - ปุ่มใหญ่ แถวเดียว');
      console.log('💾 ขนาดไฟล์เล็ก - โหลดเร็ว');
      
    } catch (error) {
      console.error('❌ Error showing Rich Menu details:', error);
    }
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Lightweight Rich Menu deployment...');
    
    // ตรวจสอบ environment variables
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN === 'your_line_channel_access_token_here') {
      console.error('❌ Please set LINE_CHANNEL_ACCESS_TOKEN in .env file');
      process.exit(1);
    }
    
    const deployer = new LightweightRichMenuDeploy();
    
    // แสดงรายละเอียด Rich Menu
    await deployer.showLightweightRichMenuDetails();
    
    // ลบ Rich Menu เก่าก่อน
    await deployer.deleteAllRichMenus();
    
    // สร้าง Rich Menu ใหม่
    const richMenuId = await deployer.deployLightweightRichMenu();
    
    console.log('\n🎉 Lightweight Rich Menu deployment completed successfully!');
    console.log(`📱 Rich Menu ID: ${richMenuId}`);
    console.log('📋 Rich Menu is now active with minimal layout!');
    console.log('');
    console.log('🎯 Features:');
    console.log('  ✅ ปุ่มซ้าย: ตรวจสอบข้อความใหม่');
    console.log('  ✅ ปุ่มกลาง: ช่วยเหลือและสนับสนุน');
    console.log('  ✅ ปุ่มขวา: ดูประวัติการตรวจสอบ');
    console.log('  ✅ ไฟล์เล็ก - ไม่บังปุ่มอื่น');
    console.log('  ✅ แถวเดียว - เหมาะกับผู้สูงอายุ');
    
  } catch (error) {
    console.error('\n❌ Lightweight Rich Menu deployment failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { LightweightRichMenuDeploy };