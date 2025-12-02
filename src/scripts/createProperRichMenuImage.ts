/**
 * Create Proper Rich Menu Image
 * สร้างรูปภาพ Rich Menu ที่มีขนาดถูกต้องและใช้งานได้จริง
 */

import fs from 'fs';
import path from 'path';
const { createCanvas } = require('canvas');

class ProperRichMenuImageGenerator {
  private readonly MENU_WIDTH = 2500;
  private readonly MENU_HEIGHT = 843;

  /**
   * สร้างรูปภาพ PNG ขนาดถูกต้องด้วย Canvas
   */
  async createProperRichMenuPNG(): Promise<Buffer> {
    const canvas = createCanvas(this.MENU_WIDTH, this.MENU_HEIGHT);
    const ctx = canvas.getContext('2d');

    // พื้นหลังสีขาว
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, this.MENU_WIDTH, this.MENU_HEIGHT);

    // กำหนดสีและตำแหน่งปุ่ม
    const buttons = [
      { x: 0, width: 833, color: '#e8f5e8', borderColor: '#2E7D32', text: 'ตรวจสอบข้อความ' },
      { x: 833, width: 834, color: '#e3f2fd', borderColor: '#1976D2', text: 'ช่วยเหลือ' },
      { x: 1667, width: 833, color: '#f5f5f5', borderColor: '#616161', text: 'ประวัติ' }
    ];

    buttons.forEach((button, index) => {
      // วาดพื้นหลังปุ่ม
      ctx.fillStyle = button.color;
      ctx.fillRect(button.x + 10, 10, button.width - 20, this.MENU_HEIGHT - 20);

      // วาดขอบปุ่ม
      ctx.strokeStyle = button.borderColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(button.x + 10, 10, button.width - 20, this.MENU_HEIGHT - 20);

      // วาดไอคอน (วงกลม)
      const centerX = button.x + button.width / 2;
      const centerY = this.MENU_HEIGHT / 2 - 100;
      
      ctx.fillStyle = button.borderColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60, 0, 2 * Math.PI);
      ctx.fill();

      // เพิ่มสัญลักษณ์
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      const icons = ['🔍', '🆘', '📄'];
      ctx.fillText(icons[index], centerX, centerY + 15);

      // วาดข้อความ
      ctx.fillStyle = button.borderColor;
      ctx.font = 'bold 36px Arial';
      ctx.fillText(button.text, centerX, centerY + 120);

      // ข้อความเสริม
      ctx.fillStyle = '#666666';
      ctx.font = '24px Arial';
      const subTexts = ['แตะเพื่อตรวจสอบ', 'ขอความช่วยเหลือ', 'ดูข้อความเก่า'];
      ctx.fillText(subTexts[index], centerX, centerY + 160);
    });

    // เพิ่มแถบล่าง
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(0, this.MENU_HEIGHT - 20, this.MENU_WIDTH, 20);

    // ข้อความแถบล่าง
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ProtectCyber - เกราะไซเบอร์', this.MENU_WIDTH / 2, this.MENU_HEIGHT - 5);

    return canvas.toBuffer('image/png');
  }

  /**
   * สร้างและบันทึกรูปภาพ Rich Menu
   */
  async createAndSaveProperRichMenuImage(): Promise<void> {
    try {
      console.log('🎨 Creating proper Rich Menu PNG image...');
      
      const pngBuffer = await this.createProperRichMenuPNG();
      const outputPath = path.join(__dirname, '../assets/rich-menu-images/proper-rich-menu.png');
      
      // สร้างโฟลเดอร์ถ้าไม่มี
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // เขียนไฟล์ PNG
      fs.writeFileSync(outputPath, pngBuffer);
      
      console.log('✅ Proper Rich Menu PNG created successfully!');
      console.log(`📁 File saved to: ${outputPath}`);
      console.log(`📏 Size: ${this.MENU_WIDTH}x${this.MENU_HEIGHT} pixels`);
      
      // แสดงขนาดไฟล์
      const sizeKB = (pngBuffer.length / 1024).toFixed(2);
      console.log(`💾 File size: ${sizeKB} KB`);
      
      if (pngBuffer.length < 1024 * 1024) {
        console.log('✅ File size is within LINE Rich Menu limit (< 1MB)');
      }
      
    } catch (error) {
      console.error('❌ Error creating Rich Menu image:', error);
      throw error;
    }
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Proper Rich Menu image creation...');
    
    const generator = new ProperRichMenuImageGenerator();
    
    // สร้างรูปภาพ PNG
    await generator.createAndSaveProperRichMenuImage();
    
    console.log('\n🎉 Proper Rich Menu image created successfully!');
    console.log('📋 Ready for deployment with correct dimensions');
    
  } catch (error) {
    console.error('\n❌ Proper Rich Menu image creation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { ProperRichMenuImageGenerator };