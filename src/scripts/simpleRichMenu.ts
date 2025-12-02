#!/usr/bin/env ts-node

/**
 * สคริปต์สำหรับสร้าง Rich Menu แบบง่าย (ไม่ต้องรูปภาพ)
 */

import { Client, PostbackAction } from '@line/bot-sdk';
import dotenv from 'dotenv';

// โหลด environment variables
dotenv.config();

async function createSimpleRichMenu() {
  try {
    console.log('🚀 Creating Simple Rich Menu...');
    
    // ตรวจสอบ environment variables
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || !process.env.LINE_CHANNEL_SECRET) {
      throw new Error('Missing LINE_CHANNEL_ACCESS_TOKEN or LINE_CHANNEL_SECRET');
    }

    const client = new Client({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
      channelSecret: process.env.LINE_CHANNEL_SECRET!,
    });

    // สร้าง Rich Menu แบบง่าย (ข้อความแทนรูปภาพ)
    const richMenu = {
      size: {
        width: 2500,
        height: 1686
      },
      selected: true,
      name: "ProtectCyber Simple Menu",
      chatBarText: "🛡️ เกราะไซเบอร์",
      areas: [
        // ตรวจสอบข้อความใหม่
        {
          bounds: { x: 0, y: 0, width: 833, height: 843 },
          action: {
            type: "postback",
            data: "check_new_message"
          } as PostbackAction
        },
        // ตรวจสอบข้อความเก่า  
        {
          bounds: { x: 833, y: 0, width: 834, height: 843 },
          action: {
            type: "postback", 
            data: "check_recent_messages"
          } as PostbackAction
        },
        // ขอความช่วยเหลือ
        {
          bounds: { x: 1667, y: 0, width: 833, height: 843 },
          action: {
            type: "postback",
            data: "get_help"
          } as PostbackAction
        },
        // รายงานปัญหา
        {
          bounds: { x: 0, y: 843, width: 833, height: 843 },
          action: {
            type: "postback",
            data: "report_threat"
          } as PostbackAction
        },
        // เรียนรู้เพิ่มเติม
        {
          bounds: { x: 833, y: 843, width: 834, height: 843 },
          action: {
            type: "postback",
            data: "learn_more"
          } as PostbackAction
        },
        // ติดต่อฉุกเฉิน
        {
          bounds: { x: 1667, y: 843, width: 833, height: 843 },
          action: {
            type: "postback",
            data: "emergency_contact"
          } as PostbackAction
        }
      ]
    };

    // ลบ Rich Menu เก่า
    try {
      const existingMenus = await client.getRichMenuList();
      for (const menu of existingMenus) {
        if (menu.name?.includes('ProtectCyber')) {
          await client.deleteRichMenu(menu.richMenuId);
          console.log(`🗑️ Deleted old menu: ${menu.name}`);
        }
      }
    } catch (error) {
      console.log('⚠️ No old menus to delete');
    }

    // สร้าง Rich Menu ใหม่
    const richMenuId = await client.createRichMenu(richMenu);
    console.log('✅ Rich Menu created with ID:', richMenuId);

    // ไม่ต้องอัพโหลดรูปในขั้นนี้ 
    // Rich Menu จะใช้ได้แต่จะเป็นสีขาวเปล่า
    
    console.log('📝 Rich Menu created successfully!');
    console.log('💡 Note: Rich Menu will be white background until image is uploaded');
    console.log('🎯 Rich Menu ID:', richMenuId);
    console.log('');
    console.log('📋 Rich Menu Areas:');
    console.log('  - Top Left: ตรวจสอบข้อความใหม่ (check_new_message)');
    console.log('  - Top Center: ตรวจสอบข้อความเก่า (check_recent_messages)');
    console.log('  - Top Right: ขอความช่วยเหลือ (get_help)');
    console.log('  - Bottom Left: รายงานปัญหา (report_threat)');
    console.log('  - Bottom Center: เรียนรู้เพิ่มเติม (learn_more)');
    console.log('  - Bottom Right: ติดต่อฉุกเฉิน (emergency_contact)');
    
    return richMenuId;
    
  } catch (error) {
    console.error('❌ Failed to create Rich Menu:', error);
    throw error;
  }
}

// รันฟังก์ชัน
if (require.main === module) {
  createSimpleRichMenu();
}

export { createSimpleRichMenu };