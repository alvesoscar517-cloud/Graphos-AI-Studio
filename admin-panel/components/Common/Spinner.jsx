// CSS migrated to Tailwind

export default function Spinner({ size = 'medium', color = 'primary' }) {
  return (
    <div className={`spinner spinner-${size} spinner-${color}`}>
      <div className="spinner-circle"></div>
    </div>
  );
}
