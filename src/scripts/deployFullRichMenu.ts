/**
 * Deploy Full Rich Menu
 * สร้าง Rich Menu ที่ใช้พื้นที่เต็มและมีปุ่มครบทั้ง 3 ปุ่ม
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

class FullRichMenuDeploy {
  private readonly MENU_WIDTH = 2500;
  private readonly MENU_HEIGHT = 1686;

  /**
   * สร้าง Rich Menu ที่ใช้พื้นที่เต็ม
   */
  async deployFullRichMenu(): Promise<string> {
    try {
      console.log('🎨 Starting Full Rich Menu deployment...');
      
      const assetsPath = path.join(__dirname, '../assets/rich-menu-images');
      
      // ใช้ปุ่มหลักเป็นรูปภาพ Rich Menu
      const mainButtonPath = path.join(assetsPath, 'main-button.png');
      
      if (!fs.existsSync(mainButtonPath)) {
        throw new Error(`❌ Main button image not found: ${mainButtonPath}`);
      }
      
      const imageBuffer = fs.readFileSync(mainButtonPath);
      const sizeKB = (imageBuffer.length / 1024).toFixed(2);
      
      console.log(`📷 Using main button image: ${sizeKB} KB`);

      // สร้าง Rich Menu configuration แบบเต็มพื้นที่
      const richMenuConfig = {
        size: {
          width: this.MENU_WIDTH,
          height: this.MENU_HEIGHT
        },
        selected: true,
        name: "ProtectCyber Full Menu",
        chatBarText: "เมนูหลัก",
        areas: [
          // ปุ่มหลัก - ตรวจสอบข้อความ (แถวบนเต็ม)
          {
            bounds: {
              x: 0,
              y: 0,
              width: this.MENU_WIDTH,
              height: 843
            },
            action: {
              type: 'postback' as const,
              data: 'check_new_message',
              displayText: 'ตรวจสอบข้อความใหม่'
            }
          },
          // ปุ่มช่วยเหลือ (แถวล่าง ซ้าย)
          {
            bounds: {
              x: 0,
              y: 843,
              width: 1250,
              height: 843
            },
            action: {
              type: 'postback' as const,
              data: 'help_support',
              displayText: 'ช่วยเหลือและสนับสนุน'
            }
          },
          // ปุ่มประวัติ (แถวล่าง ขวา)
          {
            bounds: {
              x: 1250,
              y: 843,
              width: 1250,
              height: 843
            },
            action: {
              type: 'postback' as const,
              data: 'view_history',
              displayText: 'ดูประวัติการตรวจสอบ'
            }
          }
        ]
      };

      console.log('📋 Creating Full Rich Menu with complete button layout...');
      const richMenuId = await client.createRichMenu(richMenuConfig);
      console.log(`✅ Rich Menu created with ID: ${richMenuId}`);

      console.log('📤 Uploading Rich Menu image...');
      await client.setRichMenuImage(richMenuId, imageBuffer, 'image/png');
      console.log('✅ Rich Menu image uploaded successfully');

      console.log('🎯 Setting as default Rich Menu...');
      await client.setDefaultRichMenu(richMenuId);
      console.log('✅ Rich Menu set as default successfully');

      return richMenuId;

    } catch (error) {
      console.error('❌ Error deploying Full Rich Menu:', error);
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
  async showRichMenuDetails(): Promise<void> {
    try {
      console.log('📋 Rich Menu Layout Details:');
      console.log('🔸 Total Size: 2500x1686 pixels');
      console.log('🔸 Top Button (Main): 2500x843 pixels');
      console.log('  - Function: Check new messages');
      console.log('  - Color: Green theme');
      console.log('  - Position: Top full width');
      console.log('🔸 Bottom Left Button (Help): 1250x843 pixels');
      console.log('  - Function: Help & Support');
      console.log('  - Color: Blue theme');
      console.log('  - Position: Bottom left half');
      console.log('🔸 Bottom Right Button (History): 1250x843 pixels');
      console.log('  - Function: View history');
      console.log('  - Color: Gray theme');
      console.log('  - Position: Bottom right half');
      console.log('');
      console.log('🎯 All clickable areas defined for complete functionality');
      
    } catch (error) {
      console.error('❌ Error showing Rich Menu details:', error);
    }
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Full Rich Menu deployment...');
    
    // ตรวจสอบ environment variables
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN === 'your_line_channel_access_token_here') {
      console.error('❌ Please set LINE_CHANNEL_ACCESS_TOKEN in .env file');
      process.exit(1);
    }
    
    const deployer = new FullRichMenuDeploy();
    
    // แสดงรายละเอียด Rich Menu
    await deployer.showRichMenuDetails();
    
    // ลบ Rich Menu เก่าก่อน
    await deployer.deleteAllRichMenus();
    
    // สร้าง Rich Menu ใหม่
    const richMenuId = await deployer.deployFullRichMenu();
    
    console.log('\n🎉 Full Rich Menu deployment completed successfully!');
    console.log(`📱 Rich Menu ID: ${richMenuId}`);
    console.log('📋 Rich Menu is now active with complete button layout!');
    console.log('');
    console.log('🎯 Features:');
    console.log('  ✅ Top button: ตรวจสอบข้อความใหม่ (Full width)');
    console.log('  ✅ Bottom left: ช่วยเหลือและสนับสนุน');
    console.log('  ✅ Bottom right: ดูประวัติการตรวจสอบ');
    console.log('  ✅ No empty space - full coverage');
    console.log('  ✅ All buttons are clickable');
    
  } catch (error) {
    console.error('\n❌ Full Rich Menu deployment failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { FullRichMenuDeploy };