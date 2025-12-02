/**
 * Check Rich Menu Images
 * ตรวจสอบรูปภาพ Rich Menu ทั้งหมด
 */

import fs from 'fs';
import path from 'path';

interface ImageInfo {
  filename: string;
  path: string;
  exists: boolean;
  size?: number;
  description: string;
}

class RichMenuImageChecker {
  private imagesDir = path.join(__dirname, '../assets/rich-menu-images');
  
  private expectedImages: Omit<ImageInfo, 'exists' | 'size'>[] = [
    {
      filename: 'button-1-check-message.png',
      path: '',
      description: 'ตรวจสอบข้อความใหม่ (สีแดง/ฉุกเฉิน)'
    },
    {
      filename: 'button-2-learn-more.png',
      path: '',
      description: 'เรียนรู้เพิ่มเติม (สีเขียว/การศึกษา)'
    },
    {
      filename: 'button-3-report-problem.png',
      path: '',
      description: 'รายงานปัญหา (สีม่วง/รายงาน)'
    },
    {
      filename: 'button-4-help-support.png',
      path: '',
      description: 'ช่วยเหลือคำแนะนำ (สีส้ม/ช่วยเหลือ)'
    },
    {
      filename: 'button-5-old-messages.png',
      path: '',
      description: 'ข้อความเก่าตรวจสอบ (สีฟ้า/ประวัติ)'
    },
    {
      filename: 'button-6-check-message-green.png',
      path: '',
      description: 'ตรวจสอบข้อความใหม่ (สีเขียว)'
    }
  ];

  /**
   * ตรวจสอบว่าโฟลเดอร์มีอยู่หรือไม่
   */
  checkImagesDirectory(): boolean {
    if (!fs.existsSync(this.imagesDir)) {
      console.log('❌ Images directory not found:', this.imagesDir);
      return false;
    }
    
    console.log('✅ Images directory exists:', this.imagesDir);
    return true;
  }

  /**
   * ตรวจสอบรูปภาพทั้งหมด
   */
  checkAllImages(): ImageInfo[] {
    const results: ImageInfo[] = [];
    
    for (const expectedImage of this.expectedImages) {
      const fullPath = path.join(this.imagesDir, expectedImage.filename);
      const exists = fs.existsSync(fullPath);
      
      let size: number | undefined;
      if (exists) {
        const stats = fs.statSync(fullPath);
        size = stats.size;
      }
      
      results.push({
        filename: expectedImage.filename,
        path: fullPath,
        exists,
        size,
        description: expectedImage.description
      });
    }
    
    return results;
  }

  /**
   * แสดงรายงานผลการตรวจสอบ
   */
  showReport(): void {
    console.log('\n📋 Rich Menu Images Report');
    console.log('='.repeat(60));
    
    if (!this.checkImagesDirectory()) {
      console.log('❌ Cannot proceed without images directory');
      return;
    }
    
    const results = this.checkAllImages();
    const existingImages = results.filter(img => img.exists);
    const missingImages = results.filter(img => !img.exists);
    
    // แสดงรูปภาพที่มีอยู่
    if (existingImages.length > 0) {
      console.log('\n✅ Available Images:');
      existingImages.forEach((img, index) => {
        const sizeKB = img.size ? (img.size / 1024).toFixed(2) : 'N/A';
        console.log(`${index + 1}. ${img.filename}`);
        console.log(`   📝 ${img.description}`);
        console.log(`   📏 Size: ${sizeKB} KB`);
        console.log(`   📁 Path: ${img.path}`);
        console.log('');
      });
    }
    
    // แสดงรูปภาพที่ขาดหายไป
    if (missingImages.length > 0) {
      console.log('\n❌ Missing Images:');
      missingImages.forEach((img, index) => {
        console.log(`${index + 1}. ${img.filename}`);
        console.log(`   📝 ${img.description}`);
        console.log(`   📁 Expected at: ${img.path}`);
        console.log('');
      });
    }
    
    // สรุปผลการตรวจสอบ
    console.log('\n📊 Summary:');
    console.log(`Total Expected: ${results.length}`);
    console.log(`Available: ${existingImages.length}`);
    console.log(`Missing: ${missingImages.length}`);
    
    if (missingImages.length === 0) {
      console.log('\n🎉 All Rich Menu images are ready!');
      console.log('✅ You can now deploy the Rich Menu');
    } else {
      console.log('\n⚠️  Some images are missing');
      console.log('📋 Please add missing images before deploying Rich Menu');
    }
  }

  /**
   * ตรวจสอบรูปภาพอื่นๆ ในโฟลเดอร์
   */
  checkAdditionalImages(): void {
    if (!fs.existsSync(this.imagesDir)) {
      return;
    }
    
    const allFiles = fs.readdirSync(this.imagesDir);
    const imageFiles = allFiles.filter(file => 
      file.toLowerCase().endsWith('.png') || 
      file.toLowerCase().endsWith('.jpg') || 
      file.toLowerCase().endsWith('.jpeg')
    );
    
    const expectedFilenames = this.expectedImages.map(img => img.filename);
    const additionalImages = imageFiles.filter(file => !expectedFilenames.includes(file));
    
    if (additionalImages.length > 0) {
      console.log('\n📁 Additional Images Found:');
      additionalImages.forEach((filename, index) => {
        const fullPath = path.join(this.imagesDir, filename);
        const stats = fs.statSync(fullPath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        
        console.log(`${index + 1}. ${filename}`);
        console.log(`   📏 Size: ${sizeKB} KB`);
        console.log(`   📁 Path: ${fullPath}`);
        console.log('');
      });
    }
  }

  /**
   * สร้าง Rich Menu Layout Preview
   */
  showRichMenuLayout(): void {
    console.log('\n🎨 Rich Menu Layout (2x3 Grid):');
    console.log('┌─────────────────────┬─────────────────────┬─────────────────────┐');
    console.log('│   ตรวจสอบข้อความใหม่   │   เรียนรู้เพิ่มเติม    │    รายงานปัญหา      │');
    console.log('│    (สีแดง/ฉุกเฉิน)    │   (สีเขียว/การศึกษา)  │   (สีม่วง/รายงาน)   │');
    console.log('├─────────────────────┼─────────────────────┼─────────────────────┤');
    console.log('│  ช่วยเหลือคำแนะนำ     │ ข้อความเก่าตรวจสอบ    │ ตรวจสอบข้อความใหม่   │');
    console.log('│   (สีส้ม/ช่วยเหลือ)   │   (สีฟ้า/ประวัติ)     │   (สีเขียว)        │');
    console.log('└─────────────────────┴─────────────────────┴─────────────────────┘');
  }
}

// ฟังก์ชันหลักสำหรับรัน script
function main() {
  try {
    console.log('🔍 Checking Rich Menu Images...');
    
    const checker = new RichMenuImageChecker();
    checker.showReport();
    checker.checkAdditionalImages();
    checker.showRichMenuLayout();
    
    console.log('\n💡 Next Steps:');
    console.log('1. Make sure all required images are available');
    console.log('2. Run: npm run deploy-rich-menu');
    console.log('3. Test the Rich Menu in LINE app');
    
  } catch (error) {
    console.error('❌ Error checking Rich Menu images:', error);
    process.exit(1);
  }
}

// รันถ้าเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  main();
}

export { RichMenuImageChecker };