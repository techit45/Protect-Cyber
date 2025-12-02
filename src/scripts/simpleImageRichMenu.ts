/**
 * Simple Image Rich Menu
 * ใช้รูปภาพที่ผู้ใช้อัปโหลดมาแล้วสำหรับ Rich Menu
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

class SimpleImageRichMenu {
  private readonly MENU_WIDTH = 2500;
  private readonly MENU_HEIGHT = 1686;

  /**
   * สร้าง Rich Menu ด้วยรูปภาพแรกที่หาได้
   */
  async deployRichMenu(): Promise<string> {
    try {
      console.log('🎨 Starting Simple Image Rich Menu deployment...');
      
      // ใช้รูปภาพ lightweight ที่สร้างไว้
      const assetsPath = path.join(__dirname, '../assets/rich-menu-images');
      const selectedImage = 'lightweight-rich-menu.png';
      const imagePath = path.join(assetsPath, selectedImage);
      
      if (!fs.existsSync(imagePath)) {
        throw new Error(`❌ Lightweight Rich Menu image not found: ${imagePath}`);
      }
      const imageBuffer = fs.readFileSync(imagePath);
      
      console.log(`📷 Using image: ${selectedImage}`);
      console.log(`📏 Image size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);

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
      const mimeType = selectedImage.endsWith('.png') ? 'image/png' : 'image/jpeg';
      await client.setRichMenuImage(richMenuId, imageBuffer, mimeType);
      console.log('✅ Rich Menu image uploaded successfully');

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
   * ตรวจสอบรูปภาพที่มีอยู่
   */
  async checkAvailableImages(): Promise<void> {
    try {
      const assetsPath = path.join(__dirname, '../assets/rich-menu-images');
      
      if (!fs.existsSync(assetsPath)) {
        console.log('📁 Assets directory not found, creating...');
        fs.mkdirSync(assetsPath, { recursive: true });
      }
      
      const allFiles = fs.readdirSync(assetsPath);
      const imageFiles = allFiles.filter(file => 
        file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
      );
      
      console.log('📷 Available images:');
      imageFiles.forEach((file, index) => {
        const filePath = path.join(assetsPath, file);
        const stats = fs.statSync(filePath);
        console.log(`${index + 1}. ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
      });
      
      if (imageFiles.length === 0) {
        console.log('❌ No image files found. Please add PNG/JPG images to assets/rich-menu-images/');
      }
      
    } catch (error) {
      console.error('❌ Error checking images:', error);
    }
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Simple Image Rich Menu deployment...');
    
    // ตรวจสอบ environment variables
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN === 'your_line_channel_access_token_here') {
      console.error('❌ Please set LINE_CHANNEL_ACCESS_TOKEN in .env file');
      process.exit(1);
    }
    
    const deployer = new SimpleImageRichMenu();
    
    // ตรวจสอบรูปภาพที่มีอยู่
    await deployer.checkAvailableImages();
    
    // ลบ Rich Menu เก่าก่อน
    await deployer.deleteAllRichMenus();
    
    // สร้าง Rich Menu ใหม่
    const richMenuId = await deployer.deployRichMenu();
    
    console.log('\n🎉 Simple Image Rich Menu deployment completed successfully!');
    console.log(`📱 Rich Menu ID: ${richMenuId}`);
    console.log('📋 Rich Menu is now active in LINE app!');
    
  } catch (error) {
    console.error('\n❌ Simple Image Rich Menu deployment failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { SimpleImageRichMenu };