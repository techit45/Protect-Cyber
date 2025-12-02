/**
 * Simple Rich Menu Deploy
 * Deploy Rich Menu แบบง่ายใช้รูปภาพเดียว
 */

import { Client } from '@line/bot-sdk';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from the correct path
dotenv.config({ path: '/Users/techit/Desktop/Code/ProtectCyber/.env' });

// Check if environment variables are loaded
if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN === 'your_line_channel_access_token_here') {
  console.error('❌ Please set LINE_CHANNEL_ACCESS_TOKEN in .env file');
  console.log('📝 Edit .env file and add your LINE Channel Access Token');
  process.exit(1);
}

if (!process.env.LINE_CHANNEL_SECRET || process.env.LINE_CHANNEL_SECRET === 'your_line_channel_secret_here') {
  console.error('❌ Please set LINE_CHANNEL_SECRET in .env file');
  console.log('📝 Edit .env file and add your LINE Channel Secret');
  process.exit(1);
}

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
});

class SimpleRichMenuDeploy {
  private readonly MENU_WIDTH = 2500;
  private readonly MENU_HEIGHT = 1686;

  /**
   * สร้างและ Deploy Rich Menu
   */
  async deployRichMenu(): Promise<string> {
    try {
      console.log('🎨 Starting Rich Menu deployment...');
      
      // ใช้ไฟล์ SVG ที่เล็กลง
      const imagePath = path.join(__dirname, '../assets/rich-menu-images/simple-rich-menu.svg');
      
      if (!fs.existsSync(imagePath)) {
        throw new Error(`❌ Image not found: ${imagePath}`);
      }
      
      const imageBuffer = fs.readFileSync(imagePath);
      console.log('📷 Rich Menu SVG loaded successfully');
      console.log(`📏 File size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
      
      // สร้าง Rich Menu configuration
      const richMenuConfig = {
        size: {
          width: this.MENU_WIDTH,
          height: this.MENU_HEIGHT
        },
        selected: true,
        name: "ProtectCyber Menu - Free Package",
        chatBarText: "เมนูหลัก",
        areas: [
          {
            bounds: {
              x: 0,
              y: 0,
              width: this.MENU_WIDTH,
              height: this.MENU_HEIGHT
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
      
      console.log('📤 Uploading Rich Menu image...');
      await client.setRichMenuImage(richMenuId, imageBuffer, 'image/svg+xml');
      console.log('✅ Rich Menu SVG uploaded successfully');
      
      console.log('🎯 Setting as default Rich Menu...');
      await client.setDefaultRichMenu(richMenuId);
      console.log('✅ Rich Menu set as default successfully');
      
      return richMenuId;
      
    } catch (error) {
      console.error('❌ Error deploying Rich Menu:', error);
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
   * แสดงรายการ Rich Menu ทั้งหมด
   */
  async listRichMenus(): Promise<void> {
    try {
      console.log('📋 Listing all Rich Menus...');
      
      const richMenus = await client.getRichMenuList();
      
      if (richMenus.length === 0) {
        console.log('📭 No Rich Menus found');
        return;
      }
      
      richMenus.forEach((richMenu, index) => {
        console.log(`${index + 1}. Rich Menu ID: ${richMenu.richMenuId}`);
        console.log(`   Name: ${richMenu.name}`);
        console.log(`   Chat Bar Text: ${richMenu.chatBarText}`);
        console.log(`   Selected: ${richMenu.selected}`);
        console.log(`   Size: ${richMenu.size.width}x${richMenu.size.height}`);
        console.log(`   Areas: ${richMenu.areas.length}`);
        console.log('');
      });
      
    } catch (error) {
      console.error('❌ Error listing Rich Menus:', error);
      throw error;
    }
  }
}

// ฟังก์ชันหลักสำหรับรัน script
async function main() {
  try {
    const deployer = new SimpleRichMenuDeploy();
    
    // ลบ Rich Menu เก่าก่อน
    await deployer.deleteAllRichMenus();
    
    // สร้าง Rich Menu ใหม่
    const richMenuId = await deployer.deployRichMenu();
    
    console.log('\n🎉 Rich Menu deployment completed successfully!');
    console.log(`Rich Menu ID: ${richMenuId}`);
    
    // แสดงรายการ Rich Menu
    await deployer.listRichMenus();
    
    console.log('\n📱 Rich Menu is now active in LINE app!');
    
  } catch (error) {
    console.error('\n❌ Rich Menu deployment failed:', error);
    process.exit(1);
  }
}

// รันถ้าเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  main();
}

export { SimpleRichMenuDeploy };