import Link from 'next/link';
import type { InstallationsSummary } from './types';
import { Reveal } from './Reveal';

type Props = {
  data: InstallationsSummary;
};

function Donut({
  installed,
  notInstalled,
  withLabel,
  withoutLabel,
  accent,
}: {
  installed: number;
  notInstalled: number;
  withLabel: string;
  withoutLabel: string;
  accent: 'green' | 'yellow';
}) {
  const total = installed + notInstalled || 1;
  const installedPct = (installed / total) * 100;
  const color = accent === 'green' ? 'var(--color-success)' : '#c4a35a';
  const style = {
    background: `conic-gradient(${color} 0 ${installedPct}%, #e8edf5 ${installedPct}% 100%)`,
  };

  return (
    <div className="dash-donutBlock">
      <div className="dash-donut" style={style} aria-hidden>
        <div className="dash-donutHole">
          <strong>{installed}</strong>
          <span>on</span>
        </div>
      </div>
      <div className="dash-donutLegend">
        <p>
          <span className={`dash-legendBar dash-age-${accent === 'green' ? 'green' : 'yellow'}`} />
          {withLabel}
        </p>
        <p>
          <span className="dash-legendBar dash-legendOff" />
          {withoutLabel}
        </p>
      </div>
    </div>
  );
}

export function InstallationsWidget({ data }: Props) {
  return (
    <Reveal as="article" className="dash-widget" delayMs={100}>
      <div className="dash-widgetHead">
        <h3 className="dash-widgetTitle">
          <span className="dash-iconChip" aria-hidden>
            📱
          </span>
          Installations
        </h3>
        <Link href="/parent-communication" className="dash-viewAll">
          View All
        </Link>
      </div>

      <div className="dash-installKpis">
        <div className="dash-installKpi dash-installOk">
          <strong>{data.parentsInstalled}</strong>
          <span>Installed by parents</span>
        </div>
        <div className="dash-installKpi dash-installWarn">
          <strong>{data.staffInstalled}</strong>
          <span>Installed by staff</span>
        </div>
      </div>

      <p className="dash-installReportTitle">Installation Report Data</p>

      <div className="dash-donutRow">
        <Donut
          installed={data.parentsInstalled}
          notInstalled={data.parentsNotInstalled}
          withLabel="Parents with installation"
          withoutLabel="Parents without installation"
          accent="green"
        />
        <Donut
          installed={data.staffInstalled}
          notInstalled={data.staffNotInstalled}
          withLabel="Staff with installation"
          withoutLabel="Staff without installation"
          accent="yellow"
        />
      </div>
    </Reveal>
  );
}
