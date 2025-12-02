# API Documentation - เกราะไซเบอร์

## REST API Reference

Base URL: `https://api.protectcyber.org` (Production)  
Development: `http://localhost:3000`

---

## 📋 Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Analyze Message](#analyze-message)
  - [Submit Feedback](#submit-feedback)
  - [Get Metrics](#get-metrics)
- [Response Codes](#response-codes)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication

Currently, the API is **public** for the Hackathon version. Future versions will implement API key authentication.

For LINE Webhook, signature verification is required:
```
X-Line-Signature: <base64_encoded_signature>
```

---

## 📡 Endpoints

### Health Check

Check if the API is running and healthy.

**Endpoint**: `GET /health`

**Request**:
```bash
curl http://localhost:3000/health
```

**Response** (200 OK):
```json
{
  "status": "OK",
  "timestamp": "2024-12-02T10:30:00.000Z",
  "uptime": 12345.67,
  "environment": "production",
  "systemHealth": {
    "threatDetectorReady": true,
    "lineBotReady": true,
    "apiVersion": "1.0.0"
  }
}
```

---

### Analyze Message

Analyze a message for cybersecurity threats.

**Endpoint**: `POST /api/analyze`

**Request**:
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "message": "ยินดีด้วย! คุณได้รับรางวัล 500,000 บาท กรุณาโอนค่าธรรมเนียม 2,000 บาท",
    "userId": "user123",
    "options": {
      "useEnhancedDetection": true,
      "useMachineLearning": true,
      "context": {}
    }
  }'
```

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | ข้อความที่ต้องการตรวจสอบ |
| userId | string | No | User ID สำหรับ tracking |
| options | object | No | ตัวเลือกการวิเคราะห์ |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "riskScore": 0.92,
    "riskLevel": "CRITICAL",
    "threatType": "lottery_scam",
    "confidence": 95.8,
    "analysis": {
      "isPhishing": true,
      "isMalware": false,
      "isSocialEngineering": true,
      "keywords": [
        "รางวัล",
        "ทันที",
        "โอนค่าธรรมเนียม"
      ],
      "urls": [
        {
          "url": "https://lottery-fake.com",
          "isSafe": false,
          "reason": "Unknown domain, suspicious SSL"
        }
      ],
      "phoneNumbers": [],
      "suspiciousPatterns": [
        "urgent_action",
        "money_request",
        "prize_notification"
      ]
    },
    "recommendations": [
      "⚠️ ข้อความนี้เป็นการหลอกลวง ห้ามโอนเงิน!",
      "📞 หากสงสัย โทรสอบถาม 1441 (ThaiCERT)",
      "🚫 อย่ากดลิงค์หรือให้ข้อมูลส่วนตัว"
    ],
    "educationalTips": [
      "สำนักงานสลากฯ ไม่เคยขอเงินค่าธรรมเนียมในการรับรางวัล",
      "การแจ้งรางวัลที่แท้จริงจะไม่เร่งรัดให้โอนเงินทันที",
      "ตรวจสอบความถูกต้องของเว็บไซต์ก่อนกดลิงค์เสมอ"
    ],
    "elderlyWarning": "คุณพ่อ/คุณแม่ครับ นี่เป็นข้อความหลอกลวงครับ ห้ามโอนเงินเด็ดขาด ถ้าสงสัยให้ถามลูกหลานก่อนนะครับ",
    "processingTime": 487,
    "analysisMethod": "ai_analysis",
    "allowFeedback": true,
    "messageId": "msg_abc123xyz"
  },
  "metadata": {
    "analysisMethod": "ai_analysis",
    "processingTime": 487,
    "allowFeedback": true
  }
}
```

**Risk Levels**:
- `SAFE` (0.0-0.2): ปลอดภัย
- `LOW` (0.2-0.4): เสี่ยงต่ำ ควรระมัดระวัง
- `MEDIUM` (0.4-0.6): เสี่ยงกลาง ไม่แนะนำ
- `HIGH` (0.6-0.8): เสี่ยงสูง อันตราย
- `CRITICAL` (0.8-1.0): วิกฤต ห้ามดำเนินการ

---

### Submit Feedback

Submit user feedback to improve the system.

**Endpoint**: `POST /api/feedback`

**Request**:
```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "msg_abc123xyz",
    "originalMessage": "ยินดีด้วย! คุณได้รับรางวัล...",
    "originalResult": {
      "riskLevel": "CRITICAL",
      "riskScore": 0.92
    },
    "feedback": "correct",
    "userId": "user123"
  }'
```

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| messageId | string | Yes | ID ของข้อความที่ feedback |
| originalMessage | string | Yes | ข้อความต้นฉบับ |
| originalResult | object | Yes | ผลการวิเคราะห์ที่ได้ |
| feedback | string | Yes | `correct` หรือ `incorrect` |
| userId | string | No | User ID |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "feedbackId": "fb_xyz789abc",
    "recorded": true
  }
}
```

---

### Get Metrics

Get system metrics and learning statistics.

**Endpoint**: `GET /api/metrics`

**Request**:
```bash
curl http://localhost:3000/api/metrics
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "learningMetrics": {
      "totalFeedback": 1250,
      "correctPredictions": 1189,
      "incorrectPredictions": 61,
      "accuracy": 95.12,
      "improvementRate": 12.5,
      "lastUpdate": "2024-12-02T10:30:00.000Z"
    },
    "recommendations": [
      "ระบบมีความแม่นยำสูง แนะนำให้เปิดใช้งาน ML Detection",
      "พบ pattern ใหม่ 3 รูปแบบ แนะนำให้ update database"
    ],
    "systemHealth": {
      "threatDetectorReady": true,
      "lineBotReady": true,
      "apiVersion": "1.0.0",
      "totalAnalyzed": 5000,
      "totalThreatsDetected": 2300,
      "averageResponseTime": 487
    }
  }
}
```

---

### LINE Webhook

Receive events from LINE Platform.

**Endpoint**: `POST /webhook/line`

**Headers**:
```
X-Line-Signature: <signature>
Content-Type: application/json
```

**Request Body**:
```json
{
  "destination": "Uxxxxxx...",
  "events": [
    {
      "type": "message",
      "message": {
        "type": "text",
        "id": "xxxxx",
        "text": "สวัสดีครับ"
      },
      "timestamp": 1234567890123,
      "source": {
        "type": "user",
        "userId": "Uxxxxx..."
      },
      "replyToken": "xxxxx..."
    }
  ]
}
```

**Response**: `200 OK` (Empty body)

The bot will reply to the user via LINE's Reply API.

---

## 📊 Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid signature |
| 404 | Not Found - Endpoint not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## ⚠️ Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional information"
  }
}
```

