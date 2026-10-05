import Link from 'next/link';
import type { BillingSummary } from './types';
import { Reveal } from './Reveal';

type Props = {
  data: BillingSummary;
};

function formatMoney(currency: string, amount: number): string {
  return `${currency} ${amount.toLocaleString('en-IN')}`;
}

export function BillingWidget({ data }: Props) {
  const max = Math.max(...data.ageing.map((a) => a.value), 1);
  const hasBars = data.ageing.some((a) => a.value > 0);

  return (
    <Reveal as="article" className="dash-widget" delayMs={80}>
      <div className="dash-widgetHead">
        <h3 className="dash-widgetTitle">
          <span className="dash-iconChip" aria-hidden>
            🧾
          </span>
          Billing &amp; Accounting
        </h3>
        <Link href="/billing-accounting" className="dash-viewAll">
          View All
        </Link>
      </div>

      <div className="dash-billingTotals">
        <div className="dash-billingBox dash-billingPink">
          <strong>{formatMoney(data.currency, data.totalBilled)}</strong>
          <span>Total Billed Amount</span>
        </div>
        <div className="dash-billingBox dash-billingTeal">
          <strong>{formatMoney(data.currency, data.totalCollected)}</strong>
          <span>Total Collected Amount</span>
        </div>
      </div>

      <div className="dash-chartBlock">
        <div className="dash-chartHead">
          <p>Ageing Bucket for Overdue Invoices</p>
          <span className="dash-chip">{data.periodLabel}</span>
        </div>

        <div className="dash-ageingBars" aria-hidden={!hasBars}>
          {data.ageing.map((bucket) => (
            <div key={bucket.label} className="dash-ageingBarCol">
              <div className="dash-ageingBarTrack">
                <div
                  className={`dash-ageingBarFill dash-age-${bucket.color}`}
                  style={{ height: hasBars ? `${Math.max(6, (bucket.value / max) * 100)}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>

        <ul className="dash-ageingLegend">
          {data.ageing.map((bucket) => (
            <li key={bucket.label}>
              <span className={`dash-legendSwatch dash-age-${bucket.color}`} />
              {bucket.label}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
