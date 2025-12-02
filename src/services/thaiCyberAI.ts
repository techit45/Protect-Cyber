/**
 * Thai Cybersecurity AI Service
 * บริการ AI ภาษาไทยสำหรับตรวจจับลิงค์มิจฉาชีพ
 */

import axios from 'axios';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface ThaiCyberAIResult {
  riskLevel: 'SAFE' | 'SUSPICIOUS' | 'PHISHING';
  confidence: number;
  threatType: string;
  reasoning: string;
  recommendation: string;
  detectedPatterns: string[];
  processingTime: number;
  modelUsed: string;
}

export interface ThaiCyberAIConfig {
  modelType: 'ollama' | 'huggingface' | 'local';
  modelName: string;
  apiUrl?: string;
  timeout: number;
  fallbackEnabled: boolean;
}

export class ThaiCyberAIService {
  private config: ThaiCyberAIConfig;
  private fallbackPatterns: string[];

  constructor(config: Partial<ThaiCyberAIConfig> = {}) {
    this.config = {
      modelType: 'ollama',
      modelName: 'thai-cybersecurity',
      apiUrl: 'http://localhost:11434',
      timeout: 30000,
      fallbackEnabled: true,
      ...config
    };

    // Pattern-based fallback สำหรับกรณีที่ AI ไม่สามารถใช้งานได้
    this.fallbackPatterns = [
      // Banking phishing patterns
      'บัญชีถูกระงับ', 'ยืนยันตัวตน', 'อัปเดตข้อมูล', 'ชำระค่าธรรมเนียม',
      'หมดอายุ', 'กรุณาดำเนินการ', 'ด่วน', 'รีบ', 'ทันที', 'จำกัดเวลา',
      
      // Prize scam patterns
      'รางวัล', 'โชคดี', 'ได้รับเลือก', 'ผู้โชคดี', 'รับฟรี', 'แจกฟรี',
      'เครดิตฟรี', 'ฟรีเครดิต', 'ของรางวัล', 'รับสิทธิพิเศษ', 'ถูกรางวัล',
      
      // Urgent patterns
      'เฉพาะวันนี้', 'ด่วนที่สุด', 'อย่าพลาด', 'เสียโอกาส', 'ปิดระบบ'
    ];
  }

