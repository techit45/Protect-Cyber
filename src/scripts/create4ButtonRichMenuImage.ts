/**
 * Create 4-Button Rich Menu Image
 * สร้างรูปภาพ Rich Menu แบบ 4 ปุ่ม 2 แถว (2400x1618px)
 */

import fs from 'fs';
import path from 'path';
const { createCanvas } = require('canvas');

class FourButtonRichMenuImageGenerator {
  private readonly MENU_WIDTH = 2400;
  private readonly MENU_HEIGHT = 1618; // 809px + 809px
  private readonly TOP_ROW_HEIGHT = 809;
  private readonly BOTTOM_ROW_HEIGHT = 809;
  private readonly BOTTOM_BUTTON_WIDTH = 800;

  /**
   * สร้างรูปภาพ Rich Menu แบบ 4 ปุ่ม
   */
  async create4ButtonRichMenuPNG(): Promise<Buffer> {
    const canvas = createCanvas(this.MENU_WIDTH, this.MENU_HEIGHT);
    const ctx = canvas.getContext('2d');

    // พื้นหลังสีขาว
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, this.MENU_WIDTH, this.MENU_HEIGHT);

    // === ปุ่มหลัก (แถวบนเต็มความกว้าง) ===
    const topPadding = 15;
    const sidePadding = 15;
    
    // พื้นหลังปุ่มหลัก
    ctx.fillStyle = '#e8f5e8';
    ctx.fillRect(sidePadding, topPadding, this.MENU_WIDTH - (sidePadding * 2), this.TOP_ROW_HEIGHT - (topPadding * 2));

    // ขอบปุ่มหลัก
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 6;
    ctx.strokeRect(sidePadding, topPadding, this.MENU_WIDTH - (sidePadding * 2), this.TOP_ROW_HEIGHT - (topPadding * 2));

    // ไอคอนปุ่มหลัก (วงกลมใหญ่)
    const mainCenterX = this.MENU_WIDTH / 2;
    const mainCenterY = this.TOP_ROW_HEIGHT / 2 - 80;
    
    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.arc(mainCenterX, mainCenterY, 80, 0, 2 * Math.PI);
    ctx.fill();

    // สัญลักษณ์เกราะ (ปุ่มหลัก)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🛡️', mainCenterX, mainCenterY + 20);

    // ข้อความปุ่มหลัก
    ctx.fillStyle = '#2E7D32';
    ctx.font = 'bold 56px Arial';
    ctx.fillText('ตรวจสอบข้อความ', mainCenterX, mainCenterY + 140);

    // ข้อความเสริมปุ่มหลัก
    ctx.fillStyle = '#4CAF50';
    ctx.font = '32px Arial';
    ctx.fillText('แตะเพื่อเริ่มตรวจสอบ', mainCenterX, mainCenterY + 180);

    // === ปุ่มแถวล่าง ===
    const bottomStartY = this.TOP_ROW_HEIGHT;
    const buttonPadding = 10;
    
    const bottomButtons = [
      { 
        x: 0, 
        color: '#e3f2fd', 
        borderColor: '#1976D2', 
        text: 'ช่วยเหลือ',
        subText: 'ขอความช่วยเหลือ',
        icon: '🆘'
      },
      { 
        x: this.BOTTOM_BUTTON_WIDTH, 
        color: '#fff3e0', 
        borderColor: '#F57C00', 
        text: 'ตั้งค่า',
        subText: 'ปรับแต่งระบบ',
        icon: '⚙️'
      },
      { 
        x: this.BOTTOM_BUTTON_WIDTH * 2, 
        color: '#f3e5f5', 
        borderColor: '#7B1FA2', 
        text: 'ความรู้',
        subText: 'เรียนรู้ป้องกันตัว',
        icon: '🎓'
      }
    ];

