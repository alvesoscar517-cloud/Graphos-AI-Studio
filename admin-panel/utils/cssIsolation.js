/**
 * CSS Isolation Utilities
 * Các công cụ để đảm bảo CSS của admin không xung đột với main app
 */

/**
 * Kiểm tra xem Shadow DOM có được hỗ trợ không
 */
export function isShadowDOMSupported() {
  return 'attachShadow' in Element.prototype;
}

/**
 * Kiểm tra xem có CSS conflicts không
 */
export function detectCSSConflicts() {
  const adminRoot = document.getElementById('admin-root');
  if (!adminRoot) return [];

  const conflicts = [];
  const computedStyle = window.getComputedStyle(adminRoot);

  // Kiểm tra các properties quan trọng
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
  console.group('🎨 CSS Isolation Status');
  
  // Check Shadow DOM support
  const shadowSupported = isShadowDOMSupported();
  console.log('Shadow DOM Support:', shadowSupported ? '✅' : '❌');

  // Check for conflicts
  const conflicts = detectCSSConflicts();
  if (conflicts.length > 0) {
    console.warn('⚠️ Potential CSS conflicts detected:', conflicts);
  } else {
    console.log('✅ No CSS conflicts detected');
  }

  // Check admin root
  const adminRoot = document.getElementById('admin-root');
  if (adminRoot) {
    const hasShadowRoot = !!adminRoot.shadowRoot;
    console.log('Admin Root Shadow DOM:', hasShadowRoot ? '✅' : '❌');
    
    if (hasShadowRoot) {
      console.log('Shadow Root Mode:', adminRoot.shadowRoot.mode);
      console.log('Shadow Root Children:', adminRoot.shadowRoot.children.length);
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
 * Fallback: Thêm prefix vào tất cả CSS selectors
 */
export function prefixCSSSelectors(css, prefix = '#admin-root') {
  // Bỏ qua @rules và :root
  return css.replace(
    /([^{}@]+)\{/g,
    (match, selector) => {
      // Bỏ qua @rules
      if (selector.trim().startsWith('@')) return match;
      
      // Bỏ qua :root
      if (selector.trim().includes(':root')) return match;
      
      // Thêm prefix
      const prefixed = selector
        .split(',')
        .map(s => {
          const trimmed = s.trim();
          // Nếu đã có prefix, bỏ qua
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

  // Sử dụng MutationObserver để theo dõi thay đổi
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        console.warn('⚠️ Admin root style changed externally:', mutation.target.style.cssText);
      }
    });
  });

  observer.observe(adminRoot, {
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  return observer;
}
