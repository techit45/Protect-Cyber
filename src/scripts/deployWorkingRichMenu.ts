/**
 * Deploy Working Rich Menu
 * สร้าง Rich Menu ที่ใช้งานได้จริงพร้อมรูปภาพ PNG
 */

import { Client } from '@line/bot-sdk';
import * as dotenv from 'dotenv';
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '/Users/techit/Desktop/Code/ProtectCyber/.env' });

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!
});

class WorkingRichMenuDeploy {
  private readonly MENU_WIDTH = 2500;
  private readonly MENU_HEIGHT = 1686;

  /**
   * สร้างรูปภาพ Rich Menu แบบ PNG
   */
  private createRichMenuImage(): Buffer {
    const canvas = createCanvas(this.MENU_WIDTH, this.MENU_HEIGHT);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, this.MENU_WIDTH, this.MENU_HEIGHT);

    // Button Background
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 4;
    ctx.roundRect(50, 50, 2400, 1586, 30);
    ctx.fill();
    ctx.stroke();

    // Icon Circle
    ctx.beginPath();
    ctx.arc(1250, 500, 150, 0, 2 * Math.PI);
    ctx.fillStyle = '#2E7D32';
    ctx.fill();

    // Magnifying Glass Icon
    ctx.beginPath();
    ctx.arc(1200, 450, 80, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 12;
    ctx.stroke();

    // Handle
    ctx.beginPath();
    ctx.moveTo(1265, 515);
    ctx.lineTo(1320, 570);
    ctx.lineCap = 'round';
    ctx.stroke();

    // Main Text
    ctx.fillStyle = '#2E7D32';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ตรวจสอบข้อความใหม่', 1250, 750);

    // Subtitle
    ctx.fillStyle = '#666666';
    ctx.font = '48px Arial';
    ctx.fillText('แตะเพื่อเริ่มตรวจสอบความปลอดภัย', 1250, 850);

    // Bottom Border
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(0, 1580, this.MENU_WIDTH, 106);

    // Bottom Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('🛡️ ProtectCyber - เกราะไซเบอร์ เวอร์ชั่นฟรี', 1250, 1650);

    return canvas.toBuffer('image/png');
  }

  /**
   * Deploy Rich Menu
   */
  async deployRichMenu(): Promise<string> {
    try {
      console.log('🎨 Starting Rich Menu deployment...');
      
      // สร้างรูปภาพ Rich Menu
      const imageBuffer = this.createRichMenuImage();
      console.log('📷 Rich Menu image created successfully');
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
      await client.setRichMenuImage(richMenuId, imageBuffer, 'image/png');
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
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Working Rich Menu deployment...');
    
    // ตรวจสอบ environment variables
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN === 'your_line_channel_access_token_here') {
      console.error('❌ Please set LINE_CHANNEL_ACCESS_TOKEN in .env file');
      process.exit(1);
    }
    
    const deployer = new WorkingRichMenuDeploy();
    
    // ลบ Rich Menu เก่าก่อน
    await deployer.deleteAllRichMenus();
    
    // สร้าง Rich Menu ใหม่
    const richMenuId = await deployer.deployRichMenu();
    
    console.log('\n🎉 Working Rich Menu deployment completed successfully!');
    console.log(`📱 Rich Menu ID: ${richMenuId}`);
    console.log('📋 Rich Menu is now active in LINE app!');
    
  } catch (error) {
    console.error('\n❌ Working Rich Menu deployment failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { WorkingRichMenuDeploy };