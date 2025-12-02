import axios from 'axios';

export interface AIAnalysisResult {
  isAnalyzed: boolean;
  riskScore: number; // 0-1
  riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  threatType: 'PHISHING' | 'SCAM' | 'SPAM' | 'ROMANCE_SCAM' | 'INVESTMENT_FRAUD' | 'SAFE';
  confidence: number;
  reasoning: string;
  detectedPatterns: string[];
}

export class AIAnalyzer {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://openrouter.ai/api/v1';
  private readonly model = 'meta-llama/llama-3.2-3b-instruct:free'; // Free model for text analysis

  constructor() {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }
    this.apiKey = process.env.OPENROUTER_API_KEY;
  }

  async analyzeMessage(message: string): Promise<AIAnalysisResult> {
    try {
      console.log('🤖 Starting AI analysis...');
      
      const prompt = this.createAnalysisPrompt(message);
      
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a cybersecurity expert specializing in Thai language threat detection. Analyze messages for scams, phishing, and fraudulent content. Respond only in valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://protectcyber.ai',
            'X-Title': 'ProtectCyber AI'
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      console.log('🤖 AI Raw Response:', aiResponse);

      const analysis = this.parseAIResponse(aiResponse);
      console.log('🤖 AI Analysis completed:', {
        riskLevel: analysis.riskLevel,
        threatType: analysis.threatType,
        confidence: analysis.confidence
      });

      return analysis;

    } catch (error) {
      const { logger } = await import('../utils/logger');
      logger.aiAnalysisError('AIAnalyzer', error as Error, { model: this.model });
      
      // Fallback - return neutral analysis
      return {
        isAnalyzed: false,
        riskScore: 0.3,
        riskLevel: 'MEDIUM',
        threatType: 'SAFE',
        confidence: 0.1,
        reasoning: 'AI analysis unavailable, using basic keyword detection',
        detectedPatterns: ['ai_unavailable']
      };
    }
  }

  private createAnalysisPrompt(message: string): string {
    return `
วิเคราะห์ข้อความภาษาไทยต่อไปนี้เพื่อหาภัยคุกคามทางไซเบอร์:

ข้อความ: "${message}"

กรุณาวิเคราะห์และตอบกลับในรูปแบบ JSON เท่านั้น:

{
  "riskScore": 0.0-1.0,
  "riskLevel": "SAFE|LOW|MEDIUM|HIGH|CRITICAL",
  "threatType": "SAFE|PHISHING|SCAM|SPAM|ROMANCE_SCAM|INVESTMENT_FRAUD",
  "confidence": 0.0-1.0,
  "reasoning": "เหตุผลการวิเคราะห์",
  "detectedPatterns": ["รายการสิ่งที่ตรวจพบ"]
}

เกณฑ์การประเมิน:
- SAFE (0.0-0.2): ข้อความปกติ ไม่มีสัญญาณเสี่ยง
- LOW (0.2-0.4): มีคำที่อาจสงสัย แต่ไม่ชัดเจน
- MEDIUM (0.4-0.6): มีสัญญาณเตือนหลายอย่าง
- HIGH (0.6-0.8): มีลักษณะของการหลอกลวงชัดเจน
- CRITICAL (0.8-1.0): เป็นการหลอกลวงอย่างแน่นอน

ประเภทภัยคุกคาม:
- PHISHING: หลอกให้กรอกข้อมูลส่วนตัว, รหัสผ่าน
- SCAM: หลอกเงิน, การพนัน, ลงทุนปลอม
- ROMANCE_SCAM: หลอกรัก, หลอกใจ
- INVESTMENT_FRAUD: หลอกลงทุน, หุ้น, เทรดดิ้ง
- SPAM: โฆษณาสิ่งของ, บริการ
- SAFE: ข้อความปกติ

ตอบเฉพาะ JSON เท่านั้น ไม่ต้องอธิบายเพิ่มเติม
`;
  }

  private parseAIResponse(response: string): AIAnalysisResult {
    try {
      // Clean up the response - remove markdown, extra text
      let cleanResponse = response.trim();
      
      // Extract JSON from response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanResponse);
      
      // Validate and sanitize the response
      return {
        isAnalyzed: true,
        riskScore: Math.max(0, Math.min(1, parseFloat(parsed.riskScore) || 0)),
        riskLevel: this.validateRiskLevel(parsed.riskLevel),
        threatType: this.validateThreatType(parsed.threatType),
        confidence: Math.max(0, Math.min(1, parseFloat(parsed.confidence) || 0.5)),
        reasoning: parsed.reasoning || 'No reasoning provided',
        detectedPatterns: Array.isArray(parsed.detectedPatterns) ? parsed.detectedPatterns : []
      };

    } catch (error) {
      console.error('❌ Failed to parse AI response:', error);
      
      // Fallback parsing - look for keywords in raw response
      const riskLevel = this.extractRiskFromText(response);
      
      return {
        isAnalyzed: false,
        riskScore: this.getRiskScoreFromLevel(riskLevel),
        riskLevel,
        threatType: 'SAFE',
        confidence: 0.3,
        reasoning: 'AI response parsing failed, using keyword analysis',
        detectedPatterns: ['parsing_failed']
      };
    }
  }

  private validateRiskLevel(level: string): 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const validLevels = ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    return validLevels.includes(level) ? level as any : 'MEDIUM';
  }

  private validateThreatType(type: string): 'PHISHING' | 'SCAM' | 'SPAM' | 'ROMANCE_SCAM' | 'INVESTMENT_FRAUD' | 'SAFE' {
    const validTypes = ['PHISHING', 'SCAM', 'SPAM', 'ROMANCE_SCAM', 'INVESTMENT_FRAUD', 'SAFE'];
    return validTypes.includes(type) ? type as any : 'SAFE';
  }

  private extractRiskFromText(text: string): 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('critical')) return 'CRITICAL';
    if (lowerText.includes('high')) return 'HIGH';
    if (lowerText.includes('medium')) return 'MEDIUM';
    if (lowerText.includes('low')) return 'LOW';
    return 'SAFE';
  }

  private getRiskScoreFromLevel(level: string): number {
    switch (level) {
      case 'SAFE': return 0.1;
      case 'LOW': return 0.3;
      case 'MEDIUM': return 0.5;
      case 'HIGH': return 0.7;
      case 'CRITICAL': return 0.9;
      default: return 0.5;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            { role: 'user', content: 'Hello, respond with "OK" if you can understand me.' }
          ],
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ AI connection test successful');
      return true;
    } catch (error) {
      console.error('❌ AI connection test failed:', error);
      return false;
    }
  }
}