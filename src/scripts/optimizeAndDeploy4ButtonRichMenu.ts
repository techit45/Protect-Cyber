/**
 * Optimize and Deploy 4-Button Rich Menu
 * ลดขนาดรูปภาพและ Deploy Rich Menu
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

class OptimizeAndDeploy4ButtonRichMenu {
  private readonly MENU_WIDTH = 2400;
  private readonly MENU_HEIGHT = 1618; // 809px + 809px

  /**
   * แปลงและปรับขนาดรูป JPG เป็น PNG ขนาดเล็ก
   */
  async optimizeJPGtoPNG(): Promise<void> {
    try {
      console.log('🔄 Optimizing JPG to compressed PNG...');
      
      const jpgPath = path.join(__dirname, '../assets/rich-menu-images/linerichmenu4.jpg');
      const pngPath = path.join(__dirname, '../assets/rich-menu-images/4-button-rich-menu-optimized.png');
      
      if (!fs.existsSync(jpgPath)) {
        throw new Error(`❌ JPG file not found: ${jpgPath}`);
      }
      
      // โหลดรูปภาพ JPG
      const image = await loadImage(jpgPath);
      
      // สร้าง canvas ขนาดที่ถูกต้อง
      const canvas = createCanvas(this.MENU_WIDTH, this.MENU_HEIGHT);
      const ctx = canvas.getContext('2d');
      
      // พื้นหลังสีขาว
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, this.MENU_WIDTH, this.MENU_HEIGHT);
      
      // วาดรูปภาพลงใน canvas โดยปรับขนาดให้พอดี
      ctx.drawImage(image, 0, 0, this.MENU_WIDTH, this.MENU_HEIGHT);
      
      // สร้าง PNG buffer ด้วยการบีบอัดสูง
      const buffer = canvas.toBuffer('image/png', { 
        compressionLevel: 9, // สูงสุด
        filters: canvas.PNG_FILTER_NONE 
      });
      
      // ถ้าไฟล์ยังใหญ่เกินไป ให้ลดขนาดลง
      let finalBuffer = buffer;
      let iterations = 0;
      const maxIterations = 3;
      
      while (finalBuffer.length > 800 * 1024 && iterations < maxIterations) { // ต้องการให้ต่ำกว่า 800KB
        iterations++;
        console.log(`🔄 Iteration ${iterations}: Current size ${(finalBuffer.length / 1024).toFixed(2)} KB, reducing quality...`);
        
        // ลดขนาดและคุณภาพ
        const tempCanvas = createCanvas(this.MENU_WIDTH, this.MENU_HEIGHT);
        const tempCtx = tempCanvas.getContext('2d');
        
        // พื้นหลังสีขาว
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, this.MENU_WIDTH, this.MENU_HEIGHT);
        
        // ปรับ global alpha เพื่อลดข้อมูลสี
        tempCtx.globalAlpha = 0.95 - (iterations * 0.05);
        tempCtx.drawImage(image, 0, 0, this.MENU_WIDTH, this.MENU_HEIGHT);
        
        finalBuffer = tempCanvas.toBuffer('image/png', { 
          compressionLevel: 9,
          filters: tempCanvas.PNG_FILTER_NONE 
        });
      }
      
      fs.writeFileSync(pngPath, finalBuffer);
      
      const sizeKB = (finalBuffer.length / 1024).toFixed(2);
      console.log('✅ JPG optimized to PNG successfully!');
      console.log(`📁 Saved to: ${pngPath}`);
      console.log(`📏 Size: ${this.MENU_WIDTH}x${this.MENU_HEIGHT} pixels`);
      console.log(`💾 File size: ${sizeKB} KB`);
      
      if (finalBuffer.length < 1024 * 1024) {
        console.log('✅ File size is within LINE Rich Menu limit (< 1MB)');
      } else {
        console.warn('⚠️ File size might still be too large for LINE API');
      }
      
    } catch (error) {
      console.error('❌ Error optimizing JPG to PNG:', error);
      throw error;
    }
  }

  /**
   * สร้างรูปภาพเวอร์ชันเล็กแบบ vector-style
   */
  async createVectorStylePNG(): Promise<void> {
    try {
      console.log('🎨 Creating vector-style PNG...');
      
      const canvas = createCanvas(this.MENU_WIDTH, this.MENU_HEIGHT);
      const ctx = canvas.getContext('2d');

      // พื้นหลังสีขาว
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, this.MENU_WIDTH, this.MENU_HEIGHT);

      // === ปุ่มหลัก (แถวบน) ===
      // พื้นหลัง
      const gradient = ctx.createLinearGradient(0, 0, this.MENU_WIDTH, 809);
      gradient.addColorStop(0, '#e8f5e8');
      gradient.addColorStop(1, '#f1f8e9');
      ctx.fillStyle = gradient;
      ctx.fillRect(10, 10, this.MENU_WIDTH - 20, 789);

      // ขอบ
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 8;
      ctx.strokeRect(10, 10, this.MENU_WIDTH - 20, 789);

      // เกราะ
      ctx.fillStyle = '#2E7D32';
      ctx.beginPath();
      ctx.moveTo(400, 150);
      ctx.lineTo(500, 120);
      ctx.lineTo(600, 150);
      ctx.lineTo(580, 350);
      ctx.lineTo(500, 380);
      ctx.lineTo(420, 350);
      ctx.closePath();
      ctx.fill();

      // แว่นขยาย
      ctx.fillStyle = '#2E7D32';
      ctx.beginPath();
      ctx.arc(350, 250, 60, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(350, 250, 45, 0, 2 * Math.PI);
      ctx.fill();
      
      // ด้ามแว่นขยาย
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(310, 290);
      ctx.lineTo(270, 330);
      ctx.stroke();

      // ข้อความหลัก
      ctx.fillStyle = '#2E7D32';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ตรวจสอบข้อความ', this.MENU_WIDTH / 2, 350);

      // ข้อความเสริม
      ctx.fillStyle = '#4CAF50';
      ctx.font = '42px Arial';
      ctx.fillText('แตะเพื่อเริ่มตรวจสอบ', this.MENU_WIDTH / 2, 420);

      // === ปุ่มแถวล่าง ===
      const bottomY = 809;
      const buttonWidth = 800;
      const buttons = [
        { x: 0, bg: '#e3f2fd', border: '#1976D2', text: 'ช่วยเหลือ', sub: 'ได้รับความช่วยเหลือ', icon: '?' },
        { x: 800, bg: '#fff3e0', border: '#F57C00', text: 'ตั้งค่า', sub: 'ปรับแต่งระบบ', icon: '⚙' },
        { x: 1600, bg: '#f3e5f5', border: '#7B1FA2', text: 'ความรู้', sub: 'เรียนรู้ป้องกันตัว', icon: '🎓' }
      ];

      buttons.forEach(button => {
        // พื้นหลัง
        ctx.fillStyle = button.bg;
        ctx.fillRect(button.x + 10, bottomY + 10, buttonWidth - 20, 789);
        
        // ขอบ
        ctx.strokeStyle = button.border;
        ctx.lineWidth = 6;
        ctx.strokeRect(button.x + 10, bottomY + 10, buttonWidth - 20, 789);
        
        // ไอคอน
        const centerX = button.x + buttonWidth / 2;
        const centerY = bottomY + 250;
        
        ctx.fillStyle = button.border;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 70, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(button.icon, centerX, centerY + 20);
        
        // ข้อความ
        ctx.fillStyle = button.border;
        ctx.font = 'bold 52px Arial';
        ctx.fillText(button.text, centerX, centerY + 120);
        
        ctx.fillStyle = '#666666';
        ctx.font = '32px Arial';
        ctx.fillText(button.sub, centerX, centerY + 170);
      });

      // แถบล่าง
      ctx.fillStyle = '#2E7D32';
      ctx.fillRect(0, this.MENU_HEIGHT - 30, this.MENU_WIDTH, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ProtectCyber - เกราะไซเบอร์สำหรับผู้สูงอายุ', this.MENU_WIDTH / 2, this.MENU_HEIGHT - 8);

      // บันทึก
      const buffer = canvas.toBuffer('image/png', { 
        compressionLevel: 9,
        filters: canvas.PNG_FILTER_NONE 
      });
      
      const outputPath = path.join(__dirname, '../assets/rich-menu-images/4-button-rich-menu-vector.png');
      fs.writeFileSync(outputPath, buffer);
      
      const sizeKB = (buffer.length / 1024).toFixed(2);
      console.log('✅ Vector-style PNG created successfully!');
      console.log(`📁 Saved to: ${outputPath}`);
      console.log(`💾 File size: ${sizeKB} KB`);
      
      return;
      
    } catch (error) {
      console.error('❌ Error creating vector-style PNG:', error);
      throw error;
    }
  }

  /**
   * Deploy Rich Menu แบบ 4 ปุ่ม
   */
  async deploy4ButtonRichMenu(useVectorVersion: boolean = false): Promise<string> {
    try {
      console.log('🎨 Starting 4-Button Rich Menu deployment...');
      
      const imageName = useVectorVersion ? '4-button-rich-menu-vector.png' : '4-button-rich-menu-optimized.png';
      const imagePath = path.join(__dirname, '../assets/rich-menu-images', imageName);
      
      if (!fs.existsSync(imagePath)) {
        throw new Error(`❌ PNG file not found: ${imagePath}`);
      }
      
      const imageBuffer = fs.readFileSync(imagePath);
      const sizeKB = (imageBuffer.length / 1024).toFixed(2);
      
      console.log(`📷 Using Rich Menu image: ${sizeKB} KB`);
      
      if (imageBuffer.length > 1024 * 1024) {
        throw new Error(`❌ Image too large: ${sizeKB} KB (max 1024 KB)`);
      }

      // สร้าง Rich Menu configuration
      const richMenuConfig = {
        size: {
          width: this.MENU_WIDTH,
          height: this.MENU_HEIGHT
        },
        selected: true,
        name: "ProtectCyber 4-Button Menu Optimized",
        chatBarText: "เมนูหลัก",
        areas: [
          // ปุ่มหลัก - ตรวจสอบข้อความ (แถวบนเต็มความกว้าง)
          {
            bounds: {
              x: 0,
              y: 0,
              width: this.MENU_WIDTH,
              height: 809
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
              y: 809,
              width: 800,
              height: 809
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
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting optimized 4-Button Rich Menu deployment...');
    
    // ตรวจสอบ environment variables
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN === 'your_line_channel_access_token_here') {
      console.error('❌ Please set LINE_CHANNEL_ACCESS_TOKEN in .env file');
      process.exit(1);
    }
    
    const deployer = new OptimizeAndDeploy4ButtonRichMenu();
    
    // ลบ Rich Menu เก่าก่อน
    await deployer.deleteAllRichMenus();
    
    // ลองวิธีที่ 1: ใช้รูปที่มีอยู่แต่ optimize
    try {
      await deployer.optimizeJPGtoPNG();
      const richMenuId = await deployer.deploy4ButtonRichMenu(false);
      
      console.log('\n🎉 Optimized Rich Menu deployment completed successfully!');
      console.log(`📱 Rich Menu ID: ${richMenuId}`);
      
    } catch (error) {
      console.log('⚠️ Optimized version failed, trying vector version...');
      
      // วิธีที่ 2: สร้างรูป vector-style
      await deployer.createVectorStylePNG();
      const richMenuId = await deployer.deploy4ButtonRichMenu(true);
      
      console.log('\n🎉 Vector-style Rich Menu deployment completed successfully!');
      console.log(`📱 Rich Menu ID: ${richMenuId}`);
    }
    
    console.log('📋 Rich Menu is now active!');
    console.log('');
    console.log('🎯 Features:');
    console.log('  ✅ ปุ่มบน: ตรวจสอบข้อความ (เต็มความกว้าง)');
    console.log('  ✅ ปุ่มล่าง: ช่วยเหลือ | ตั้งค่า | ความรู้');
    console.log('  ✅ ออกแบบเหมาะสำหรับผู้สูงอายุ');
    console.log('  ✅ ขนาดไฟล์เล็ก โหลดเร็ว');
    
  } catch (error) {
    console.error('\n❌ Rich Menu deployment failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { OptimizeAndDeploy4ButtonRichMenu };