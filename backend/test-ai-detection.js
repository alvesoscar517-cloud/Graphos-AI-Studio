/**
 * Test script for enhanced AI detection
 * Run: node test-ai-detection.js
 */

const geminiService = require('./src/services/gemini.service');

// Test samples
const testSamples = {
  clearlyHuman: `
    Yo, so I was thinking about this the other day... like, why do we even bother with all this stuff? 
    I mean, don't get me wrong, it's cool and all, but sometimes I'm just like "meh, whatever."
    My friend Sarah said the same thing last week when we were grabbing coffee. She's always got these random thoughts lol.
    Anyway, gotta run - catch you later!
  `,
  
  clearlyAI: `
    It is important to note that artificial intelligence has revolutionized numerous industries in recent years. 
    Furthermore, the implementation of machine learning algorithms has facilitated unprecedented advancements in data processing capabilities.
    Moreover, it is essential to consider the ethical implications of these technological developments.
    In conclusion, the integration of AI systems represents a significant milestone in human technological progress.
    Additionally, stakeholders must carefully evaluate the potential risks and benefits associated with widespread AI adoption.
  `,
  
  uncertain: `
    The development of modern technology has changed how we work and communicate.
    Many people now use smartphones and computers for daily tasks.
    This has both advantages and disadvantages that we should consider.
    On one hand, technology makes things more convenient and efficient.
    On the other hand, it can sometimes create new problems and challenges.
  `
};

async function runTests() {
  console.log('🧪 Testing Enhanced AI Detection\n');
  console.log('='.repeat(60));
  
  for (const [label, text] of Object.entries(testSamples)) {
    console.log(`\n📝 Testing: ${label.toUpperCase()}`);
    console.log('-'.repeat(60));
    
    try {
      const result = await geminiService.detectAIContentEnhanced(text.trim());
      
      console.log(`✅ AI Probability: ${result.aiProbability}%`);
      console.log(`📊 Confidence: ${result.confidence}%`);
      console.log(`🔍 Multi-pass: ${result.multiPass ? 'Yes' : 'No'}`);
      
      if (result.humanIndicators && result.humanIndicators.length > 0) {
        console.log(`\n👤 Human Indicators:`);
        result.humanIndicators.forEach(ind => console.log(`   ✓ ${ind}`));
      }
      
      if (result.aiIndicators && result.aiIndicators.length > 0) {
        console.log(`\n🤖 AI Indicators:`);
        result.aiIndicators.forEach(ind => console.log(`   ⚠ ${ind}`));
      }
      
      if (result.evidence && result.evidence.length > 0) {
        console.log(`\n📋 Evidence:`);
        result.evidence.slice(0, 3).forEach(ev => console.log(`   • ${ev}`));
      }
      
      if (result.keyFactor) {
        console.log(`\n🎯 Key Factor: ${result.keyFactor}`);
      }
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Testing complete!\n');
}

// Run tests
runTests().catch(console.error);
