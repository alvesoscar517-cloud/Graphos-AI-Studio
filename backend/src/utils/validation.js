/**
 * Input Validation Utilities
 */

/**
 * Validate text input with smart content detection
 */
function validateText(text, minLength = 1, maxLength = 20000) {
  if (!text || typeof text !== 'string') {
    throw new Error('INVALID_INPUT: Text must be a non-empty string');
  }
  
  const trimmed = text.trim();
  
  if (trimmed.length < minLength) {
    throw new Error(`INVALID_INPUT: Text must be at least ${minLength} characters`);
  }
  
  if (trimmed.length > maxLength) {
    throw new Error(`INVALID_INPUT: Text must not exceed ${maxLength} characters`);
  }
  
  // Smart content validation
  const contentCheck = validateContentQuality(trimmed);
  if (!contentCheck.valid) {
    throw new Error(`INVALID_CONTENT: ${contentCheck.reason}`);
  }
  
  return trimmed;
}

/**
 * Validate content quality - detect spam, code, gibberish
 */
function validateContentQuality(text) {
  // 1. Check for code patterns
  const codePatterns = [
    /function\s+\w+\s*\(/gi,
    /const\s+\w+\s*=/gi,
    /let\s+\w+\s*=/gi,
    /var\s+\w+\s*=/gi,
    /import\s+.*from/gi,
    /export\s+(default|const|function)/gi,
    /<\/?[a-z][\s\S]*>/gi, // HTML tags
    /\{[\s\S]*\}/g, // JSON-like structures
    /class\s+\w+\s*\{/gi,
    /def\s+\w+\s*\(/gi, // Python
    /public\s+class/gi, // Java
  ];
  
  let codeMatches = 0;
  for (const pattern of codePatterns) {
    const matches = text.match(pattern);
    if (matches) codeMatches += matches.length;
  }
  
  // If more than 3 code patterns found, likely code
  if (codeMatches >= 3) {
    return {
      valid: false,
      reason: 'Văn bản chứa code. Vui lòng cung cấp văn bản tự nhiên (email, blog, tin nhắn...)'
    };
  }
  
  // 2. Check for excessive special characters (gibberish)
  const specialChars = text.match(/[^a-zA-Z0-9\s\u00C0-\u1EF9.,!?;:'"()\-]/g) || [];
  const specialCharRatio = specialChars.length / text.length;
  
  if (specialCharRatio > 0.3) {
    return {
      valid: false,
      reason: 'Văn bản chứa quá nhiều ký tự đặc biệt. Vui lòng cung cấp văn bản có nghĩa.'
    };
  }
  
  // 3. Check for excessive repetition (spam)
  const words = text.toLowerCase().split(/\s+/);
  const wordFreq = {};
  words.forEach(word => {
    if (word.length > 2) { // Only count words longer than 2 chars
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  const maxFreq = Math.max(...Object.values(wordFreq));
  const repetitionRatio = maxFreq / words.length;
  
  if (repetitionRatio > 0.3) {
    return {
      valid: false,
      reason: 'Văn bản lặp lại quá nhiều. Vui lòng cung cấp nội dung đa dạng hơn.'
    };
  }
  
  // 4. Check for minimum word diversity
  const uniqueWords = new Set(words.filter(w => w.length > 2));
  const diversity = uniqueWords.size / words.length;
  
  if (diversity < 0.15 && words.length > 20) {
    return {
      valid: false,
      reason: 'Văn bản thiếu đa dạng. Vui lòng cung cấp nội dung phong phú hơn.'
    };
  }
  
  // 5. Check for minimum meaningful content
  const meaningfulWords = words.filter(w => w.length >= 3);
  if (meaningfulWords.length < 5) {
    return {
      valid: false,
      reason: 'Văn bản quá ngắn hoặc không có nội dung có nghĩa.'
    };
  }
  
  return { valid: true };
}

/**
 * Validate profile ID
 */
function validateProfileId(profileId) {
  if (!profileId || typeof profileId !== 'string') {
    throw new Error('INVALID_INPUT: Profile ID is required');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(profileId)) {
    throw new Error('INVALID_INPUT: Invalid profile ID format');
  }
  
  return profileId;
}

/**
 * Validate user ID
 */
function validateUserId(userId) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('INVALID_INPUT: User ID is required');
  }
  
  return userId;
}

/**
 * Validate email
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('INVALID_INPUT: Email is required');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('INVALID_INPUT: Invalid email format');
  }
  
  return email.toLowerCase();
}

/**
 * Sanitize HTML to prevent XSS
 */
function sanitizeHtml(html) {
  if (!html) return '';
  
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Calculate profile quality score (0-100)
 */
function calculateProfileScore(samples) {
  let score = 0;
  const feedback = [];
  
  // 1. Sample count (0-25 points)
  const sampleCount = samples.length;
  if (sampleCount >= 10) {
    score += 25;
    feedback.push({ type: 'excellent', message: `Số lượng mẫu tuyệt vời (${sampleCount})` });
  } else if (sampleCount >= 5) {
    score += 20;
    feedback.push({ type: 'good', message: `Số lượng mẫu tốt (${sampleCount})` });
  } else if (sampleCount >= 3) {
    score += 15;
    feedback.push({ type: 'ok', message: `Số lượng mẫu đủ (${sampleCount})` });
  } else {
    score += 5;
    feedback.push({ type: 'warning', message: `Số lượng mẫu ít (${sampleCount}), nên thêm để AI học tốt hơn` });
  }
  
  // 2. Total word count (0-25 points)
  const totalWords = samples.reduce((sum, s) => {
    return sum + s.text.split(/\s+/).filter(w => w.length > 0).length;
  }, 0);
  
  if (totalWords >= 2000) {
    score += 25;
    feedback.push({ type: 'excellent', message: `Tổng số từ tuyệt vời (${totalWords})` });
  } else if (totalWords >= 1000) {
    score += 20;
    feedback.push({ type: 'good', message: `Tổng số từ tốt (${totalWords})` });
  } else if (totalWords >= 500) {
    score += 15;
    feedback.push({ type: 'ok', message: `Tổng số từ đủ (${totalWords})` });
  } else {
    score += 10;
    feedback.push({ type: 'warning', message: `Tổng số từ ít (${totalWords}), nên thêm để AI học tốt hơn` });
  }
  
  // 3. Sample diversity (0-25 points)
  const allText = samples.map(s => s.text.toLowerCase()).join(' ');
  const words = allText.split(/\s+/).filter(w => w.length > 2);
  const uniqueWords = new Set(words);
  const diversity = uniqueWords.size / words.length;
  
  if (diversity >= 0.6) {
    score += 25;
    feedback.push({ type: 'excellent', message: `Độ đa dạng từ vựng tuyệt vời (${(diversity * 100).toFixed(0)}%)` });
  } else if (diversity >= 0.4) {
    score += 20;
    feedback.push({ type: 'good', message: `Độ đa dạng từ vựng tốt (${(diversity * 100).toFixed(0)}%)` });
  } else if (diversity >= 0.3) {
    score += 15;
    feedback.push({ type: 'ok', message: `Độ đa dạng từ vựng đủ (${(diversity * 100).toFixed(0)}%)` });
  } else {
    score += 10;
    feedback.push({ type: 'warning', message: `Độ đa dạng từ vựng thấp (${(diversity * 100).toFixed(0)}%), nên cung cấp nội dung đa dạng hơn` });
  }
  
  // 4. Sample type balance (0-25 points)
  const longSamples = samples.filter(s => s.type === 'long').length;
  const shortSamples = samples.filter(s => s.type === 'short').length;
  
  if (longSamples >= 2 && shortSamples >= 3) {
    score += 25;
    feedback.push({ type: 'excellent', message: `Cân bằng tốt giữa văn bản dài (${longSamples}) và ngắn (${shortSamples})` });
  } else if (longSamples >= 1 && shortSamples >= 2) {
    score += 20;
    feedback.push({ type: 'good', message: `Có cả văn bản dài (${longSamples}) và ngắn (${shortSamples})` });
  } else if (longSamples >= 1 || shortSamples >= 2) {
    score += 15;
    feedback.push({ type: 'ok', message: `Nên bổ sung thêm ${longSamples === 0 ? 'văn bản dài' : 'văn bản ngắn'}` });
  } else {
    score += 10;
    feedback.push({ type: 'warning', message: `Thiếu cân bằng giữa văn bản dài và ngắn` });
  }
  
  // Determine overall rating
  let rating, recommendation;
  if (score >= 90) {
    rating = 'excellent';
    recommendation = 'Hồ sơ xuất sắc! AI sẽ học rất tốt văn phong của bạn.';
  } else if (score >= 75) {
    rating = 'good';
    recommendation = 'Hồ sơ tốt! AI có thể học được văn phong của bạn.';
  } else if (score >= 60) {
    rating = 'ok';
    recommendation = 'Hồ sơ đủ dùng, nhưng nên cải thiện để AI học tốt hơn.';
  } else {
    rating = 'poor';
    recommendation = 'Hồ sơ cần cải thiện. Hãy thêm mẫu và nội dung đa dạng hơn.';
  }
  
  return {
    score: Math.round(score),
    rating,
    recommendation,
    feedback,
    details: {
      sampleCount,
      totalWords,
      diversity: Math.round(diversity * 100),
      longSamples,
      shortSamples
    }
  };
}

module.exports = {
  validateText,
  validateProfileId,
  validateUserId,
  validateEmail,
  sanitizeHtml,
  validateContentQuality,
  calculateProfileScore
};
