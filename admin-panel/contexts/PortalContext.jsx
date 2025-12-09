import { createContext, useContext, useState, useEffect } from 'react';

const PortalContext = createContext(null);

export function PortalProvider({ children }) {
  const [container, setContainer] = useState(null);

  useEffect(() => {
    // Find the admin root container
    const adminRoot = document.getElementById('admin-root');
    if (adminRoot) {
      setContainer(adminRoot);
    } else {
      setContainer(document.body);
    }
  }, []);

  return (
    <PortalContext.Provider value={container}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortalContainer() {
  return useContext(PortalContext);
}
