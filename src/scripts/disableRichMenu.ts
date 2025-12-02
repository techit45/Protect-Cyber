#!/usr/bin/env ts-node

/**
 * สคริปต์สำหรับปิดการใช้งาน Rich Menu
 */

import { Client } from '@line/bot-sdk';
import dotenv from 'dotenv';

// โหลด environment variables
dotenv.config();

async function disableAllRichMenus() {
  try {
    console.log('🔄 Disabling all Rich Menus...');
    
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || !process.env.LINE_CHANNEL_SECRET) {
      throw new Error('Missing LINE_CHANNEL_ACCESS_TOKEN or LINE_CHANNEL_SECRET');
    }

    const client = new Client({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
      channelSecret: process.env.LINE_CHANNEL_SECRET!,
    });

    // ดู Rich Menu ปัจจุบัน
    const menus = await client.getRichMenuList();
    console.log(`📋 Found ${menus.length} Rich Menu(s)`);

    if (menus.length === 0) {
      console.log('✅ No Rich Menus to disable');
      return;
    }

    // แสดงรายการ Rich Menu
    menus.forEach((menu, index) => {
      console.log(`  ${index + 1}. ${menu.name} (ID: ${menu.richMenuId})`);
      console.log(`     Selected: ${menu.selected}`);
    });

    // ลบ default Rich Menu (ปิดการใช้งาน)
    try {
      await client.deleteDefaultRichMenu();
      console.log('✅ Default Rich Menu disabled');
    } catch (error) {
      console.log('⚠️ No default Rich Menu to disable');
    }

    // ลบ Rich Menu ทั้งหมด (optional)
    console.log('\n🗑️ Deleting all Rich Menus...');
    for (const menu of menus) {
      try {
        await client.deleteRichMenu(menu.richMenuId);
        console.log(`✅ Deleted: ${menu.name}`);
      } catch (error) {
        console.log(`❌ Failed to delete: ${menu.name}`);
      }
    }

    console.log('\n🎯 Rich Menu Status:');
    console.log('  Default Rich Menu: Disabled');
    console.log('  All Rich Menus: Deleted');
    console.log('  Status: Rich Menu is now disabled');
    
  } catch (error) {
    console.error('❌ Failed to disable Rich Menu:', error);
    throw error;
  }
}

// ตรวจสอบสถานะหลังปิด
async function checkStatus() {
  try {
    const client = new Client({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
      channelSecret: process.env.LINE_CHANNEL_SECRET!,
    });

    const menus = await client.getRichMenuList();
    console.log('\n📋 Final Rich Menu Status:');
    
    if (menus.length === 0) {
      console.log('  ✅ No Rich Menus found - Successfully disabled');
    } else {
      console.log(`  ⚠️ ${menus.length} Rich Menu(s) still exist:`);
      menus.forEach((menu, index) => {
        console.log(`    ${index + 1}. ${menu.name} (${menu.richMenuId})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to check status:', error);
  }
}

// Main function
async function main() {
  console.log('🛡️ ProtectCyber Rich Menu - Disable Mode\n');
  
  await disableAllRichMenus();
  await checkStatus();
  
  console.log('\n📝 Rich Menu has been disabled.');
  console.log('💡 To re-enable, run: npx ts-node src/scripts/workingRichMenu.ts');
}

// รันฟังก์ชัน
if (require.main === module) {
  main();
}

export { disableAllRichMenus, checkStatus };