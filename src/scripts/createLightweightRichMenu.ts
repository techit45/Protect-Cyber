/**
 * Create Lightweight Rich Menu
 * สร้างรูปภาพ Rich Menu ที่มีขนาดเล็ก
 */

import fs from 'fs';
import path from 'path';

// สร้างรูปภาพ Rich Menu ขนาดเล็กแบบ Base64
const createLightweightRichMenuImage = (): Buffer => {
  // สร้าง SVG ขนาดเล็ก
  const svgContent = `
<svg width="800" height="540" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="800" height="540" fill="#f8f9fa"/>
  
  <!-- Main Button -->
  <rect x="50" y="50" width="700" height="440" fill="#ffffff" stroke="#2E7D32" stroke-width="6" rx="20"/>
  
  <!-- Icon -->
  <circle cx="400" cy="150" r="40" fill="#2E7D32"/>
  <text x="400" y="160" font-family="Arial, sans-serif" font-size="30" font-weight="bold" text-anchor="middle" fill="#ffffff">🛡️</text>
  
  <!-- Main Text -->
  <text x="400" y="240" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="#2E7D32">
    ตรวจสอบข้อความใหม่
  </text>
  
  <!-- Subtitle -->
  <text x="400" y="280" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="#666666">
    แตะเพื่อเริ่มตรวจสอบความปลอดภัย
  </text>
  
  <!-- Bottom Text -->
  <text x="400" y="450" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#2E7D32">
    ProtectCyber - เกราะไซเบอร์ เวอร์ชั่นฟรี
  </text>
</svg>
  `.trim();

  // แปลง SVG เป็น base64 data URL แล้วเป็น Buffer
  const base64Data = Buffer.from(svgContent).toString('base64');
  return Buffer.from(base64Data, 'base64');
};

// สร้างรูปภาพ Rich Menu ที่มีขนาดเล็ก
const createMinimalRichMenuImage = (): Buffer => {
  // สร้าง PNG ขนาดเล็กแบบ 1x1 pixel แล้วขยายใหญ่
  const minimumPNGBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9hXFaFQAAAABJRU5ErkJggg==';
  return Buffer.from(minimumPNGBase64, 'base64');
};

// สร้างรูปภาพ Rich Menu ที่ใช้งานได้
const createWorkingRichMenuImage = (): Buffer => {
  // สร้าง PNG ขนาดเล็กสำหรับ Rich Menu
  const simplePNGBase64 = `
iVBORw0KGgoAAAANSUhEUgAAASwAAAGGCAYAAADvwO8EAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABmUlEQVR4nO3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFHwAAQIcAA7BQ8E7EQAAAAASUVORK5CYII=
  `.trim();
  
  return Buffer.from(simplePNGBase64, 'base64');
};

// Main function
const main = async (): Promise<void> => {
  try {
    console.log('🎨 Creating lightweight Rich Menu image...');
    
    // สร้างไฟล์ SVG ขนาดเล็ก
    const svgContent = `
<svg width="2500" height="1686" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="2500" height="1686" fill="#f8f9fa"/>
  
  <!-- Main Button -->
  <rect x="100" y="100" width="2300" height="1486" fill="#ffffff" stroke="#2E7D32" stroke-width="10" rx="50"/>
  
  <!-- Icon -->
  <circle cx="1250" cy="400" r="100" fill="#2E7D32"/>
  <text x="1250" y="430" font-family="Arial, sans-serif" font-size="80" font-weight="bold" text-anchor="middle" fill="#ffffff">🛡️</text>
  
  <!-- Main Text -->
  <text x="1250" y="650" font-family="Arial, sans-serif" font-size="80" font-weight="bold" text-anchor="middle" fill="#2E7D32">
    ตรวจสอบข้อความใหม่
  </text>
  
  <!-- Subtitle -->
  <text x="1250" y="750" font-family="Arial, sans-serif" font-size="48" text-anchor="middle" fill="#666666">
    แตะเพื่อเริ่มตรวจสอบความปลอดภัย
  </text>
  
  <!-- Bottom Text -->
  <text x="1250" y="1450" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="#2E7D32">
    ProtectCyber - เกราะไซเบอร์ เวอร์ชั่นฟรี
  </text>
</svg>
    `.trim();
    
    // บันทึกไฟล์ SVG
    const outputPath = path.join(__dirname, '../assets/rich-menu-images/lightweight-rich-menu.svg');
    
    // สร้างโฟลเดอร์ถ้าไม่มี
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // เขียนไฟล์ SVG
    fs.writeFileSync(outputPath, svgContent);
    
    console.log('✅ Lightweight Rich Menu SVG created successfully!');
    console.log(`📁 File saved to: ${outputPath}`);
    
    // แสดงขนาดไฟล์
    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`💾 File size: ${sizeKB} KB`);
    
    // สร้างไฟล์ PNG ขนาดเล็ก
    const pngBuffer = createWorkingRichMenuImage();
    const pngPath = path.join(__dirname, '../assets/rich-menu-images/lightweight-rich-menu.png');
    fs.writeFileSync(pngPath, pngBuffer);
    
    console.log('✅ Lightweight Rich Menu PNG created successfully!');
    console.log(`📁 PNG file saved to: ${pngPath}`);
    console.log(`💾 PNG file size: ${(pngBuffer.length / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Error creating lightweight Rich Menu image:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

export { createLightweightRichMenuImage, createMinimalRichMenuImage, createWorkingRichMenuImage };