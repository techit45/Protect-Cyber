/**
 * Rich Menu Layout Creator
 * สร้างภาพ Rich Menu แบบ 2x3 จากรูปภาพแต่ละปุ่ม
 */

import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

interface RichMenuButton {
  imagePath: string;
  text: string;
  action: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class RichMenuLayoutCreator {
  private readonly MENU_WIDTH = 2500;
  private readonly MENU_HEIGHT = 1686;
  private readonly BUTTON_WIDTH = this.MENU_WIDTH / 3;
  private readonly BUTTON_HEIGHT = this.MENU_HEIGHT / 2;

  private buttons: RichMenuButton[] = [
    {
      imagePath: '/src/assets/rich-menu-images/button-1-check-message.png',
      text: 'ตรวจสอบข้อความใหม่',
      action: 'check_message',
      bounds: { x: 0, y: 0, width: this.BUTTON_WIDTH, height: this.BUTTON_HEIGHT }
    },
    {
      imagePath: '/src/assets/rich-menu-images/button-2-learn-more.png',
      text: 'เรียนรู้เพิ่มเติม',
      action: 'learn_more',
      bounds: { x: this.BUTTON_WIDTH, y: 0, width: this.BUTTON_WIDTH, height: this.BUTTON_HEIGHT }
    },
    {
      imagePath: '/src/assets/rich-menu-images/button-3-report-problem.png',
      text: 'รายงานปัญหา',
      action: 'report_problem',
      bounds: { x: this.BUTTON_WIDTH * 2, y: 0, width: this.BUTTON_WIDTH, height: this.BUTTON_HEIGHT }
    },
    {
      imagePath: '/src/assets/rich-menu-images/button-4-help-support.png',
      text: 'ช่วยเหลือคำแนะนำ',
      action: 'help_support',
      bounds: { x: 0, y: this.BUTTON_HEIGHT, width: this.BUTTON_WIDTH, height: this.BUTTON_HEIGHT }
    },
    {
      imagePath: '/src/assets/rich-menu-images/button-5-old-messages.png',
      text: 'ข้อความเก่าตรวจสอบ',
      action: 'old_messages',
      bounds: { x: this.BUTTON_WIDTH, y: this.BUTTON_HEIGHT, width: this.BUTTON_WIDTH, height: this.BUTTON_HEIGHT }
    },
    {
      imagePath: '/src/assets/rich-menu-images/button-6-check-message-green.png',
      text: 'ตรวจสอบข้อความใหม่',
      action: 'check_message_green',
      bounds: { x: this.BUTTON_WIDTH * 2, y: this.BUTTON_HEIGHT, width: this.BUTTON_WIDTH, height: this.BUTTON_HEIGHT }
    }
  ];

  /**
   * สร้าง Rich Menu Layout แบบสมบูรณ์
   */
  async createRichMenuLayout(): Promise<Buffer> {
    const canvas = createCanvas(this.MENU_WIDTH, this.MENU_HEIGHT);
    const ctx = canvas.getContext('2d');

    // พื้นหลังสีขาว
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, this.MENU_WIDTH, this.MENU_HEIGHT);

    // วาดเส้นขอบแต่ละปุ่ม
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 2;

    for (const button of this.buttons) {
      try {
        // โหลดรูปภาพปุ่ม
        const buttonImagePath = path.join(__dirname, '../..', button.imagePath);
        
        if (fs.existsSync(buttonImagePath)) {
          const buttonImage = await loadImage(buttonImagePath);
          
          // วาดรูปภาพปุ่ม
          ctx.drawImage(
            buttonImage,
            button.bounds.x,
            button.bounds.y,
            button.bounds.width,
            button.bounds.height
          );
        } else {
          console.warn(`Button image not found: ${buttonImagePath}`);
          
          // วาดพื้นหลังสีเทาถ้าไม่มีรูป
          ctx.fillStyle = '#F5F5F5';
          ctx.fillRect(
            button.bounds.x,
            button.bounds.y,
            button.bounds.width,
            button.bounds.height
          );
          
          // เขียนข้อความแทน
          ctx.fillStyle = '#666666';
          ctx.font = 'bold 60px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            button.text,
            button.bounds.x + button.bounds.width / 2,
            button.bounds.y + button.bounds.height / 2
          );
        }

        // วาดเส้นขอบปุ่ม
        ctx.strokeRect(
          button.bounds.x,
          button.bounds.y,
          button.bounds.width,
          button.bounds.height
        );

      } catch (error) {
        console.error(`Error processing button ${button.text}:`, error);
      }
    }

    return canvas.toBuffer('image/png');
  }

  /**
   * สร้างข้อมูล Rich Menu Configuration
   */
  getRichMenuConfig() {
    return {
      size: {
        width: this.MENU_WIDTH,
        height: this.MENU_HEIGHT
      },
      selected: true,
      name: "ProtectCyber Rich Menu - เหมาะสำหรับผู้สูงอายุ",
      chatBarText: "เมนูหลัก",
      areas: this.buttons.map(button => ({
        bounds: button.bounds,
        action: {
          type: "postback",
          data: button.action
        }
      }))
    };
  }

  /**
   * บันทึกภาพ Rich Menu
   */
  async saveRichMenuImage(outputPath: string): Promise<void> {
    const imageBuffer = await this.createRichMenuLayout();
    
    // สร้างโฟลเดอร์ถ้าไม่มี
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`✅ Rich Menu image saved to: ${outputPath}`);
  }

  /**
   * สร้างไฟล์ Rich Menu พร้อมใช้งาน
   */
  async generateCompleteRichMenu(): Promise<{
    imageBuffer: Buffer;
    config: any;
  }> {
    const imageBuffer = await this.createRichMenuLayout();
    const config = this.getRichMenuConfig();
    
    return {
      imageBuffer,
      config
    };
  }
}

// ฟังก์ชันสำหรับรัน script
async function main() {
  try {
    console.log('🚀 Creating Rich Menu Layout...');
    
    const creator = new RichMenuLayoutCreator();
    const outputPath = path.join(__dirname, '../assets/rich-menu-images/complete-rich-menu.png');
    
    await creator.saveRichMenuImage(outputPath);
    
    const config = creator.getRichMenuConfig();
    console.log('📋 Rich Menu Config:', JSON.stringify(config, null, 2));
    
    console.log('✅ Rich Menu Layout created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating Rich Menu:', error);
  }
}

// รันถ้าเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  main();
}