    bottomButtons.forEach(button => {
      // พื้นหลังปุ่ม
      ctx.fillStyle = button.color;
      ctx.fillRect(
        button.x + buttonPadding, 
        bottomStartY + buttonPadding, 
        this.BOTTOM_BUTTON_WIDTH - (buttonPadding * 2), 
        this.BOTTOM_ROW_HEIGHT - (buttonPadding * 2)
      );
      
      // ขอบปุ่ม
      ctx.strokeStyle = button.borderColor;
      ctx.lineWidth = 5;
      ctx.strokeRect(
        button.x + buttonPadding, 
        bottomStartY + buttonPadding, 
        this.BOTTOM_BUTTON_WIDTH - (buttonPadding * 2), 
        this.BOTTOM_ROW_HEIGHT - (buttonPadding * 2)
      );
      
      // ไอคอนปุ่ม
      const buttonCenterX = button.x + this.BOTTOM_BUTTON_WIDTH / 2;
      const buttonCenterY = bottomStartY + this.BOTTOM_ROW_HEIGHT / 2 - 60;
      
      // วงกลมไอคอน
      ctx.fillStyle = button.borderColor;
      ctx.beginPath();
      ctx.arc(buttonCenterX, buttonCenterY, 50, 0, 2 * Math.PI);
      ctx.fill();
      
      // ไอคอน
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(button.icon, buttonCenterX, buttonCenterY + 15);
      
      // ข้อความหลัก
      ctx.fillStyle = button.borderColor;
      ctx.font = 'bold 42px Arial';
      ctx.fillText(button.text, buttonCenterX, buttonCenterY + 80);
      
      // ข้อความเสริม
      ctx.fillStyle = '#666666';
      ctx.font = '26px Arial';
      ctx.fillText(button.subText, buttonCenterX, buttonCenterY + 115);
    });

    // แถบล่างสุด
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(0, this.MENU_HEIGHT - 25, this.MENU_WIDTH, 25);

    // ข้อความแถบล่าง
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ProtectCyber - เกราะไซเบอร์สำหรับผู้สูงอายุ', this.MENU_WIDTH / 2, this.MENU_HEIGHT - 6);

    return canvas.toBuffer('image/png');
  }

  /**
   * สร้างและบันทึกรูปภาพ Rich Menu
   */
  async createAndSave4ButtonImage(): Promise<void> {
    try {
      console.log('🎨 Creating 4-Button Rich Menu image...');
      
      const pngBuffer = await this.create4ButtonRichMenuPNG();
      const outputPath = path.join(__dirname, '../assets/rich-menu-images/4-button-rich-menu.png');
      
      // สร้างโฟลเดอร์ถ้าไม่มี
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // เขียนไฟล์ PNG
      fs.writeFileSync(outputPath, pngBuffer);
      
      console.log('✅ 4-Button Rich Menu image created successfully!');
      console.log(`📁 File saved to: ${outputPath}`);
      console.log(`📏 Size: ${this.MENU_WIDTH}x${this.MENU_HEIGHT} pixels`);
      
      // แสดงขนาดไฟล์
      const sizeKB = (pngBuffer.length / 1024).toFixed(2);
      console.log(`💾 File size: ${sizeKB} KB`);
      
      if (pngBuffer.length < 1024 * 1024) {
        console.log('✅ File size is within LINE Rich Menu limit (< 1MB)');
      }

      // แสดงรายละเอียด layout
      console.log('\n📋 4-Button Layout Details:');
      console.log('🔸 Top Button: 2400x809px - ตรวจสอบข้อความ');
      console.log('🔸 Bottom Left: 800x809px - ช่วยเหลือ');
      console.log('🔸 Bottom Middle: 800x809px - ตั้งค่า');
      console.log('🔸 Bottom Right: 800x809px - ความรู้');
      console.log('🎯 Perfect for elderly users!');
      
    } catch (error) {
      console.error('❌ Error creating 4-Button Rich Menu image:', error);
      throw error;
    }
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting 4-Button Rich Menu image creation...');
    
    const generator = new FourButtonRichMenuImageGenerator();
    
    // สร้างรูปภาพ
    await generator.createAndSave4ButtonImage();
    
    console.log('\n🎉 4-Button Rich Menu image created successfully!');
    console.log('📋 Ready for deployment with 4-button layout');
    
  } catch (error) {
    console.error('\n❌ 4-Button Rich Menu image creation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { FourButtonRichMenuImageGenerator };