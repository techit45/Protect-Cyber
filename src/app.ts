import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { ThreatDetectorService } from './services/threatDetector';
import { LineBotService } from './services/lineBot';
import { middleware } from '@line/bot-sdk';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Validate required environment variables
function validateEnvironment() {
  const required = [
    'LINE_CHANNEL_ACCESS_TOKEN',
    'LINE_CHANNEL_SECRET',
    'OPENROUTER_API_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }
  
  console.log('✅ Environment variables validated');
}

// Validate environment before initializing services
validateEnvironment();

// Initialize services
const threatDetector = new ThreatDetectorService();
const lineBotService = new LineBotService();

// LINE Bot middleware configuration
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!
};

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Cyber Armor API',
    name: 'เกราะไซเบอร์',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  const systemHealth = threatDetector.getSystemHealth();
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    ...systemHealth
  });
});

// Enhanced threat analysis API endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { 
      message, 
      userId,
      options = {}
    } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Enhanced analysis with configurable options
    const analysisOptions = {
      useEnhancedDetection: options.useEnhancedDetection ?? true,
      useMachineLearning: options.useMachineLearning ?? true,
      context: options.context || {}
    };

    const result = await threatDetector.analyze(message, userId, analysisOptions);
    
    res.json({
      success: true,
      data: result,
      metadata: {
        analysisMethod: result.analysisMethod,
        processingTime: result.processingTime,
        allowFeedback: result.allowFeedback
      }
    });
  } catch (error) {
    console.error('Error analyzing message:', error);
    res.status(500).json({
      success: false,
      error: 'Analysis failed'
    });
  }
});

// User feedback API endpoint
app.post('/api/feedback', async (req, res) => {
  try {
    const {
      messageId,
      originalMessage,
      originalResult,
      feedback,
      userId
    } = req.body;
    
    if (!messageId || !originalMessage || !originalResult || !feedback) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: messageId, originalMessage, originalResult, feedback'
      });
    }
    
    const feedbackId = await threatDetector.recordUserFeedback(
      messageId,
      originalMessage,
      originalResult,
      feedback,
      userId
    );
    
    res.json({
      success: true,
      data: {
        feedbackId,
        recorded: true
      }
    });
    
  } catch (error) {
    console.error('Error recording feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record feedback'
    });
  }
});

// Learning metrics API endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = threatDetector.getLearningMetrics();
    const recommendations = threatDetector.getImprovementRecommendations();
    const systemHealth = threatDetector.getSystemHealth();
    
    res.json({
      success: true,
      data: {
        learningMetrics: metrics,
        recommendations,
        systemHealth
      }
    });
    
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics'
    });
  }
});

// Process improvements API endpoint
app.post('/api/improve', async (req, res) => {
  try {
    const improvements = await threatDetector.processImprovements();
    
    res.json({
      success: true,
      data: improvements || {
        message: 'Feedback learning system is disabled'
      }
    });
    
  } catch (error) {
    console.error('Error processing improvements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process improvements'
    });
  }
});

// LINE webhook endpoint with bot functionality
app.post('/webhook/line', express.json(), async (req, res) => {
  try {
    console.log('🔗 LINE webhook received');
    
    // Parse webhook data
    const signature = req.headers['x-line-signature'] as string;
    const webhookData = req.body;
    
    console.log('📦 Webhook data:', JSON.stringify(webhookData, null, 2));
    
    // Verify signature (cryptographic validation)
    if (!signature) {
      console.log('⚠️ No signature provided');
      return res.status(401).json({ error: 'Signature required' });
    }

    // Validate LINE webhook signature
    try {
      const crypto = require('crypto');
      const channelSecret = process.env.LINE_CHANNEL_SECRET;
      if (!channelSecret) {
        console.error('❌ LINE_CHANNEL_SECRET not configured');
        return res.status(500).json({ error: 'Server configuration error' });
      }

      const body = JSON.stringify(req.body);
      const hash = crypto.createHmac('sha256', channelSecret).update(body).digest('base64');
      
      if (signature !== hash) {
        console.log('⚠️ Invalid signature');
        // In development, continue processing but log the warning
        if (process.env.NODE_ENV === 'production') {
          return res.status(401).json({ error: 'Invalid signature' });
        } else {
          console.log('🔧 Development mode: continuing despite invalid signature');
        }
      }
    } catch (error) {
      console.error('❌ Signature validation error:', error);
      return res.status(401).json({ error: 'Signature validation failed' });
    }
    
    // Send response immediately to avoid timeout
    res.status(200).send('OK');
    console.log('✅ Webhook response sent');
    
    // Process webhook events asynchronously
    if (webhookData.events && webhookData.events.length > 0) {
      console.log('📨 Processing', webhookData.events.length, 'events');
      setImmediate(async () => {
        try {
          await lineBotService.handleWebhook(webhookData.events);
          console.log('✅ Webhook events processed successfully');
        } catch (error) {
          console.error('LINE webhook processing error:', error);
        }
      });
    } else {
      console.log('⚠️ No events to process');
    }
    
  } catch (error) {
    console.error('LINE webhook error:', error);
    if (!res.headersSent) {
      res.status(500).send('Internal Server Error');
    }
  }
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 เกราะไซเบอร์ API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;