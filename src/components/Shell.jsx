export default function Shell({ children }) {
  return (
    <div className="page">
      <main className="stage">
        <section className="card">{children}</section>
      </main>
    </div>
  );
}
