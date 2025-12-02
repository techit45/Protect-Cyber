/**
 * Combine Rich Menu Images
 * รวมรูปภาพ 3 ภาพเป็น Rich Menu เต็มรูปแบบ
 */

import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

class RichMenuImageCombiner {
  private readonly TOTAL_WIDTH = 2500;
  private readonly TOTAL_HEIGHT = 1686;
  private readonly BUTTON_HEIGHT = 843;

  /**
   * รวมรูปภาพทั้งหมดเป็น Rich Menu
   */
  async combineImages(): Promise<Buffer> {
    try {
      console.log('🎨 Starting Rich Menu image combination...');
      
      // สร้าง canvas สำหรับ Rich Menu
      const canvas = createCanvas(this.TOTAL_WIDTH, this.TOTAL_HEIGHT);
      const ctx = canvas.getContext('2d');
      
      // เซต background สีขาว
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, this.TOTAL_WIDTH, this.TOTAL_HEIGHT);
      
      const assetsPath = path.join(__dirname, '../assets/rich-menu-images');
      
      // โหลดรูปภาพทั้งหมด
      console.log('📷 Loading main button image...');
      const mainButton = await loadImage(path.join(assetsPath, 'main-button.png'));
      
      console.log('📷 Loading help button image...');
      const helpButton = await loadImage(path.join(assetsPath, 'help-button.png'));
      
      console.log('📷 Loading history button image...');
      const historyButton = await loadImage(path.join(assetsPath, 'history-button.png'));
      
      // วางรูปภาพในตำแหน่งที่เหมาะสม
      console.log('🖼️ Placing main button at top (2500x843)...');
      ctx.drawImage(mainButton, 0, 0, this.TOTAL_WIDTH, this.BUTTON_HEIGHT);
      
      console.log('🖼️ Placing help button at bottom left (1250x843)...');
      ctx.drawImage(helpButton, 0, this.BUTTON_HEIGHT, 1250, this.BUTTON_HEIGHT);
      
      console.log('🖼️ Placing history button at bottom right (1250x843)...');
      ctx.drawImage(historyButton, 1250, this.BUTTON_HEIGHT, 1250, this.BUTTON_HEIGHT);
      
      // เพิ่มเส้นขอบระหว่างปุ่มเพื่อความชัดเจน
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 2;
      
      // เส้นแนวนอนคั่นแถวบนกับแถวล่าง
      ctx.beginPath();
      ctx.moveTo(0, this.BUTTON_HEIGHT);
      ctx.lineTo(this.TOTAL_WIDTH, this.BUTTON_HEIGHT);
      ctx.stroke();
      
      // เส้นแนวตั้งคั่นปุ่มซ้ายกับปุ่มขวาในแถวล่าง
      ctx.beginPath();
      ctx.moveTo(1250, this.BUTTON_HEIGHT);
      ctx.lineTo(1250, this.TOTAL_HEIGHT);
      ctx.stroke();
      
      console.log('✅ Rich Menu image combination completed!');
      
      return canvas.toBuffer('image/png');
      
    } catch (error) {
      console.error('❌ Error combining Rich Menu images:', error);
      throw error;
    }
  }

  /**
   * บันทึกรูปภาพรวมและตรวจสอบขนาด
   */
  async saveAndCheckCombinedImage(): Promise<void> {
    try {
      const combinedBuffer = await this.combineImages();
      
      const outputPath = path.join(__dirname, '../assets/rich-menu-images/combined-rich-menu.png');
      fs.writeFileSync(outputPath, combinedBuffer);
      
      console.log('📁 Combined Rich Menu saved successfully!');
      console.log(`📍 File location: ${outputPath}`);
      
      // ตรวจสอบขนาดไฟล์
      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      
      console.log(`📏 File size: ${sizeKB} KB (${sizeMB} MB)`);
      
      // ตรวจสอบว่าไฟล์ไม่เกิน 1MB
      if (stats.size > 1024 * 1024) {
        console.warn('⚠️ Warning: File size exceeds 1MB limit for LINE Rich Menu');
        console.log('💡 Consider optimizing the source images');
      } else {
        console.log('✅ File size is within LINE Rich Menu limit (< 1MB)');
      }
      
    } catch (error) {
      console.error('❌ Error saving combined image:', error);
      throw error;
    }
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Rich Menu image combination...');
    
    const combiner = new RichMenuImageCombiner();
    await combiner.saveAndCheckCombinedImage();
    
    console.log('\n🎉 Rich Menu image combination completed successfully!');
    console.log('📱 Ready to deploy to LINE Rich Menu');
    
  } catch (error) {
    console.error('\n❌ Rich Menu image combination failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { RichMenuImageCombiner };