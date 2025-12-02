/**
 * Create Simple Rich Menu Image
 * สร้างรูปภาพ Rich Menu ขนาดเล็กแบบง่าย
 */

import fs from 'fs';
import path from 'path';

// สร้างไฟล์ SVG สำหรับ Rich Menu
const createRichMenuSVG = (): string => {
  return `
<svg width="2500" height="1686" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="2500" height="1686" fill="#f8f9fa"/>
  
  <!-- Button Background -->
  <rect x="50" y="50" width="2400" height="1586" fill="#ffffff" stroke="#e9ecef" stroke-width="4" rx="30"/>
  
  <!-- Icon Circle -->
  <circle cx="1250" cy="500" r="150" fill="#2E7D32"/>
  
  <!-- Magnifying Glass Icon -->
  <circle cx="1200" cy="450" r="80" fill="none" stroke="#ffffff" stroke-width="12"/>
  <line x1="1265" y1="515" x2="1320" y2="570" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
  
  <!-- Speech Bubble -->
  <rect x="1300" y="400" width="120" height="80" fill="#ffffff" rx="20"/>
  <polygon points="1300,440 1280,460 1300,480" fill="#ffffff"/>
  
  <!-- Main Text -->
  <text x="1250" y="750" font-family="Arial, sans-serif" font-size="80" font-weight="bold" text-anchor="middle" fill="#2E7D32">
    ตรวจสอบข้อความใหม่
  </text>
  
  <!-- Subtitle -->
  <text x="1250" y="850" font-family="Arial, sans-serif" font-size="48" text-anchor="middle" fill="#666666">
    แตะเพื่อเริ่มตรวจสอบความปลอดภัย
  </text>
  
  <!-- Bottom Border -->
  <rect x="0" y="1580" width="2500" height="106" fill="#2E7D32"/>
  
  <!-- Bottom Text -->
  <text x="1250" y="1650" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="#ffffff">
    🛡️ ProtectCyber - เกราะไซเบอร์ เวอร์ชั่นฟรี
  </text>
</svg>
  `.trim();
};

// สร้างไฟล์ Rich Menu
const createRichMenuImage = async (): Promise<void> => {
  try {
    const svgContent = createRichMenuSVG();
    const outputPath = path.join(__dirname, '../assets/rich-menu-images/simple-rich-menu.svg');
    
    // สร้างโฟลเดอร์ถ้าไม่มี
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // เขียนไฟล์ SVG
    fs.writeFileSync(outputPath, svgContent);
    
    console.log('✅ Simple Rich Menu SVG created successfully!');
    console.log(`📁 File saved to: ${outputPath}`);
    console.log('📏 Size: 2500x1686 pixels');
    console.log('🎨 Format: SVG (lightweight)');
    
    // แสดงขนาดไฟล์
    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`💾 File size: ${sizeKB} KB`);
    
  } catch (error) {
    console.error('❌ Error creating Rich Menu image:', error);
    throw error;
  }
};

// Main function
const main = async (): Promise<void> => {
  try {
    console.log('🎨 Creating Simple Rich Menu image...');
    await createRichMenuImage();
    
    console.log('\n💡 Next steps:');
    console.log('1. Convert SVG to PNG if needed');
    console.log('2. Use this image in Rich Menu deployment');
    console.log('3. File is ready for LINE Rich Menu (under 1MB)');
    
  } catch (error) {
    console.error('❌ Failed to create Rich Menu image:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

export { createRichMenuSVG, createRichMenuImage };