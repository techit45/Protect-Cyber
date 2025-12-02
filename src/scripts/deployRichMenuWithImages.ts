/**
 * Deploy Rich Menu with Uploaded Images
 * ใช้รูปภาพที่อัปโหลดมาสร้าง Rich Menu
 */

import { Client } from '@line/bot-sdk';
import fs from 'fs';
import path from 'path';

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || ''
});

interface RichMenuArea {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  action: {
    type: "postback";
    data: string;
  };
}

class RichMenuWithImagesCreator {
  private readonly MENU_WIDTH = 2500;
  private readonly MENU_HEIGHT = 1686;
  private readonly BUTTON_WIDTH = this.MENU_WIDTH / 3;
  private readonly BUTTON_HEIGHT = this.MENU_HEIGHT / 2;

  private buttonMappings = [
    {
      imageName: 'button-1-check-message.png',
      position: { row: 0, col: 0 },
      action: 'check_message',
      label: 'ตรวจสอบข้อความใหม่'
    },
    {
      imageName: 'button-2-learn-more.png',
      position: { row: 0, col: 1 },
      action: 'learn_more',
      label: 'เรียนรู้เพิ่มเติม'
    },
    {
      imageName: 'button-3-report-problem.png',
      position: { row: 0, col: 2 },
      action: 'report_problem',
      label: 'รายงานปัญหา'
    },
    {
      imageName: 'button-4-help-support.png',
      position: { row: 1, col: 0 },
      action: 'help_support',
      label: 'ช่วยเหลือคำแนะนำ'
    },
    {
      imageName: 'button-5-old-messages.png',
      position: { row: 1, col: 1 },
      action: 'old_messages',
      label: 'ข้อความเก่าตรวจสอบ'
    },
    {
      imageName: 'button-6-check-message-green.png',
      position: { row: 1, col: 2 },
      action: 'check_message_alt',
      label: 'ตรวจสอบข้อความใหม่'
    }
  ];

  /**
   * สร้างภาพ Rich Menu จากรูปภาพที่อัปโหลด
   */
  async createRichMenuImage(): Promise<Buffer> {
    // สำหรับตอนนี้ ใช้รูปภาพแรกเป็น template
    const firstImagePath = path.join(__dirname, '../assets/rich-menu-images', this.buttonMappings[0].imageName);
    
    if (fs.existsSync(firstImagePath)) {
      // อ่านรูปภาพแรกเป็น template
      const imageBuffer = fs.readFileSync(firstImagePath);
      console.log(`📷 Using ${this.buttonMappings[0].imageName} as Rich Menu template`);
      return imageBuffer;
    } else {
      throw new Error(`❌ Template image not found: ${firstImagePath}`);
    }
  }

  /**
   * สร้าง Rich Menu Areas
   */
  createRichMenuAreas(): RichMenuArea[] {
    return this.buttonMappings.map(button => ({
      bounds: {
        x: button.position.col * this.BUTTON_WIDTH,
        y: button.position.row * this.BUTTON_HEIGHT,
        width: this.BUTTON_WIDTH,
        height: this.BUTTON_HEIGHT
      },
      action: {
        type: 'postback' as const,
        data: button.action
      }
    }));
  }

  /**
   * สร้างและอัปโหลด Rich Menu
   */
  async createAndUploadRichMenu(): Promise<string> {
    try {
      console.log('🎨 Creating Rich Menu image...');
      const imageBuffer = await this.createRichMenuImage();
      
      // บันทึกรูปภาพ Rich Menu
      const imagePath = path.join(__dirname, '../assets/rich-menu-images/final-rich-menu.png');
      fs.writeFileSync(imagePath, imageBuffer);
      console.log(`💾 Rich Menu image saved: ${imagePath}`);

      console.log('📤 Uploading Rich Menu to LINE...');
      
      // สร้าง Rich Menu
      const richMenuId = await client.createRichMenu({
        size: {
          width: this.MENU_WIDTH,
          height: this.MENU_HEIGHT
        },
        selected: true,
        name: "ProtectCyber Rich Menu - เหมาะสำหรับผู้สูงอายุ",
        chatBarText: "เมนูหลัก",
        areas: this.createRichMenuAreas()
      });

      console.log(`✅ Rich Menu created with ID: ${richMenuId}`);

      // อัปโหลดรูปภาพ Rich Menu
      await client.setRichMenuImage(richMenuId, imageBuffer, 'image/png');
      console.log('✅ Rich Menu image uploaded successfully');

      // เปิดใช้งาน Rich Menu
      await client.setDefaultRichMenu(richMenuId);
      console.log('✅ Rich Menu activated as default');

      return richMenuId;

    } catch (error) {
      console.error('❌ Error creating Rich Menu:', error);
      throw error;
    }
  }

  /**
   * แสดงรายละเอียด Rich Menu
   */
  showRichMenuDetails(): void {
    console.log('\n📋 Rich Menu Details:');
    console.log(`Size: ${this.MENU_WIDTH}x${this.MENU_HEIGHT}`);
    console.log(`Button Size: ${this.BUTTON_WIDTH}x${this.BUTTON_HEIGHT}`);
    console.log('\n🎯 Button Mapping:');
    
    this.buttonMappings.forEach((button, index) => {
      console.log(`${index + 1}. ${button.label}`);
      console.log(`   Position: Row ${button.position.row}, Col ${button.position.col}`);
      console.log(`   Action: ${button.action}`);
      console.log(`   Image: ${button.imageName}`);
      console.log('');
    });
  }
}

// ฟังก์ชันหลักสำหรับรัน script
async function main() {
  try {
    console.log('🚀 Starting Rich Menu deployment with uploaded images...');
    
    const creator = new RichMenuWithImagesCreator();
    creator.showRichMenuDetails();
    
    const richMenuId = await creator.createAndUploadRichMenu();
    
    console.log('\n🎉 Rich Menu deployment completed successfully!');
    console.log(`Rich Menu ID: ${richMenuId}`);
    console.log('\n📱 Users can now see the Rich Menu in LINE app');
    
  } catch (error) {
    console.error('\n❌ Rich Menu deployment failed:', error);
    process.exit(1);
  }
}

// รันถ้าเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  main();
}

export { RichMenuWithImagesCreator };