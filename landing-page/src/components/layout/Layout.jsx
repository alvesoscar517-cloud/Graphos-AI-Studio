import Header from './Header'
import Footer from './Footer'

// Tech grid background with glow
const PageBackground = () => (
  <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
    {/* Base background */}
    <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
    
    {/* Grid pattern - more visible */}
    <div 
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    />
    
    {/* Larger grid overlay */}
    <div 
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.12) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.12) 1px, transparent 1px)
        `,
        backgroundSize: '200px 200px',
      }}
    />
    
    {/* Radial glow from top center */}
    <div 
      className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[70%] opacity-100"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
      }}
    />
    
    {/* Corner accents */}
    <div 
      className="absolute bottom-0 left-0 w-[40%] h-[30%] opacity-100"
      style={{
        background: 'radial-gradient(ellipse at 0% 100%, rgba(139, 92, 246, 0.06) 0%, transparent 60%)',
      }}
    />
    <div 
      className="absolute bottom-0 right-0 w-[40%] h-[30%] opacity-100"
      style={{
        background: 'radial-gradient(ellipse at 100% 100%, rgba(34, 197, 94, 0.05) 0%, transparent 60%)',
      }}
    />
  </div>
)

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary relative">
      <PageBackground />
      <Header />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
