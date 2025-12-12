import logger from '../lib/logger'
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Shadow DOM wrapper to completely isolate CSS
 * All styles inside will not be affected by global CSS
 */
export default function ShadowRoot({ children, styles }) {
  const shadowHostRef = useRef(null);
  const shadowRootRef = useRef(null);
  const reactRootRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!shadowHostRef.current || isInitialized.current) return;

    try {
      // Create Shadow DOM
      shadowRootRef.current = shadowHostRef.current.attachShadow({ mode: 'open' });
      
      // Inject CSS into Shadow DOM
      if (styles) {
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        shadowRootRef.current.appendChild(styleElement);
      }
      
      // Create container for React
      const container = document.createElement('div');
      container.id = 'shadow-container';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.minHeight = '100vh';
      shadowRootRef.current.appendChild(container);

      // Render React app into Shadow DOM
      reactRootRef.current = createRoot(container);
      reactRootRef.current.render(children);
      
      isInitialized.current = true;
      logger.log('[SUCCESS] Shadow DOM created successfully for Admin Panel');
    } catch (error) {
      console.error('[ERROR] Failed to create Shadow DOM:', error);
    }
  }, []);

  // Update children when changed
  useEffect(() => {
    if (reactRootRef.current && isInitialized.current) {
      reactRootRef.current.render(children);
    }
  }, [children]);

  return (
    <div 
      ref={shadowHostRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '100vh',
        display: 'block'
      }} 
    />
  );
}

