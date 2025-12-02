/**
 * Typhoon Integration Service
 * บริการสำหรับเชื่อมต่อกับ Typhoon AI Model
 */

import { spawn } from 'child_process';
import axios from 'axios';
import path from 'path';

export interface TyphoonAnalysisResult {
  url?: string;
  riskLevel: 'SAFE' | 'SUSPICIOUS' | 'PHISHING';
  confidence: number;
  threatType: string;
  reasoning: string;
  recommendation: string;
  detectedPatterns: string[];
  suspiciousKeywords?: string[];
  isTrustedDomain?: boolean;
  modelUsed?: string;
}

export interface TyphoonServiceConfig {
  modelPath: string;
  useGradio: boolean;
  fallbackEnabled: boolean;
  apiUrl?: string;
  timeout?: number;
}

export default class TyphoonCyberSecurityService {
  private config: TyphoonServiceConfig;
  private isInitialized = false;
  
  constructor(config: TyphoonServiceConfig) {
    this.config = {
      apiUrl: 'http://localhost:7860',
      timeout: 30000,
      ...config
    };
  }

  /**
   * เริ่มต้นใช้งาน service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🌪️ Initializing Typhoon service...');
      
      // ตรวจสอบการเชื่อมต่อ Gradio API
      if (this.config.useGradio) {
        await this.checkGradioHealth();
      }
      
      this.isInitialized = true;
      console.log('✅ Typhoon service initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Typhoon service:', error);
      
      if (this.config.fallbackEnabled) {
        console.log('🔄 Fallback mode enabled - continuing with limited functionality');
        this.isInitialized = true;
      } else {
        throw error;
      }
    }
  }

  /**
   * วิเคราะห์ URL ด้วย Typhoon
   */
  async analyzeURL(url: string, title: string = '', content: string = ''): Promise<TyphoonAnalysisResult> {
    try {
      console.log('🌪️ Analyzing URL with Typhoon:', url);
      
      // ใช้ Typhoon simulator จาก scripts
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      // Run Python analyzer
      const pythonScript = path.join(__dirname, '../../../scripts/run_typhoon_check.py');
      const command = `python3 "${pythonScript}" "${url}" --title "${title}" --content "${content}" --json`;
      
      const { stdout } = await execAsync(command);
      const result = JSON.parse(stdout);
      
      return {
        url,
        riskLevel: result.risk_level as 'SAFE' | 'SUSPICIOUS' | 'PHISHING',
        confidence: result.confidence,
        threatType: result.threat_type,
        reasoning: result.reasoning,
        recommendation: result.recommendation,
        detectedPatterns: result.detected_patterns || [],
        suspiciousKeywords: result.suspicious_keywords || [],
        isTrustedDomain: result.is_trusted_domain,
        modelUsed: result.model_used || 'typhoon-simulator'
      };
      
    } catch (error) {
      console.error('❌ Typhoon URL analysis failed:', error);
      return this.getFallbackResult(url, 'URL_ANALYSIS_FAILED');
    }
  }

  /**
   * วิเคราะห์ข้อความด้วย Typhoon
   */
  async analyzeText(text: string): Promise<TyphoonAnalysisResult> {
    try {
      console.log('🌪️ Analyzing text with Typhoon');
      
      // ใช้ Typhoon simulator
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      // Run Python analyzer for text analysis
      const pythonScript = path.join(__dirname, '../../../scripts/run_typhoon_check.py');
      const command = `python3 "${pythonScript}" "text://analysis" --content "${text}" --json`;
      
      const { stdout } = await execAsync(command);
      const result = JSON.parse(stdout);
      
      return {
        riskLevel: result.risk_level as 'SAFE' | 'SUSPICIOUS' | 'PHISHING',
        confidence: result.confidence,
        threatType: result.threat_type,
        reasoning: result.reasoning,
        recommendation: result.recommendation,
        detectedPatterns: result.detected_patterns || [],
        suspiciousKeywords: result.suspicious_keywords || [],
        modelUsed: result.model_used || 'typhoon-simulator'
      };
      
    } catch (error) {
      console.error('❌ Typhoon text analysis failed:', error);
      return this.getFallbackResult('', 'TEXT_ANALYSIS_FAILED');
    }
  }

  /**
   * ตรวจสอบสถานะของ Gradio API
   */
  private async checkGradioHealth(): Promise<void> {
    try {
      const response = await axios.get(`${this.config.apiUrl}/health`, {
        timeout: 5000
      });
      
      if (response.status === 200) {
        console.log('✅ Gradio API is healthy');
      }
    } catch (error) {
      console.log('⚠️ Gradio API not available, using fallback mode');
      throw error;
    }
  }

  /**
   * ตรวจสอบสถานะของ service
   */
  async checkHealth(): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      return {
        status: 'healthy',
        gradioAvailable: this.config.useGradio,
        fallbackEnabled: this.config.fallbackEnabled,
        modelPath: this.config.modelPath
      };
      
    } catch (error: any) {
      return {
        status: 'unhealthy',
        error: error.message,
        fallbackEnabled: this.config.fallbackEnabled
      };
    }
  }

  /**
   * ผลลัพธ์ fallback เมื่อเกิดข้อผิดพลาด
   */
  private getFallbackResult(url: string = '', errorType: string): TyphoonAnalysisResult {
    return {
      url,
      riskLevel: 'SUSPICIOUS',
      confidence: 0.3,
      threatType: 'ANALYSIS_ERROR',
      reasoning: `Typhoon analysis failed: ${errorType}`,
      recommendation: 'ไม่สามารถวิเคราะห์ด้วย Typhoon ได้ กรุณาตรวจสอบด้วยวิธีอื่น',
      detectedPatterns: ['typhoon_analysis_failed'],
      modelUsed: 'fallback'
    };
  }

  /**
   * วิเคราะห์ด้วย Gradio API
   */
  private async analyzeWithGradio(url: string, title: string, content: string): Promise<TyphoonAnalysisResult> {
    try {
      const response = await axios.post(`${this.config.apiUrl}/api/predict`, {
        data: [url, title, content]
      }, {
        timeout: this.config.timeout
      });
      
      // Parse response from Gradio
      const result = response.data.data[0];
      
      return {
        url,
        riskLevel: result.risk_level || 'SUSPICIOUS',
        confidence: result.confidence || 0.5,
        threatType: result.threat_type || 'UNKNOWN',
        reasoning: result.reasoning || 'Gradio analysis completed',
        recommendation: result.recommendation || 'ตรวจสอบเพิ่มเติม',
        detectedPatterns: result.detected_patterns || [],
        modelUsed: 'typhoon-gradio'
      };
      
    } catch (error) {
      console.error('❌ Gradio API call failed:', error);
      throw error;
    }
  }
}