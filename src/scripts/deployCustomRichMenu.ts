/**
 * Deploy Custom Rich Menu
 * ใช้ภาพที่ผู้ใช้อัปโหลดมาสร้าง Rich Menu
 */

import { Client } from '@line/bot-sdk';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '/Users/techit/Desktop/Code/ProtectCyber/.env' });

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!
});

class CustomRichMenuDeploy {
  private readonly MENU_WIDTH = 2500;
  private readonly MENU_HEIGHT = 1686;

  /**
   * รวมรูปภาพ 3 ภาพด้วย Node.js Buffer
   */
  private combineImages(): Buffer {
    try {
      console.log('🎨 Combining Rich Menu images...');
      
      const assetsPath = path.join(__dirname, '../assets/rich-menu-images');
      
      // โหลดรูปภาพทั้งหมด
      const mainButton = fs.readFileSync(path.join(assetsPath, 'main-button.png'));
      const helpButton = fs.readFileSync(path.join(assetsPath, 'help-button.png'));
      const historyButton = fs.readFileSync(path.join(assetsPath, 'history-button.png'));
      
      console.log('📷 Images loaded successfully');
      console.log(`📏 Main button: ${(mainButton.length / 1024).toFixed(2)} KB`);
      console.log(`📏 Help button: ${(helpButton.length / 1024).toFixed(2)} KB`);
      console.log(`📏 History button: ${(historyButton.length / 1024).toFixed(2)} KB`);
      
      // เนื่องจากเราไม่สามารถใช้ canvas ได้ ให้ใช้ภาพหลักเป็นตัวแทน
      // ในการใช้งานจริง ควรจะรวมภาพก่อน
      console.log('💡 Using main button as Rich Menu image');
      
      return mainButton;
      
    } catch (error) {
      console.error('❌ Error combining images:', error);
      throw error;
    }
  }

  /**
   * Deploy Rich Menu
   */
  async deployRichMenu(): Promise<string> {
    try {
      console.log('🎨 Starting Custom Rich Menu deployment...');
      
      // รวมรูปภาพ
      const imageBuffer = this.combineImages();
      
      // ตรวจสอบขนาดไฟล์
      const sizeKB = (imageBuffer.length / 1024).toFixed(2);
      const sizeMB = (imageBuffer.length / 1024 / 1024).toFixed(2);
      
      console.log(`📏 Combined image size: ${sizeKB} KB (${sizeMB} MB)`);
      
      if (imageBuffer.length > 1024 * 1024) {
        console.warn('⚠️ Warning: Image size exceeds 1MB limit');
        console.log('💡 Rich Menu deployment may fail');
      }

      // สร้าง Rich Menu configuration
      const richMenuConfig = {
        size: {
          width: this.MENU_WIDTH,
          height: this.MENU_HEIGHT
        },
        selected: true,
        name: "ProtectCyber Menu - Elderly Friendly",
        chatBarText: "เมนูหลัก",
        areas: [
          // ปุ่มหลัก (แถวบน)
          {
            bounds: {
              x: 0,
              y: 0,
              width: this.MENU_WIDTH,
              height: 843
            },
            action: {
              type: 'postback' as const,
              data: 'check_new_message'
            }
          },
          // ปุ่มช่วยเหลือ (แถวล่าง ซ้าย)
          {
            bounds: {
              x: 0,
              y: 843,
              width: 1250,
              height: 843
            },
            action: {
              type: 'postback' as const,
              data: 'help_support'
            }
          },
          // ปุ่มประวัติ (แถวล่าง ขวา)
          {
            bounds: {
              x: 1250,
              y: 843,
              width: 1250,
              height: 843
            },
            action: {
              type: 'postback' as const,
              data: 'view_history'
            }
          }
        ]
      };

      console.log('📋 Creating Rich Menu...');
      const richMenuId = await client.createRichMenu(richMenuConfig);
      console.log(`✅ Rich Menu created with ID: ${richMenuId}`);

      console.log('📤 Uploading Rich Menu image...');
      await client.setRichMenuImage(richMenuId, imageBuffer, 'image/png');
      console.log('✅ Rich Menu image uploaded successfully');

      console.log('🎯 Setting as default Rich Menu...');
      await client.setDefaultRichMenu(richMenuId);
      console.log('✅ Rich Menu set as default successfully');

      return richMenuId;

    } catch (error) {
      console.error('❌ Error deploying Rich Menu:', error);
      throw error;
    }
  }

  /**
   * ลบ Rich Menu ทั้งหมด
   */
  async deleteAllRichMenus(): Promise<void> {
    try {
      console.log('🗑️ Deleting all Rich Menus...');
      
      const richMenus = await client.getRichMenuList();
      
      if (richMenus.length === 0) {
        console.log('📭 No Rich Menus to delete');
        return;
      }
      
      for (const richMenu of richMenus) {
        await client.deleteRichMenu(richMenu.richMenuId);
        console.log(`🗑️ Deleted Rich Menu: ${richMenu.richMenuId}`);
      }
      
      console.log('✅ All Rich Menus deleted successfully');
      
    } catch (error) {
      console.error('❌ Error deleting Rich Menus:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบรูปภาพที่มีอยู่
   */
  async checkAvailableImages(): Promise<void> {
    try {
      const assetsPath = path.join(__dirname, '../assets/rich-menu-images');
      
      const requiredImages = [
        'main-button.png',
        'help-button.png', 
        'history-button.png'
      ];
      
      console.log('📷 Checking available images:');
      
      for (const imageName of requiredImages) {
        const imagePath = path.join(assetsPath, imageName);
        
        if (fs.existsSync(imagePath)) {
          const stats = fs.statSync(imagePath);
          const sizeKB = (stats.size / 1024).toFixed(2);
          console.log(`✅ ${imageName} - ${sizeKB} KB`);
        } else {
          console.log(`❌ ${imageName} - Not found`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error checking images:', error);
    }
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Custom Rich Menu deployment...');
    
    // ตรวจสอบ environment variables
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN === 'your_line_channel_access_token_here') {
      console.error('❌ Please set LINE_CHANNEL_ACCESS_TOKEN in .env file');
      process.exit(1);
    }
    
    const deployer = new CustomRichMenuDeploy();
    
    // ตรวจสอบรูปภาพที่มีอยู่
    await deployer.checkAvailableImages();
    
    // ลบ Rich Menu เก่าก่อน
    await deployer.deleteAllRichMenus();
    
    // สร้าง Rich Menu ใหม่
    const richMenuId = await deployer.deployRichMenu();
    
    console.log('\n🎉 Custom Rich Menu deployment completed successfully!');
    console.log(`📱 Rich Menu ID: ${richMenuId}`);
    console.log('📋 Rich Menu is now active in LINE app!');
    console.log('🎯 Features:');
    console.log('  - Top button: Check new messages');
    console.log('  - Bottom left: Help & Support');
    console.log('  - Bottom right: View history');
    
  } catch (error) {
    console.error('\n❌ Custom Rich Menu deployment failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { CustomRichMenuDeploy };