**Common Error Codes**:
- `MISSING_REQUIRED_FIELD` - Required field missing
- `INVALID_INPUT` - Invalid input format
- `INVALID_SIGNATURE` - LINE signature verification failed
- `ANALYSIS_FAILED` - AI analysis failed
- `RATE_LIMIT_EXCEEDED` - Too many requests

**Example Error Response**:
```json
{
  "success": false,
  "error": "Message is required",
  "code": "MISSING_REQUIRED_FIELD",
  "details": {
    "field": "message",
    "expected": "string",
    "received": "undefined"
  }
}
```

---

## 🚦 Rate Limiting

### Current Limits (Free Tier)
- **100 requests per hour** per IP
- **1000 requests per day** per IP

### Response Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "retryAfter": 3600,
    "limit": 100,
    "window": "1 hour"
  }
}
```

---

## 🔧 Examples

### Python Example
```python
import requests

url = "http://localhost:3000/api/analyze"
payload = {
    "message": "ยินดีด้วย! คุณได้รับรางวัล 500,000 บาท",
    "userId": "user123"
}

response = requests.post(url, json=payload)
result = response.json()

if result["success"]:
    print(f"Risk Level: {result['data']['riskLevel']}")
    print(f"Risk Score: {result['data']['riskScore']}")
else:
    print(f"Error: {result['error']}")
```

### JavaScript Example
```javascript
const axios = require('axios');

async function analyzeMessage(message) {
  try {
    const response = await axios.post('http://localhost:3000/api/analyze', {
      message: message,
      userId: 'user123'
    });
    
    const { riskLevel, riskScore, recommendations } = response.data.data;
    console.log(`Risk Level: ${riskLevel}`);
    console.log(`Risk Score: ${riskScore}`);
    console.log('Recommendations:', recommendations);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

analyzeMessage('ยินดีด้วย! คุณได้รับรางวัล 500,000 บาท');
```

---

## 📞 Support

- 📧 Email: api-support@protectcyber.org
- 💬 Discord: [Join our server](https://discord.gg/protectcyber)
- 📚 Documentation: [docs.protectcyber.org](https://docs.protectcyber.org)

---

Made with ❤️ by Cyber Guardian Team 🇹🇭
