/**
 * Deploy 4-Button Rich Menu (2 Rows Layout)
 * สร้าง Rich Menu แบบ 4 ปุ่ม 2 แถว สำหรับผู้สูงอายุ
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

class FourButtonRichMenuDeploy {
  private readonly MENU_WIDTH = 2400;
  private readonly MENU_HEIGHT = 1618; // 809px + 809px
  private readonly TOP_ROW_HEIGHT = 809;
  private readonly BOTTOM_ROW_HEIGHT = 809;
  private readonly BOTTOM_BUTTON_WIDTH = 800;

  /**
   * สร้าง Rich Menu แบบ 4 ปุ่ม 2 แถว
   */
  async deploy4ButtonRichMenu(): Promise<string> {
    try {
      console.log('🎨 Starting 4-Button Rich Menu deployment...');
      
      const assetsPath = path.join(__dirname, '../assets/rich-menu-images');
      const imagePath = path.join(assetsPath, '4-button-rich-menu.png');
      
      if (!fs.existsSync(imagePath)) {
        throw new Error(`❌ 4-button Rich Menu image not found: ${imagePath}`);
      }
      
      const imageBuffer = fs.readFileSync(imagePath);
      const sizeKB = (imageBuffer.length / 1024).toFixed(2);
      
      console.log(`📷 Using 4-button Rich Menu image: ${sizeKB} KB`);

      // สร้าง Rich Menu configuration แบบ 4 ปุ่ม 2 แถว
      const richMenuConfig = {
        size: {
          width: this.MENU_WIDTH,
          height: this.MENU_HEIGHT
        },
        selected: true,
        name: "ProtectCyber 4-Button Menu",
        chatBarText: "เมนูหลัก",
        areas: [
          // ปุ่มหลัก - ตรวจสอบข้อความ (แถวบนเต็มความกว้าง)
          {
            bounds: {
              x: 0,
              y: 0,
              width: this.MENU_WIDTH, // 2400px
              height: this.TOP_ROW_HEIGHT // 809px
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
              y: this.TOP_ROW_HEIGHT, // 809px
              width: this.BOTTOM_BUTTON_WIDTH, // 800px
              height: this.BOTTOM_ROW_HEIGHT // 809px
            },
            action: {
              type: 'postback' as const,
              data: 'help_support',
              displayText: 'ช่วยเหลือและสนับสนุน'
            }
          },
          // ปุ่มตั้งค่า (แถวล่าง กลาง)
          {
            bounds: {
              x: this.BOTTOM_BUTTON_WIDTH, // 800px
              y: this.TOP_ROW_HEIGHT, // 809px
              width: this.BOTTOM_BUTTON_WIDTH, // 800px
              height: this.BOTTOM_ROW_HEIGHT // 809px
            },
            action: {
              type: 'postback' as const,
              data: 'settings_menu',
              displayText: 'ตั้งค่าและสถิติ'
            }
          },
          // ปุ่มความรู้ (แถวล่าง ขวา)
          {
            bounds: {
              x: this.BOTTOM_BUTTON_WIDTH * 2, // 1600px
              y: this.TOP_ROW_HEIGHT, // 809px
              width: this.BOTTOM_BUTTON_WIDTH, // 800px
              height: this.BOTTOM_ROW_HEIGHT // 809px
            },
            action: {
              type: 'postback' as const,
              data: 'knowledge_center',
              displayText: 'ความรู้และการศึกษา'
            }
          }
        ]
      };

      console.log('📋 Creating 4-Button Rich Menu...');
      const richMenuId = await client.createRichMenu(richMenuConfig);
      console.log(`✅ Rich Menu created with ID: ${richMenuId}`);

      console.log('📤 Uploading 4-Button Rich Menu image...');
      await client.setRichMenuImage(richMenuId, imageBuffer, 'image/png');
      console.log('✅ Rich Menu image uploaded successfully');

      console.log('🎯 Setting as default Rich Menu...');
      await client.setDefaultRichMenu(richMenuId);
      console.log('✅ Rich Menu set as default successfully');

      return richMenuId;

    } catch (error) {
      console.error('❌ Error deploying 4-Button Rich Menu:', error);
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
  async show4ButtonRichMenuDetails(): Promise<void> {
    try {
      console.log('📋 4-Button Rich Menu Layout Details:');
      console.log('🔸 Total Size: 2400x1618 pixels (2 rows)');
      console.log('🔸 Top Button (Main): 2400x809 pixels');
      console.log('  - Function: ตรวจสอบข้อความใหม่');
      console.log('  - Position: Full width top row');
      console.log('  - Data: check_new_message');
      console.log('🔸 Bottom Left Button (Help): 800x809 pixels');
      console.log('  - Function: ช่วยเหลือและสนับสนุน');
      console.log('  - Position: 0-800px');
      console.log('  - Data: help_support');
      console.log('🔸 Bottom Middle Button (Settings): 800x809 pixels');
      console.log('  - Function: ตั้งค่าและสถิติ');
      console.log('  - Position: 800-1600px');
      console.log('  - Data: settings_menu');
      console.log('🔸 Bottom Right Button (Knowledge): 800x809 pixels');
      console.log('  - Function: ความรู้และการศึกษา');
      console.log('  - Position: 1600-2400px');
      console.log('  - Data: knowledge_center');
      console.log('');
      console.log('🎯 Perfect for elderly users - large buttons, clear layout');
      console.log('📱 2 rows design - easy to reach and understand');
      
    } catch (error) {
      console.error('❌ Error showing Rich Menu details:', error);
    }
  }

  /**
   * สร้างรูปภาพ Rich Menu ด้วย Canvas (ถ้าไม่มีรูป)
   */
  async createDefault4ButtonImage(): Promise<void> {
    try {
      const canvas = require('canvas').createCanvas(this.MENU_WIDTH, this.MENU_HEIGHT);
      const ctx = canvas.getContext('2d');

      // พื้นหลัง
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, this.MENU_WIDTH, this.MENU_HEIGHT);

      // ปุ่มหลัก (แถวบน)
      ctx.fillStyle = '#e8f5e8';
      ctx.fillRect(10, 10, this.MENU_WIDTH - 20, this.TOP_ROW_HEIGHT - 20);
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, this.MENU_WIDTH - 20, this.TOP_ROW_HEIGHT - 20);

      // ข้อความปุ่มหลัก
      ctx.fillStyle = '#2E7D32';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ตรวจสอบข้อความ', this.MENU_WIDTH / 2, this.TOP_ROW_HEIGHT / 2 + 20);

      // ปุ่มแถวล่าง
      const bottomButtons = [
        { x: 0, color: '#e3f2fd', borderColor: '#1976D2', text: 'ช่วยเหลือ' },
        { x: this.BOTTOM_BUTTON_WIDTH, color: '#fff3e0', borderColor: '#F57C00', text: 'ตั้งค่า' },
        { x: this.BOTTOM_BUTTON_WIDTH * 2, color: '#f3e5f5', borderColor: '#7B1FA2', text: 'ความรู้' }
      ];

      bottomButtons.forEach(button => {
        const startY = this.TOP_ROW_HEIGHT;
        
        // พื้นหลังปุ่ม
        ctx.fillStyle = button.color;
        ctx.fillRect(button.x + 10, startY + 10, this.BOTTOM_BUTTON_WIDTH - 20, this.BOTTOM_ROW_HEIGHT - 20);
        
        // ขอบปุ่ม
        ctx.strokeStyle = button.borderColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(button.x + 10, startY + 10, this.BOTTOM_BUTTON_WIDTH - 20, this.BOTTOM_ROW_HEIGHT - 20);
        
        // ข้อความ
        ctx.fillStyle = button.borderColor;
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(button.text, button.x + this.BOTTOM_BUTTON_WIDTH / 2, startY + this.BOTTOM_ROW_HEIGHT / 2 + 15);
      });

      // แถบล่าง
      ctx.fillStyle = '#2E7D32';
      ctx.fillRect(0, this.MENU_HEIGHT - 20, this.MENU_WIDTH, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('ProtectCyber - เกราะไซเบอร์', this.MENU_WIDTH / 2, this.MENU_HEIGHT - 5);

      // บันทึกไฟล์
      const outputPath = path.join(__dirname, '../assets/rich-menu-images/4-button-rich-menu.png');
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);
      
      console.log('✅ Default 4-button Rich Menu image created successfully!');
      console.log(`📁 File saved to: ${outputPath}`);
      console.log(`💾 File size: ${(buffer.length / 1024).toFixed(2)} KB`);

    } catch (error) {
      console.error('❌ Error creating default image:', error);
    }
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting 4-Button Rich Menu deployment...');
    
    // ตรวจสอบ environment variables
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN === 'your_line_channel_access_token_here') {
      console.error('❌ Please set LINE_CHANNEL_ACCESS_TOKEN in .env file');
      process.exit(1);
    }
    
    const deployer = new FourButtonRichMenuDeploy();
    
    // แสดงรายละเอียด Rich Menu
    await deployer.show4ButtonRichMenuDetails();
    
    // ตรวจสอบว่ามีรูปภาพหรือไม่ ถ้าไม่มีให้สร้าง
    const imagePath = path.join(__dirname, '../assets/rich-menu-images/4-button-rich-menu.png');
    if (!fs.existsSync(imagePath)) {
      console.log('📷 4-button image not found, creating default...');
      await deployer.createDefault4ButtonImage();
    }
    
    // ลบ Rich Menu เก่าก่อน
    await deployer.deleteAllRichMenus();
    
    // สร้าง Rich Menu ใหม่
    const richMenuId = await deployer.deploy4ButtonRichMenu();
    
    console.log('\n🎉 4-Button Rich Menu deployment completed successfully!');
    console.log(`📱 Rich Menu ID: ${richMenuId}`);
    console.log('📋 Rich Menu is now active with 4-button layout!');
    console.log('');
    console.log('🎯 Layout:');
    console.log('  ✅ Top: ตรวจสอบข้อความ (Full width)');
    console.log('  ✅ Bottom: ช่วยเหลือ | ตั้งค่า | ความรู้');
    console.log('  ✅ Elderly-friendly - large buttons, clear text');
    console.log('  ✅ Perfect 2-row design');
    
  } catch (error) {
    console.error('\n❌ 4-Button Rich Menu deployment failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { FourButtonRichMenuDeploy };