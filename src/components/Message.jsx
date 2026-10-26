// Simple inline icons, no icon library needed.
const ICONS = {
  success: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  wait: <path d="M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  closed: <path d="M7 11V8a5 5 0 0110 0v3M6 11h12v9H6z" />,
  search: <path d="M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5" />,
  error: <path d="M12 8v5m0 3.5v.01M10.3 4l-8 14a2 2 0 001.7 3h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z" />,
  qr: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2" />,
};

export default function Message({ tone = 'qr', title, text, children }) {
  return (
    <div className={`message tone-${tone}`}>
      <div className="message-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {ICONS[tone] || ICONS.qr}
        </svg>
      </div>
      <h1>{title}</h1>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}
