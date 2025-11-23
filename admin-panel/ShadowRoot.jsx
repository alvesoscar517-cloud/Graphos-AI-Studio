import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Shadow DOM wrapper để tách hoàn toàn CSS
 * Tất cả styles bên trong sẽ không bị ảnh hưởng bởi global CSS
 */
export default function ShadowRoot({ children, styles }) {
  const shadowHostRef = useRef(null);
  const shadowRootRef = useRef(null);
  const reactRootRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!shadowHostRef.current || isInitialized.current) return;

    try {
      // Tạo Shadow DOM
      shadowRootRef.current = shadowHostRef.current.attachShadow({ mode: 'open' });
      
      // Inject CSS vào Shadow DOM
      if (styles) {
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        shadowRootRef.current.appendChild(styleElement);
      }
      
      // Tạo container cho React
      const container = document.createElement('div');
      container.id = 'shadow-container';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.minHeight = '100vh';
      shadowRootRef.current.appendChild(container);

      // Render React app vào Shadow DOM
      reactRootRef.current = createRoot(container);
      reactRootRef.current.render(children);
      
      isInitialized.current = true;
      console.log('✅ Shadow DOM created successfully for Admin Panel');
    } catch (error) {
      console.error('❌ Failed to create Shadow DOM:', error);
    }
  }, []);

  // Update children khi thay đổi
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
