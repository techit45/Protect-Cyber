/**
 * Create Simple Rich Menu Image
 * สร้างรูปภาพ Rich Menu ขนาดเล็กและกระทัดรัด
 */

import fs from 'fs';
import path from 'path';

class SimpleRichMenuImageGenerator {
  private readonly MENU_WIDTH = 2500;
  private readonly MENU_HEIGHT = 843; // ความสูงเป็นครึ่งเดียว

  /**
   * สร้างรูปภาพ Rich Menu แบบ SVG ขนาดเล็ก
   */
  createSimpleRichMenuSVG(): string {
    return `
<svg width="${this.MENU_WIDTH}" height="${this.MENU_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${this.MENU_WIDTH}" height="${this.MENU_HEIGHT}" fill="#f8f9fa"/>
  
  <!-- ปุ่มซ้าย - ตรวจสอบข้อความ -->
  <rect x="10" y="10" width="824" height="823" fill="#e8f5e8" stroke="#2E7D32" stroke-width="4" rx="15"/>
  <circle cx="417" cy="300" r="60" fill="#2E7D32"/>
  <text x="417" y="315" font-family="Arial, sans-serif" font-size="40" font-weight="bold" text-anchor="middle" fill="#ffffff">🔍</text>
  <text x="417" y="500" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="#2E7D32">ตรวจสอบข้อความ</text>
  <text x="417" y="550" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#666666">แตะเพื่อตรวจสอบ</text>
  
  <!-- ปุ่มกลาง - ช่วยเหลือ -->
  <rect x="844" y="10" width="822" height="823" fill="#e3f2fd" stroke="#1976D2" stroke-width="4" rx="15"/>
  <circle cx="1255" cy="300" r="60" fill="#1976D2"/>
  <text x="1255" y="315" font-family="Arial, sans-serif" font-size="40" font-weight="bold" text-anchor="middle" fill="#ffffff">🆘</text>
  <text x="1255" y="500" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="#1976D2">ช่วยเหลือ</text>
  <text x="1255" y="550" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#666666">ขอความช่วยเหลือ</text>
  
  <!-- ปุ่มขวา - ประวัติ -->
  <rect x="1676" y="10" width="824" height="823" fill="#f5f5f5" stroke="#616161" stroke-width="4" rx="15"/>
  <circle cx="2088" cy="300" r="60" fill="#616161"/>
  <text x="2088" y="315" font-family="Arial, sans-serif" font-size="40" font-weight="bold" text-anchor="middle" fill="#ffffff">📄</text>
  <text x="2088" y="500" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="#616161">ประวัติ</text>
  <text x="2088" y="550" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#666666">ดูข้อความเก่า</text>
  
  <!-- ขอบล่าง -->
  <rect x="0" y="${this.MENU_HEIGHT - 20}" width="${this.MENU_WIDTH}" height="20" fill="#2E7D32"/>
  <text x="${this.MENU_WIDTH / 2}" y="${this.MENU_HEIGHT - 5}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#ffffff">ProtectCyber - เกราะไซเบอร์</text>
</svg>
    `.trim();
  }

  /**
   * สร้างและบันทึกรูปภาพ Rich Menu
   */
  async createAndSaveRichMenuImage(): Promise<void> {
    try {
      console.log('🎨 Creating simple Rich Menu image...');
      
      const svgContent = this.createSimpleRichMenuSVG();
      const outputPath = path.join(__dirname, '../assets/rich-menu-images/simple-compact-rich-menu.svg');
      
      // สร้างโฟลเดอร์ถ้าไม่มี
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // เขียนไฟล์ SVG
      fs.writeFileSync(outputPath, svgContent);
      
      console.log('✅ Simple Rich Menu SVG created successfully!');
      console.log(`📁 File saved to: ${outputPath}`);
      console.log(`📏 Size: ${this.MENU_WIDTH}x${this.MENU_HEIGHT} pixels`);
      
      // แสดงขนาดไฟล์
      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`💾 File size: ${sizeKB} KB`);
      
      if (stats.size < 1024 * 1024) {
        console.log('✅ File size is within LINE Rich Menu limit (< 1MB)');
      }
      
    } catch (error) {
      console.error('❌ Error creating Rich Menu image:', error);
      throw error;
    }
  }

  /**
   * สร้างรูปภาพ PNG ขนาดเล็กสำหรับทดสอบ
   */
  createMinimalPNG(): Buffer {
    // สร้าง PNG ขนาดเล็กแบบ solid color
    const width = this.MENU_WIDTH;
    const height = this.MENU_HEIGHT;
    
    // PNG header + IHDR + IDAT + IEND (ขนาดเล็กที่สุด)
    const pngBase64 = `iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==`;
    
    return Buffer.from(pngBase64, 'base64');
  }

  /**
   * สร้างและบันทึกรูปภาพ PNG ขนาดเล็ก
   */
  async createMinimalPNGFile(): Promise<void> {
    try {
      console.log('🎨 Creating minimal PNG Rich Menu image...');
      
      const pngBuffer = this.createMinimalPNG();
      const outputPath = path.join(__dirname, '../assets/rich-menu-images/minimal-rich-menu.png');
      
      // สร้างโฟลเดอร์ถ้าไม่มี
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // เขียนไฟล์ PNG
      fs.writeFileSync(outputPath, pngBuffer);
      
      console.log('✅ Minimal PNG Rich Menu created successfully!');
      console.log(`📁 File saved to: ${outputPath}`);
      console.log(`💾 File size: ${(pngBuffer.length / 1024).toFixed(2)} KB`);
      
    } catch (error) {
      console.error('❌ Error creating minimal PNG:', error);
      throw error;
    }
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Simple Rich Menu image creation...');
    
    const generator = new SimpleRichMenuImageGenerator();
    
    // สร้างทั้ง SVG และ PNG
    await generator.createAndSaveRichMenuImage();
    await generator.createMinimalPNGFile();
    
    console.log('\n🎉 Rich Menu images created successfully!');
    console.log('📋 Ready for deployment');
    
  } catch (error) {
    console.error('\n❌ Rich Menu image creation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { SimpleRichMenuImageGenerator };