type Stat = {
  label: string;
  value: string | number;
  icon: string;
  tone?: 'beige' | 'mint' | 'lavender' | 'blush';
};

export function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="mod-stats">
      {stats.map((s) => (
        <article key={s.label} className="mod-stat">
          <div className={`mod-statIcon ${s.tone ?? 'beige'}`} aria-hidden>
            {s.icon}
          </div>
          <div>
            <p>{s.label}</p>
            <strong>{s.value}</strong>
          </div>
        </article>
      ))}
    </div>
  );
}
