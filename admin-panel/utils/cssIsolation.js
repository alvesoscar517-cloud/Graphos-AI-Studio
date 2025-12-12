import logger from '../lib/logger'
/**
 * CSS Isolation Utilities
 * Tools to ensure admin CSS doesn't conflict with main app
 */

/**
 * Check if Shadow DOM is supported
 */
export function isShadowDOMSupported() {
  return 'attachShadow' in Element.prototype;
}

/**
 * Check for CSS conflicts
 */
export function detectCSSConflicts() {
  const adminRoot = document.getElementById('admin-root');
  if (!adminRoot) return [];

  const conflicts = [];
  const computedStyle = window.getComputedStyle(adminRoot);

  // Check critical properties
  const criticalProps = [
    'margin',
    'padding',
    'box-sizing',
    'font-family',
    'background-color',
    'color'
  ];

  criticalProps.forEach(prop => {
    const value = computedStyle.getPropertyValue(prop);
    if (value && value !== 'initial' && value !== 'inherit') {
      conflicts.push({
        property: prop,
        value: value,
        source: 'external'
      });
    }
  });

  return conflicts;
}

/**
 * Log CSS isolation status
 */
export function logCSSIsolationStatus() {
  console.group('[STYLE] CSS Isolation Status');
  
  // Check Shadow DOM support
  const shadowSupported = isShadowDOMSupported();
  logger.log('Shadow DOM Support:', shadowSupported ? '[SUCCESS]' : '[FAIL]');

  // Check for conflicts
  const conflicts = detectCSSConflicts();
  if (conflicts.length > 0) {
    console.warn('[WARNING] Potential CSS conflicts detected:', conflicts);
  } else {
    logger.log('[SUCCESS] No CSS conflicts detected');
  }

  // Check admin root
  const adminRoot = document.getElementById('admin-root');
  if (adminRoot) {
    const hasShadowRoot = !!adminRoot.shadowRoot;
    logger.log('Admin Root Shadow DOM:', hasShadowRoot ? '[SUCCESS]' : '[FAIL]');
    
    if (hasShadowRoot) {
      logger.log('Shadow Root Mode:', adminRoot.shadowRoot.mode);
      logger.log('Shadow Root Children:', adminRoot.shadowRoot.children.length);
    }
  }

  console.groupEnd();
}

/**
 * Thêm CSS reset vào Shadow DOM
 */
export function addCSSResetToShadowDOM(shadowRoot) {
  const resetCSS = `
    /* CSS Reset for Shadow DOM */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      width: 100%;
      height: 100%;
    }
    
    #shadow-container {
      width: 100%;
      height: 100%;
      min-height: 100vh;
    }
  `;

  const styleElement = document.createElement('style');
  styleElement.textContent = resetCSS;
  shadowRoot.insertBefore(styleElement, shadowRoot.firstChild);
}

/**
 * Fallback: Add prefix to all CSS selectors
 */
export function prefixCSSSelectors(css, prefix = '#admin-root') {
  // Skip @rules and :root
  return css.replace(
    /([^{}@]+)\{/g,
    (match, selector) => {
      // Skip @rules
      if (selector.trim().startsWith('@')) return match;
      
      // Skip :root
      if (selector.trim().includes(':root')) return match;
      
      // Thêm prefix
      const prefixed = selector
        .split(',')
        .map(s => {
          const trimmed = s.trim();
          // If already has prefix, skip
          if (trimmed.startsWith(prefix)) return trimmed;
          // Thêm prefix
          return `${prefix} ${trimmed}`;
        })
        .join(', ');
      
      return `${prefixed} {`;
    }
  );
}

/**
 * Monitor CSS changes và log warnings
 */
export function monitorCSSChanges() {
  const adminRoot = document.getElementById('admin-root');
  if (!adminRoot) return;

  // Use MutationObserver to track changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        console.warn('[WARNING] Admin root style changed externally:', mutation.target.style.cssText);
      }
    });
  });

  observer.observe(adminRoot, {
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  return observer;
}

