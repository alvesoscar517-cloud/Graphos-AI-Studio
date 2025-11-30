export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-10 h-10 rounded-full border-3 border-surface-secondary border-t-primary animate-spin" />
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}
