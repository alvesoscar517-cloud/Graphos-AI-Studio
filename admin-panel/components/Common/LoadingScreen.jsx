export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-5">
      <div className="w-9 h-9 rounded-full border-[2.5px] border-surface-secondary border-t-primary animate-spin" 
           style={{ animationDuration: '0.7s', animationTimingFunction: 'cubic-bezier(0.5, 0.1, 0.5, 0.9)' }} />
      <p className="text-[15px] text-muted">{message}</p>
    </div>
  );
}
