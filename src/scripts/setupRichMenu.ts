#!/usr/bin/env ts-node

/**
 * สคริปต์สำหรับตั้งค่า Rich Menu
 * รันด้วยคำสั่ง: npx ts-node src/scripts/setupRichMenu.ts
 */

import { RichMenuManager } from '../services/richMenuManager';
import dotenv from 'dotenv';

// โหลด environment variables
dotenv.config({ path: '/Users/techit/Desktop/Code/ProtectCyber/.env' });

async function setupRichMenu() {
  try {
    console.log('🚀 Starting Rich Menu setup...');
    
    // ตรวจสอบ environment variables
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || !process.env.LINE_CHANNEL_SECRET) {
      throw new Error('Missing LINE_CHANNEL_ACCESS_TOKEN or LINE_CHANNEL_SECRET');
    }

    console.log('🔑 Environment variables loaded');
    
    // สร้าง Rich Menu Manager
    const richMenuManager = new RichMenuManager();
    
    // เริ่มต้นระบบ Rich Menu
    await richMenuManager.initializeAllRichMenus();
    
    // แสดงสถานะ
    const status = await richMenuManager.getMenuStatus();
    console.log('📊 Rich Menu Status:');
    console.log('  Main Menu ID:', status.mainMenuId);
    console.log('  Elderly Menu ID:', status.elderlyMenuId);
    console.log('  Emergency Menu ID:', status.emergencyMenuId);
    console.log('  Total Menus:', status.totalMenus);
    
    console.log('✅ Rich Menu setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Rich Menu setup failed:', error);
    process.exit(1);
  }
}

// รันฟังก์ชัน
if (require.main === module) {
  setupRichMenu();
}

export { setupRichMenu };