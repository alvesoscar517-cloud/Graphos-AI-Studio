/**
 * Gemini AI Configuration
 */

const { VertexAI } = require('@google-cloud/vertexai');
const { PredictionServiceClient } = require('@google-cloud/aiplatform');
const config = require('./index');

// Lazy initialization to avoid cold start penalty
let vertexAI = null;
let aiplatformClient = null;

function getVertexAI() {
  if (!vertexAI) {
    vertexAI = new VertexAI({
      project: config.PROJECT_ID,
      location: config.LOCATION
    });
    console.log('✅ Vertex AI initialized');
  }
  return vertexAI;
}

function getAIPlatformClient() {
  if (!aiplatformClient) {
    aiplatformClient = new PredictionServiceClient({
      apiEndpoint: `${config.LOCATION}-aiplatform.googleapis.com`
    });
    console.log('✅ AI Platform Client initialized');
  }
  return aiplatformClient;
}

module.exports = {
  getVertexAI,
  getAIPlatformClient,
  config
};
