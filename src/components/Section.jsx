export default function Section({ title, children }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}