  /**
   * วิเคราะห์ URL ด้วย AI ภาษาไทย
   */
  async analyzeURL(url: string, title: string = '', content: string = ''): Promise<ThaiCyberAIResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🤖 Analyzing URL with Thai AI: ${url}`);
      
      let result: ThaiCyberAIResult;
      
      // ลองใช้ AI models ตามลำดับ
      switch (this.config.modelType) {
        case 'ollama':
          result = await this.analyzeWithOllama(url, title, content);
          break;
        case 'huggingface':
          result = await this.analyzeWithHuggingFace(url, title, content);
          break;
        case 'local':
          result = await this.analyzeWithLocalModel(url, title, content);
          break;
        default:
          throw new Error(`Unsupported model type: ${this.config.modelType}`);
      }
      
      result.processingTime = Date.now() - startTime;
      return result;
      
    } catch (error) {
      console.error('❌ Thai AI analysis failed:', error);
      
      // ใช้ fallback ถ้าเปิดใช้งาน
      if (this.config.fallbackEnabled) {
        return this.fallbackAnalysis(url, title, content, Date.now() - startTime);
      } else {
        throw error;
      }
    }
  }

  /**
   * วิเคราะห์ด้วย Ollama
   */
  private async analyzeWithOllama(url: string, title: string, content: string): Promise<ThaiCyberAIResult> {
    const prompt = this.createAnalysisPrompt(url, title, content);
    
    const data = {
      model: this.config.modelName,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40
      }
    };
    
    const response = await axios.post(
      `${this.config.apiUrl}/api/generate`,
      data,
      { timeout: this.config.timeout }
    );
    
    if (response.status !== 200) {
      throw new Error(`Ollama API error: ${response.status}`);
    }
    
    const responseText = response.data.response;
    return this.parseAIResponse(responseText, 'ollama');
  }

  /**
   * วิเคราะห์ด้วย HuggingFace
   */
  private async analyzeWithHuggingFace(url: string, title: string, content: string): Promise<ThaiCyberAIResult> {
    // สำหรับการใช้งาน HuggingFace API
    const prompt = this.createAnalysisPrompt(url, title, content);
    
    // ตัวอย่างการเรียก HuggingFace API
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${this.config.modelName}`,
      { inputs: prompt },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: this.config.timeout
      }
    );
    
    const responseText = response.data[0]?.generated_text || '';
    return this.parseAIResponse(responseText, 'huggingface');
  }

  /**
   * วิเคราะห์ด้วย Local Model
   */
  private async analyzeWithLocalModel(url: string, title: string, content: string): Promise<ThaiCyberAIResult> {
    const prompt = this.createAnalysisPrompt(url, title, content);
    
    return new Promise((resolve, reject) => {
      const python = spawn('python', [
        path.join(__dirname, '../../scripts/analyze_with_local_model.py'),
        '--model', this.config.modelName,
        '--prompt', prompt
      ]);
      
      let output = '';
      let errorOutput = '';
      
      python.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      python.on('close', (code) => {
        if (code === 0) {
          try {
            const result = this.parseAIResponse(output, 'local');
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse local model output: ${error}`));
          }
        } else {
          reject(new Error(`Local model failed: ${errorOutput}`));
        }
      });
      
      // Set timeout
      setTimeout(() => {
        python.kill();
        reject(new Error('Local model timeout'));
      }, this.config.timeout);
    });
  }

  /**
   * สร้าง prompt สำหรับการวิเคราะห์
   */
  private createAnalysisPrompt(url: string, title: string, content: string): string {
    return `ตรวจสอบลิงค์นี้ว่าเป็นลิงค์มิจฉาชีพหรือไม่:

URL: ${url}
หัวข้อ: ${title}
เนื้อหา: ${content.substring(0, 1000)}

กรุณาวิเคราะห์และให้ผลลัพธ์ในรูปแบบ JSON:
{
  "risk_level": "SAFE|SUSPICIOUS|PHISHING",
  "confidence": 0.0-1.0,
  "threat_type": "ประเภทภัยคุกคาม",
  "reasoning": "เหตุผลการตัดสินใจ",
  "recommendation": "คำแนะนำ",
  "detected_patterns": ["รูปแบบที่พบ"]
}

สิ่งที่ต้องตรวจสอบ:
1. URL ที่เลียนแบบเว็บไซต์จริง (typosquatting)
2. ข้อความที่กระตุ้นความกลัวหรือความรีบด่วน
3. การขอข้อมูลส่วนตัว เช่น รหัสผ่าน เลขบัตร
4. รางวัลหรือข้อเสนอที่ดีเกินจริง
5. โดเมนที่น่าสงสัย (.tk, .ml, .ga, .cf)
6. การใช้ HTTP แทน HTTPS สำหรับข้อมูลสำคัญ

ตอบเป็นภาษาไทยเท่านั้น:`;
  }

  /**
   * แปลงผลลัพธ์จาก AI
   */
  private parseAIResponse(responseText: string, modelType: string): ThaiCyberAIResult {
    try {
      // พยายามหา JSON ในคำตอบ
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        return {
          riskLevel: this.normalizeRiskLevel(parsed.risk_level),
          confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
          threatType: parsed.threat_type || 'UNKNOWN',
          reasoning: parsed.reasoning || 'ไม่สามารถวิเคราะห์ได้',
          recommendation: parsed.recommendation || 'ควรตรวจสอบเพิ่มเติม',
          detectedPatterns: Array.isArray(parsed.detected_patterns) ? parsed.detected_patterns : [],
          processingTime: 0,
          modelUsed: modelType
        };
      } else {
        // ถ้าไม่เจอ JSON ให้วิเคราะห์จากข้อความ
        return this.parseTextResponse(responseText, modelType);
      }
    } catch (error) {
      console.error('❌ Error parsing AI response:', error);
      return this.parseTextResponse(responseText, modelType);
    }
  }

  /**
   * แปลงผลลัพธ์จากข้อความธรรมดา
   */
  private parseTextResponse(responseText: string, modelType: string): ThaiCyberAIResult {
    const text = responseText.toLowerCase();
    
    let riskLevel: 'SAFE' | 'SUSPICIOUS' | 'PHISHING' = 'SUSPICIOUS';
    let confidence = 0.5;
    let threatType = 'UNKNOWN';
    
    // วิเคราะห์จากคำสำคัญ
    if (text.includes('phishing') || text.includes('หลอกลวง') || text.includes('อันตราย')) {
      riskLevel = 'PHISHING';
      confidence = 0.8;
      threatType = 'PHISHING';
    } else if (text.includes('ปลอดภัย') || text.includes('safe') || text.includes('เชื่อถือได้')) {
      riskLevel = 'SAFE';
      confidence = 0.7;
      threatType = 'LEGITIMATE';
    } else if (text.includes('ระวัง') || text.includes('suspicious') || text.includes('น่าสงสัย')) {
      riskLevel = 'SUSPICIOUS';
      confidence = 0.6;
      threatType = 'SUSPICIOUS';
    }
    
    return {
      riskLevel,
      confidence,
      threatType,
      reasoning: responseText.substring(0, 200) + '...',
      recommendation: this.getRecommendationByRisk(riskLevel),
      detectedPatterns: [],
      processingTime: 0,
      modelUsed: modelType
    };
  }

  /**
   * ปรับปรุงระดับความเสี่ยง
   */
  private normalizeRiskLevel(riskLevel: string): 'SAFE' | 'SUSPICIOUS' | 'PHISHING' {
    const normalized = riskLevel.toLowerCase();
    
    if (normalized.includes('safe') || normalized.includes('ปลอดภัย')) {
      return 'SAFE';
    } else if (normalized.includes('phishing') || normalized.includes('อันตราย')) {
      return 'PHISHING';
    } else {
      return 'SUSPICIOUS';
    }
  }

  /**
   * การวิเคราะห์ fallback
   */
  private fallbackAnalysis(url: string, title: string, content: string, processingTime: number): ThaiCyberAIResult {
    console.log('🔄 Using fallback pattern analysis');
    
    let suspiciousScore = 0;
    const detectedPatterns: string[] = [];
    
    // ตรวจสอบ URL
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      
      // ตรวจสอบ TLD ที่น่าสงสัย
      const suspiciousTLDs = ['tk', 'ml', 'ga', 'cf', 'gq', 'pw'];
      const tld = domain.split('.').pop();
      if (tld && suspiciousTLDs.includes(tld)) {
        suspiciousScore += 0.4;
        detectedPatterns.push('suspicious_tld');
      }
      
      // ตรวจสอบ IP address
      if (/\d+\.\d+\.\d+\.\d+/.test(domain)) {
        suspiciousScore += 0.3;
        detectedPatterns.push('ip_address');
      }
      
      // ตรวจสอบ HTTP
      if (url.startsWith('http://')) {
        suspiciousScore += 0.2;
        detectedPatterns.push('insecure_protocol');
      }
      
    } catch (error) {
      suspiciousScore += 0.2;
      detectedPatterns.push('invalid_url');
    }
    
    // ตรวจสอบเนื้อหา
    const fullContent = `${title} ${content}`.toLowerCase();
    
    let patternMatches = 0;
    for (const pattern of this.fallbackPatterns) {
      if (fullContent.includes(pattern.toLowerCase())) {
        patternMatches++;
        detectedPatterns.push(`keyword_${pattern}`);
      }
    }
    
    // คำนวณคะแนนจาก pattern
    suspiciousScore += Math.min(patternMatches * 0.1, 0.5);
    
    // กำหนดระดับความเสี่ยง
    let riskLevel: 'SAFE' | 'SUSPICIOUS' | 'PHISHING';
    let threatType: string;
    
    if (suspiciousScore >= 0.7) {
      riskLevel = 'PHISHING';
      threatType = 'PHISHING';
    } else if (suspiciousScore >= 0.4) {
      riskLevel = 'SUSPICIOUS';
      threatType = 'SUSPICIOUS';
    } else {
      riskLevel = 'SAFE';
      threatType = 'LEGITIMATE';
    }
    
    return {
      riskLevel,
      confidence: Math.min(suspiciousScore, 1.0),
      threatType,
      reasoning: `วิเคราะห์ด้วย Pattern-based Fallback: พบรูปแบบน่าสงสัย ${patternMatches} แบบ`,
      recommendation: this.getRecommendationByRisk(riskLevel),
      detectedPatterns,
      processingTime,
      modelUsed: 'fallback'
    };
  }

  /**
   * สร้างคำแนะนำตามระดับความเสี่ยง
   */
  private getRecommendationByRisk(riskLevel: 'SAFE' | 'SUSPICIOUS' | 'PHISHING'): string {
    switch (riskLevel) {
      case 'SAFE':
        return 'ลิงค์นี้ดูปลอดภัย สามารถใช้งานได้';
      case 'SUSPICIOUS':
        return 'ควรระวังและตรวจสอบให้ดีก่อนใช้งาน';
      case 'PHISHING':
        return 'อันตราย! ห้ามคลิกหรือกรอกข้อมูลส่วนตัว';
      default:
        return 'ไม่สามารถประเมินได้ ควรระวัง';
    }
  }

  /**
   * ตรวจสอบสถานะของ AI service
   */
  async checkStatus(): Promise<{
    available: boolean;
    modelType: string;
    modelName: string;
    responseTime: number;
  }> {
    const startTime = Date.now();
    
    try {
      // ทดสอบด้วย URL ง่ายๆ
      const testResult = await this.analyzeURL(
        'https://google.com',
        'Google',
        'Google Search Engine'
      );
      
      return {
        available: true,
        modelType: this.config.modelType,
        modelName: this.config.modelName,
        responseTime: Date.now() - startTime
      };
      
    } catch (error) {
      return {
        available: false,
        modelType: this.config.modelType,
        modelName: this.config.modelName,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * อัปเดตการตั้งค่า
   */
  updateConfig(newConfig: Partial<ThaiCyberAIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Thai Cyber AI config updated:', this.config);
  }
}