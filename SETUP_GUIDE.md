# 🚀 Setup Guide - เกราะไซเบอร์

## คู่มือติดตั้งและตั้งค่าระบบ ProtectCyber

---

## 📋 สารบัญ

1. [ความต้องการของระบบ](#-ความต้องการของระบบ)
2. [การติดตั้งพื้นฐาน](#-การติดตั้งพื้นฐาน)
3. [การตั้งค่า LINE Bot](#-การตั้งค่า-line-bot)
4. [การตั้งค่า OpenRouter API](#-การตั้งค่า-openrouter-api)
5. [การตั้งค่า Environment Variables](#-การตั้งค่า-environment-variables)
6. [การรันระบบ](#-การรันระบบ)
7. [การทดสอบ](#-การทดสอบ)
8. [การ Deploy](#-การ-deploy)
9. [Troubleshooting](#-troubleshooting)

---

## 📦 ความต้องการของระบบ

### **Software Requirements**
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 หรือ **yarn** >= 1.22.0
- **Git** (สำหรับ clone repository)

### **API Keys ที่ต้องมี**
- LINE Developer Account (ฟรี)
- OpenRouter API Key (ฟรี - แผน Free Tier)

### **Optional (สำหรับ Production)**
- MongoDB (ฐานข้อมูล)
- Redis (Cache)
- PM2 (Process Manager)
- Nginx (Reverse Proxy)

---

## 🔧 การติดตั้งพื้นฐาน

### **ขั้นตอนที่ 1: Clone Repository**

```bash
# Clone จาก GitHub
git clone https://github.com/yourusername/protectcyber.git

# เข้าโฟลเดอร์โปรเจค
cd protectcyber

# ตรวจสอบ Node.js version
node --version  # ควรเป็น v18.x.x ขึ้นไป
npm --version   # ควรเป็น v9.x.x ขึ้นไป
```

### **ขั้นตอนที่ 2: ติดตั้ง Dependencies**

```bash
# ติดตั้งด้วย npm
npm install

# หรือติดตั้งด้วย yarn
yarn install
```

### **ขั้นตอนที่ 3: ตรวจสอบการติดตั้ง**

```bash
# ตรวจสอบว่าติดตั้งสำเร็จ
npm list --depth=0

# ควรเห็น dependencies หลักๆ เช่น:
# ├── @line/bot-sdk@10.0.0
# ├── express@4.18.2
# ├── typescript@5.8.3
# └── ... (และอื่นๆ)
```

---

## 📱 การตั้งค่า LINE Bot

### **ขั้นตอนที่ 1: สร้าง LINE Channel**

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. Login ด้วย LINE Account
3. กด **Create a new provider** (ถ้ายังไม่มี)
   - ชื่อ Provider: `ProtectCyber` (หรือชื่ออื่นตามต้องการ)
4. กด **Create a Messaging API channel**
   - Channel name: `เกราะไซเบอร์`
   - Channel description: `ระบบป้องกันภัยไซเบอร์อัจฉริยะ`
   - Category: `Technology` > `IT/Software`
   - Subcategory: `Security`

### **ขั้นตอนที่ 2: ตั้งค่า Channel**

1. ไปที่แท็บ **Messaging API**
2. เลื่อนลงหา **Channel access token**
   - กด **Issue** เพื่อสร้าง token
   - **คัดลอก token** ไว้ (จะใช้ใน .env)
3. เลื่อนขึ้นหา **Channel secret**
   - **คัดลอก secret** ไว้ (จะใช้ใน .env)

### **ขั้นตอนที่ 3: ตั้งค่า Webhook**

1. ที่แท็บ **Messaging API**
2. หา **Webhook settings**
3. กด **Edit** แล้วใส่ URL:
   ```
   https://your-domain.com/webhook/line
   ```
   - ถ้าทดสอบบนเครื่อง ใช้ [ngrok](https://ngrok.com/):
     ```bash
     ngrok http 3000
     # จะได้ URL แบบ: https://abcd1234.ngrok.io
     # ใช้: https://abcd1234.ngrok.io/webhook/line
     ```
4. กด **Verify** เพื่อทดสอบ
5. เปิด **Use webhook** (เป็น Enabled)

### **ขั้นตอนที่ 4: ตั้งค่าเพิ่มเติม**

1. ที่แท็บ **Messaging API**
2. ปิด **Auto-reply messages** (เราจะใช้ Bot ตอบ)
3. ปิด **Greeting messages** (Optional)
4. เปิด **Webhooks** (ต้องเป็น Enabled)

### **ขั้นตอนที่ 5: เพิ่ม Bot เป็นเพื่อน**

1. ที่แท็บ **Messaging API**
2. หา **Bot basic ID** หรือ **QR code**
3. เพิ่มเพื่อนด้วยการ:
   - Scan QR code
   - หรือค้นหาด้วย Bot basic ID
4. ทดลองส่งข้อความ (ยังไม่ได้ตอบเพราะยังไม่ได้รันระบบ)

---

## 🤖 การตั้งค่า OpenRouter API

### **ขั้นตอนที่ 1: สร้าง Account**

1. ไปที่ [OpenRouter.ai](https://openrouter.ai/)
2. กด **Sign Up** (ฟรี)
3. Login ด้วย Google หรือ GitHub

### **ขั้นตอนที่ 2: สร้าง API Key**

1. ไปที่ [API Keys](https://openrouter.ai/keys)
2. กด **Create New Key**
3. ตั้งชื่อ: `ProtectCyber`
4. **คัดลอก API Key** ไว้ (จะใช้ใน .env)
   - ⚠️ **สำคัญ**: เก็บ API Key ไว้ปลอดภัย ห้ามแชร์

### **ขั้นตอนที่ 3: เติมเงิน (Optional)**

- แผน **Free Tier** มีให้ใช้ฟรี (จำกัด requests)
- สำหรับ Production แนะนำเติมเงิน $5-10
- ไปที่ [Billing](https://openrouter.ai/billing) เพื่อเติมเงิน

### **ขั้นตอนที่ 4: ทดสอบ API**

```bash
# ทดสอบด้วย curl
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "meta-llama/llama-3.2-3b-instruct:free",
    "messages": [{"role": "user", "content": "สวัสดีครับ"}]
  }'
```

---

## ⚙️ การตั้งค่า Environment Variables

### **ขั้นตอนที่ 1: สร้างไฟล์ .env**

```bash
# คัดลอกจาก .env.example
cp .env.example .env

# แก้ไขไฟล์
nano .env
# หรือใช้ text editor อื่น
```

### **ขั้นตอนที่ 2: กรอกค่าต่างๆ**

```env
# LINE Bot Configuration (จาก LINE Developers)
LINE_CHANNEL_ACCESS_TOKEN=Your_LINE_Channel_Access_Token_Here
LINE_CHANNEL_SECRET=Your_LINE_Channel_Secret_Here

# AI API Configuration (จาก OpenRouter)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxx

# Server Configuration
PORT=3000
NODE_ENV=development

# Optional: Database (ถ้าไม่มีให้ comment ไว้)
# MONGODB_URI=mongodb://localhost:27017/protectcyber
# REDIS_URL=redis://localhost:6379

# Optional: Feature Flags
ENABLE_FEEDBACK_LEARNING=true
ENABLE_FAMILY_ALERTS=true
ENABLE_ELDERLY_DETECTION=true
```

### **ขั้นตอนที่ 3: ตรวจสอบ .env**

```bash
# ตรวจสอบว่าไฟล์มีค่าครบ
cat .env | grep -v "^#" | grep "="

# ควรเห็น:
# LINE_CHANNEL_ACCESS_TOKEN=...
# LINE_CHANNEL_SECRET=...
# OPENROUTER_API_KEY=...
# PORT=3000
# NODE_ENV=development
```

---

## 🚀 การรันระบบ

### **Development Mode**

```bash
# รันในโหมด Development (มี Hot Reload)
npm run dev

# ควรเห็น:
# ✅ Environment variables validated
# 🚀 เกราะไซเบอร์ API running on port 3000
# 📍 Environment: development
# 🔗 Health check: http://localhost:3000/health
```

### **Production Mode**

```bash
# 1. Build TypeScript -> JavaScript
npm run build

# 2. รันแบบ Production
npm start

# หรือใช้ PM2 (แนะนำ)
pm2 start npm --name "protectcyber" -- start
pm2 logs protectcyber
pm2 monit
```

### **การตรวจสอบว่าระบบทำงาน**

```bash
# ตรวจสอบ Health Check
curl http://localhost:3000/health

# ควรได้:
# {
#   "status": "OK",
#   "timestamp": "2024-12-02T...",
#   "uptime": 123.456,
#   "environment": "development",
#   "systemHealth": { ... }
# }
```

---

## 🧪 การทดสอบ

### **ทดสอบผ่าน LINE Bot**

1. **เปิด LINE App** บนมือถือ
2. **ค้นหา Bot** ที่สร้างไว้
3. **ส่งข้อความทดสอบ:**

```
ทดสอบ 1: "สวัสดีครับ"
→ ควรได้รับการตอบกลับ

ทดสอบ 2: "ยินดีด้วย! คุณได้รับรางวัล 1,000,000 บาท"
→ ควรได้ระดับความเสี่ยง CRITICAL

ทดสอบ 3: "ธนาคารกรุงเทพแจ้งยอดเงิน"
→ ควรได้ระดับความเสี่ยง LOW-MEDIUM
```

### **ทดสอบผ่าน API**

```bash
# ทดสอบ Analyze Endpoint
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "message": "ยินดีด้วย! คุณได้รับรางวัล 500,000 บาท โอนค่าธรรมเนียม 2,000 บาท",
    "userId": "test-user-123"
  }'

# ควรได้:
# {
#   "success": true,
#   "data": {
#     "riskScore": 0.9+,
#     "riskLevel": "CRITICAL",
#     ...
#   }
# }
```

### **ทดสอบด้วย Jest**

```bash
# รัน Unit Tests
npm test

# รัน Tests แบบ Watch Mode
npm run test:watch

# ดู Coverage
npm run test:coverage
```

---

## 🌐 การ Deploy

### **Deploy บน Local Server**

```bash
# 1. ติดตั้ง PM2
npm install -g pm2

# 2. Start App
pm2 start npm --name "protectcyber" -- start

# 3. Auto-restart on reboot
pm2 startup
pm2 save

# 4. ดู Logs
pm2 logs protectcyber

# 5. Monitor
pm2 monit
```

### **Deploy บน Cloud (AWS/GCP/Azure)**

```bash
# 1. Setup Server (Ubuntu 22.04)
ssh user@your-server-ip

# 2. ติดตั้ง Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone Project
git clone https://github.com/yourusername/protectcyber.git
cd protectcyber

# 4. ติดตั้ง Dependencies
npm install

# 5. ตั้งค่า .env
nano .env
# (กรอกค่าต่างๆ)

# 6. Build & Start
npm run build
npm start

# หรือใช้ PM2
pm2 start npm --name "protectcyber" -- start
```

### **Deploy ด้วย Docker**

```dockerfile
# Dockerfile (จะสร้างในอนาคต)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build Image
docker build -t protectcyber .

# Run Container
docker run -d -p 3000:3000 --env-file .env protectcyber
```

---

## 🔧 Troubleshooting

### **ปัญหา: LINE Bot ไม่ตอบกลับ**

**สาเหตุที่เป็นไปได้:**
1. Webhook URL ไม่ถูกต้อง
2. Webhook ไม่ได้เปิดใช้งาน
3. Server ไม่ทำงาน

**วิธีแก้:**
```bash
# 1. ตรวจสอบว่า Server ทำงาน
curl http://localhost:3000/health

# 2. ตรวจสอบ Logs
tail -f logs/app.log
# หรือ
pm2 logs protectcyber

# 3. ตรวจสอบ Webhook บน LINE Console
# ไปที่ Messaging API > Webhook settings > Verify

# 4. ถ้าใช้ ngrok ตรวจสอบว่า URL ยังใช้งานได้
curl https://your-ngrok-url.ngrok.io/health
```

### **ปัญหา: OpenRouter API Error**

**Error: `401 Unauthorized`**
```bash
# API Key ไม่ถูกต้อง
# แก้: ตรวจสอบ OPENROUTER_API_KEY ใน .env
```

**Error: `429 Too Many Requests`**
```bash
# เกิน Rate Limit (Free Tier)
# แก้: รอสักครู่ หรือเติมเงิน
```

### **ปัญหา: Module Not Found**

```bash
# ลบ node_modules และติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install
```

### **ปัญหา: Port Already in Use**

```bash
# หา Process ที่ใช้ Port 3000
lsof -i :3000

# Kill Process
kill -9 <PID>

# หรือเปลี่ยน PORT ใน .env
PORT=3001
```

---

## 📞 ต้องการความช่วยเหลือ?

- 📖 อ่าน [Documentation](./README.md)
- 🐛 รายงานปัญหา: [GitHub Issues](https://github.com/yourusername/protectcyber/issues)
- 💬 ถาม-ตอบ: [Discussions](https://github.com/yourusername/protectcyber/discussions)
- 📧 Email: support@protectcyber.org

---

## ✅ Checklist การติดตั้ง

- [ ] ติดตั้ง Node.js >= 18.0.0
- [ ] Clone Repository
- [ ] ติดตั้ง Dependencies (`npm install`)
- [ ] สร้าง LINE Channel
- [ ] ได้ LINE Channel Access Token
- [ ] ได้ LINE Channel Secret
- [ ] สร้าง OpenRouter Account
- [ ] ได้ OpenRouter API Key
- [ ] สร้างไฟล์ .env
- [ ] กรอกค่าใน .env ครบถ้วน
- [ ] ตั้งค่า Webhook URL
- [ ] เปิด Webhook บน LINE
- [ ] รัน Server (`npm run dev`)
- [ ] ทดสอบ Health Check
- [ ] เพิ่ม Bot เป็นเพื่อน
- [ ] ทดสอบส่งข้อความ
- [ ] ได้รับการตอบกลับจาก Bot

---

<div align="center">

**🎉 ติดตั้งสำเร็จแล้ว!**

ตอนนี้คุณพร้อมใช้งาน **เกราะไซเบอร์** แล้ว

Made with ❤️ by Cyber Guardian Team

</div>
