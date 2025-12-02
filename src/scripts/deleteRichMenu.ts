/**
 * Delete Rich Menu
 * ลบ Rich Menu ทั้งหมด
 */

import { Client } from '@line/bot-sdk';
import * as dotenv from 'dotenv';

// Load environment variables from correct path
dotenv.config({ path: '/Users/techit/Desktop/Code/ProtectCyber/.env' });

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!
});

async function deleteAllRichMenus(): Promise<void> {
  try {
    console.log('🗑️ Deleting all Rich Menus...');
    
    const richMenus = await client.getRichMenuList();
    
    if (richMenus.length === 0) {
      console.log('📭 No Rich Menus found to delete');
      return;
    }
    
    console.log(`📋 Found ${richMenus.length} Rich Menu(s) to delete:`);
    
    for (const richMenu of richMenus) {
      console.log(`🗑️ Deleting Rich Menu: ${richMenu.richMenuId} (${richMenu.name})`);
      await client.deleteRichMenu(richMenu.richMenuId);
      console.log(`✅ Deleted: ${richMenu.richMenuId}`);
    }
    
    console.log('✅ All Rich Menus deleted successfully');
    
    // ตรวจสอบอีกครั้ง
    const remainingMenus = await client.getRichMenuList();
    if (remainingMenus.length === 0) {
      console.log('✅ Confirmed: No Rich Menus remaining');
    } else {
      console.log(`⚠️ Warning: ${remainingMenus.length} Rich Menu(s) still remain`);
    }
    
  } catch (error) {
    console.error('❌ Error deleting Rich Menus:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Rich Menu deletion...');
    
    // ตรวจสอบ environment variables
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN === 'your_line_channel_access_token_here') {
      console.error('❌ Please set LINE_CHANNEL_ACCESS_TOKEN in .env file');
      process.exit(1);
    }
    
    await deleteAllRichMenus();
    
    console.log('\n🎉 Rich Menu deletion completed!');
    console.log('📱 LINE Bot now has no Rich Menu');
    
  } catch (error) {
    console.error('\n❌ Rich Menu deletion failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { deleteAllRichMenus };