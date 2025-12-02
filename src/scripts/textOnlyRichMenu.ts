/**
 * Text-Only Rich Menu
 * สร้าง Rich Menu ที่ไม่ต้องใช้รูปภาพ
 */

import { Client } from '@line/bot-sdk';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: '/Users/techit/Desktop/Code/ProtectCyber/.env' });

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!
});

class TextOnlyRichMenu {
  async createTextOnlyRichMenu(): Promise<string> {
    try {
      console.log('🎨 Creating Text-Only Rich Menu...');
      
      // สร้าง Rich Menu configuration
      const richMenuConfig = {
        size: {
          width: 2500,
          height: 1686
        },
        selected: true,
        name: "ProtectCyber Text Menu",
        chatBarText: "🛡️ ป้องกันภัย",
        areas: [
          {
            bounds: {
              x: 0,
              y: 0,
              width: 2500,
              height: 1686
            },
            action: {
              type: 'postback' as const,
              data: 'check_new_message'
            }
          }
        ]
      };
      
      console.log('📋 Creating Rich Menu...');
      const richMenuId = await client.createRichMenu(richMenuConfig);
      console.log(`✅ Rich Menu created with ID: ${richMenuId}`);
      
      // ไม่ต้องอัปโหลดรูปภาพ - ใช้ Rich Menu แบบไม่มีรูป
      
      console.log('🎯 Setting as default Rich Menu...');
      await client.setDefaultRichMenu(richMenuId);
      console.log('✅ Rich Menu set as default successfully');
      
      return richMenuId;
      
    } catch (error) {
      console.error('❌ Error creating text-only Rich Menu:', error);
      throw error;
    }
  }

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
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Text-Only Rich Menu deployment...');
    
    // ตรวจสอบ environment variables
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN === 'your_line_channel_access_token_here') {
      console.error('❌ Please set LINE_CHANNEL_ACCESS_TOKEN in .env file');
      process.exit(1);
    }
    
    const deployer = new TextOnlyRichMenu();
    
    // ลบ Rich Menu เก่าก่อน
    await deployer.deleteAllRichMenus();
    
    // สร้าง Rich Menu ใหม่
    const richMenuId = await deployer.createTextOnlyRichMenu();
    
    console.log('\n🎉 Text-Only Rich Menu deployment completed successfully!');
    console.log(`📱 Rich Menu ID: ${richMenuId}`);
    console.log('📋 Rich Menu will appear as a text button in LINE app');
    console.log('🔧 No image needed - uses default LINE Rich Menu appearance');
    
  } catch (error) {
    console.error('\n❌ Text-Only Rich Menu deployment failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { TextOnlyRichMenu };