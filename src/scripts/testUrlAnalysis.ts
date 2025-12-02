/**
 * Test script for URL Content Analysis
 * ทดสอบระบบตรวจสอบเนื้อหาลิงค์ด้วย AI
 */

import { ThreatDetectorService } from '../services/threatDetector';
import { URLContentAnalyzerService } from '../services/urlContentAnalyzer';

async function testUrlAnalysis() {
  console.log('🧪 Starting URL Analysis Test...\n');
  
  const threatDetector = new ThreatDetectorService();
  const urlAnalyzer = new URLContentAnalyzerService();
  
  // Test cases with different types of messages containing URLs
  const testCases = [
    {
      name: 'ข้อความปกติที่มี URL ปลอดภัย',
      message: 'ดูข่าวนี้ครับ https://www.thaipbs.or.th/news/content/123456 น่าสนใจมาก'
    },
    {
      name: 'ข้อความต้องสงสัยที่มี URL ไม่รู้จัก', 
      message: 'คุณได้รับรางวัล! กดลิงค์นี้เลย https://suspicious-site.com/prize เพื่อรับเงิน 1 ล้านบาท'
    },
    {
      name: 'ข้อความธนาคารปลอมที่มี URL',
      message: 'ธนาคารกสิกรไทย: บัญชีของคุณถูกระงับ กรุณายืนยันตัวตนที่ https://fake-kbank.com/verify ภายใน 24 ชั่วโมง'
    },
    {
      name: 'ข้อความที่มีหลาย URLs',
      message: 'ลงทุนกับเรา รับประกันผลตอบแทน 50% ต่อเดือน! https://scam-investment.com และ https://fake-forex.net'
    },
    {
      name: 'ข้อความไม่มี URL',
      message: 'สวัสดีครับ วันนี้อากาศดีมากเลย'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📝 ทดสอบ: ${testCase.name}`);
    console.log(`💬 ข้อความ: "${testCase.message}"`);
    console.log('─'.repeat(80));
    
    try {
      const startTime = Date.now();
      
      // ทดสอบด้วย ThreatDetector ที่มี URL analysis แล้ว
      const result = await threatDetector.analyze(testCase.message, 'test-user');
      
      const processingTime = Date.now() - startTime;
      
      console.log('📊 ผลการวิเคราะห์:');
      console.log(`   🎯 ระดับความเสี่ยง: ${result.riskLevel} (${result.riskScore.toFixed(2)})`);
      console.log(`   🔍 ประเภทภัย: ${result.threatType}`);
      console.log(`   ⚡ เวลาการประมวลผล: ${processingTime}ms`);
      
      if (result.hasUrls) {
        console.log(`   🔗 พบ URL: ${result.urls?.length || 0} ลิงค์`);
        
        if (result.urlAnalysisResults && result.urlAnalysisResults.length > 0) {
          console.log('   📋 รายละเอียด URL:');
          result.urlAnalysisResults.forEach((urlResult, index) => {
            console.log(`      ${index + 1}. ${urlResult.url}`);
            console.log(`         ความเสี่ยง: ${urlResult.riskLevel} (${urlResult.riskScore.toFixed(2)})`);
            console.log(`         ประเภท: ${urlResult.threatType}`);
            console.log(`         เข้าถึงได้: ${urlResult.isAccessible ? 'ใช่' : 'ไม่'}`);
            if (urlResult.title) {
              console.log(`         หัวข้อ: ${urlResult.title.substring(0, 50)}...`);
            }
          });
        }
      } else {
        console.log('   🔗 ไม่พบ URL ในข้อความ');
      }
      
      if (result.detectedPatterns.length > 0) {
        console.log(`   🚨 รูปแบบที่ตรวจพบ: ${result.detectedPatterns.join(', ')}`);
      }
      
      if (result.recommendations.length > 0) {
        console.log('   💡 คำแนะนำ:');
        result.recommendations.slice(0, 3).forEach(rec => {
          console.log(`      • ${rec}`);
        });
      }
      
    } catch (error) {
      console.error(`❌ ข้อผิดพลาด: ${error}`);
    }
    
    console.log('─'.repeat(80));
  }
  
  // ทดสอบ URL Analyzer โดยตรง
  console.log('\n🔧 ทดสอบ URL Analyzer โดยตรง...');
  
  const testUrls = [
    'https://www.google.com',
    'https://fake-banking-site.malicious.com',
    'https://this-does-not-exist-123456.com'
  ];
  
  for (const url of testUrls) {
    console.log(`\n🔗 ทดสอบ URL: ${url}`);
    
    try {
      const result = await urlAnalyzer.analyzeURL(url, { timeout: 5000 });
      
      console.log(`   ✅ ผลลัพธ์: ${result.riskLevel} (${result.riskScore.toFixed(2)})`);
      console.log(`   📊 ประเภท: ${result.threatType}`);
      console.log(`   🌐 เข้าถึงได้: ${result.isAccessible}`);
      console.log(`   ⏱️ เวลาตอบสนอง: ${result.responseTime}ms`);
      
      if (result.title) {
        console.log(`   📰 หัวข้อ: ${result.title.substring(0, 50)}...`);
      }
      
    } catch (error) {
      console.error(`   ❌ ข้อผิดพลาด: ${error}`);
    }
  }
  
  console.log('\n✅ การทดสอบเสร็จสิ้น');
}

// เรียกใช้ test
if (require.main === module) {
  testUrlAnalysis().catch(console.error);
}

export { testUrlAnalysis };