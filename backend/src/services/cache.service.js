/**
 * Cache Service
 * Manages caching for profiles, embeddings, and analysis results
 */

// ============================================================================
// PROFILE CACHE
// ============================================================================

const profileCache = new Map();
const PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const centroidCache = new Map();

const analysisCache = new Map();
const ANALYSIS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_ANALYSIS_CACHE_SIZE = 100;

function getCachedProfile(profileId) {
  const cached = profileCache.get(profileId);
  if (cached && Date.now() - cached.timestamp < PROFILE_CACHE_TTL) {
    console.log(`✅ Cache HIT for profile ${profileId}`);
    return cached.data;
  }
  console.log(`❌ Cache MISS for profile ${profileId}`);
  return null;
}

function setCachedProfile(profileId, data) {
  profileCache.set(profileId, {
    data,
    timestamp: Date.now()
  });
  console.log(`💾 Cached profile ${profileId}`);
}

function invalidateProfileCache(profileId) {
  profileCache.delete(profileId);
  centroidCache.delete(profileId);
  console.log(`🗑️  Invalidated cache for profile ${profileId}`);
}

// ============================================================================
// ANALYSIS CACHE
// ============================================================================

function hashText(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

function getCachedAnalysis(profileId, text) {
  const key = `${profileId}_${hashText(text)}`;
  const cached = analysisCache.get(key);
  
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > ANALYSIS_CACHE_TTL) {
    analysisCache.delete(key);
    return null;
  }
  
  console.log(`⚡ Analysis cache HIT`);
  return cached.result;
}

function setCachedAnalysis(profileId, text, result) {
  if (analysisCache.size >= MAX_ANALYSIS_CACHE_SIZE) {
    const firstKey = analysisCache.keys().next().value;
    analysisCache.delete(firstKey);
  }
  
  const key = `${profileId}_${hashText(text)}`;
  analysisCache.set(key, {
    result,
    timestamp: Date.now()
  });
}

module.exports = {
  getCachedProfile,
  setCachedProfile,
  invalidateProfileCache,
  getCachedAnalysis,
  setCachedAnalysis
};
