/**
 * Convert JPG to PNG and Deploy 4-Button Rich Menu
 * แปลงรูปภาพ JPG เป็น PNG และ Deploy Rich Menu
 */

import { Client } from '@line/bot-sdk';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
const { createCanvas, loadImage } = require('canvas');

// Load environment variables
dotenv.config({ path: '/Users/techit/Desktop/Code/ProtectCyber/.env' });

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!
});

class ConvertAndDeploy4ButtonRichMenu {
  private readonly MENU_WIDTH = 2400;
  private readonly MENU_HEIGHT = 1618; // 809px + 809px

  /**
   * แปลงรูป JPG เป็น PNG ขนาดที่ถูกต้อง
   */
  async convertJPGtoPNG(): Promise<void> {
    try {
      console.log('🔄 Converting JPG to PNG...');
      
      const jpgPath = path.join(__dirname, '../assets/rich-menu-images/linerichmenu4.jpg');
      const pngPath = path.join(__dirname, '../assets/rich-menu-images/4-button-rich-menu.png');
      
      if (!fs.existsSync(jpgPath)) {
        throw new Error(`❌ JPG file not found: ${jpgPath}`);
      }
      
      // โหลดรูปภาพ JPG
      const image = await loadImage(jpgPath);
      
      // สร้าง canvas ขนาดที่ถูกต้อง
      const canvas = createCanvas(this.MENU_WIDTH, this.MENU_HEIGHT);
      const ctx = canvas.getContext('2d');
      
      // วาดรูปภาพลงใน canvas โดยปรับขนาดให้พอดี
      ctx.drawImage(image, 0, 0, this.MENU_WIDTH, this.MENU_HEIGHT);
      
      // บันทึกเป็น PNG
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(pngPath, buffer);
      
      const sizeKB = (buffer.length / 1024).toFixed(2);
      console.log('✅ JPG converted to PNG successfully!');
      console.log(`📁 Saved to: ${pngPath}`);
      console.log(`📏 Size: ${this.MENU_WIDTH}x${this.MENU_HEIGHT} pixels`);
      console.log(`💾 File size: ${sizeKB} KB`);
      
      if (buffer.length < 1024 * 1024) {
        console.log('✅ File size is within LINE Rich Menu limit (< 1MB)');
      }
      
    } catch (error) {
      console.error('❌ Error converting JPG to PNG:', error);
      throw error;
    }
  }

  /**
   * Deploy Rich Menu แบบ 4 ปุ่ม
   */
  async deploy4ButtonRichMenu(): Promise<string> {
    try {
      console.log('🎨 Starting 4-Button Rich Menu deployment...');
      
      const imagePath = path.join(__dirname, '../assets/rich-menu-images/4-button-rich-menu.png');
      
      if (!fs.existsSync(imagePath)) {
        throw new Error(`❌ PNG file not found: ${imagePath}`);
      }
      
      const imageBuffer = fs.readFileSync(imagePath);
      const sizeKB = (imageBuffer.length / 1024).toFixed(2);
      
      console.log(`📷 Using converted Rich Menu image: ${sizeKB} KB`);

      // สร้าง Rich Menu configuration แบบ 4 ปุ่ม 2 แถว
      const richMenuConfig = {
        size: {
          width: this.MENU_WIDTH,
          height: this.MENU_HEIGHT
        },
        selected: true,
        name: "ProtectCyber 4-Button Menu v2",
        chatBarText: "เมนูหลัก",
        areas: [
          // ปุ่มหลัก - ตรวจสอบข้อความ (แถวบนเต็มความกว้าง)
          {
            bounds: {
              x: 0,
              y: 0,
              width: this.MENU_WIDTH, // 2400px
              height: 809 // แถวบน 809px
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
              y: 809, // เริ่มแถวล่าง
              width: 800, // 800px wide
              height: 809 // 809px high
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
              x: 800,
              y: 809,
              width: 800,
              height: 809
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
              x: 1600,
              y: 809,
              width: 800,
              height: 809
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

      console.log('📤 Uploading Rich Menu image...');
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
  showRichMenuDetails(): void {
    console.log('📋 4-Button Rich Menu Layout Details:');
    console.log('🔸 Total Size: 2400x1618 pixels (2 rows)');
    console.log('🔸 Top Button: 2400x809px - ตรวจสอบข้อความ (Green theme)');
    console.log('🔸 Bottom Left: 800x809px - ช่วยเหลือ (Blue theme)');
    console.log('🔸 Bottom Middle: 800x809px - ตั้งค่า (Orange theme)');
    console.log('🔸 Bottom Right: 800x809px - ความรู้ (Purple theme)');
    console.log('');
    console.log('🎯 Button mapping:');
    console.log('  - check_new_message → ตรวจสอบข้อความใหม่');
    console.log('  - help_support → ช่วยเหลือและสนับสนุน');
    console.log('  - settings_menu → ตั้งค่าและสถิติ');
    console.log('  - knowledge_center → ความรู้และการศึกษา');
    console.log('');
    console.log('📱 Perfect for elderly users - large buttons, clear layout');
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting JPG to PNG conversion and 4-Button Rich Menu deployment...');
    
    // ตรวจสอบ environment variables
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN === 'your_line_channel_access_token_here') {
      console.error('❌ Please set LINE_CHANNEL_ACCESS_TOKEN in .env file');
      process.exit(1);
    }
    
    const deployer = new ConvertAndDeploy4ButtonRichMenu();
    
    // แสดงรายละเอียด Rich Menu
    deployer.showRichMenuDetails();
    
    // แปลง JPG เป็น PNG
    await deployer.convertJPGtoPNG();
    
    // ลบ Rich Menu เก่าก่อน
    await deployer.deleteAllRichMenus();
    
    // Deploy Rich Menu ใหม่
    const richMenuId = await deployer.deploy4ButtonRichMenu();
    
    console.log('\n🎉 4-Button Rich Menu deployment completed successfully!');
    console.log(`📱 Rich Menu ID: ${richMenuId}`);
    console.log('📋 Rich Menu is now active with beautiful design!');
    console.log('');
    console.log('🎯 Features:');
    console.log('  ✅ ปุ่มบน: ตรวจสอบข้อความ (เต็มความกว้าง)');
    console.log('  ✅ ปุ่มล่าง: ช่วยเหลือ | ตั้งค่า | ความรู้');
    console.log('  ✅ ออกแบบเหมาะสำหรับผู้สูงอายุ');
    console.log('  ✅ สีสันสวยงาม ไอคอนชัดเจน');
    
  } catch (error) {
    console.error('\n❌ 4-Button Rich Menu deployment failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { ConvertAndDeploy4ButtonRichMenu };