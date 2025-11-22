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

  useEffect(() => {
    if (!shadowHostRef.current) return;

    // Tạo Shadow DOM
    if (!shadowRootRef.current) {
      shadowRootRef.current = shadowHostRef.current.attachShadow({ mode: 'open' });
      
      // Tạo container cho React
      const container = document.createElement('div');
      container.id = 'shadow-container';
      shadowRootRef.current.appendChild(container);

      // Inject CSS vào Shadow DOM
      if (styles) {
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        shadowRootRef.current.appendChild(styleElement);
      }

      // Render React app vào Shadow DOM
      reactRootRef.current = createRoot(container);
    }

    // Render children
    reactRootRef.current.render(children);

    return () => {
      if (reactRootRef.current) {
        reactRootRef.current.unmount();
      }
    };
  }, [children, styles]);

  return <div ref={shadowHostRef} style={{ width: '100%', height: '100%' }} />;
}
