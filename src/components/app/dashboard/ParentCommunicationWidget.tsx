import Link from 'next/link';
import type { ParentCommunicationSummary } from './types';
import { Reveal } from './Reveal';

type Props = {
  data: ParentCommunicationSummary;
};

export function ParentCommunicationWidget({ data }: Props) {
  return (
    <Reveal as="article" className="dash-widget" delayMs={90}>
      <div className="dash-widgetHead">
        <h3 className="dash-widgetTitle">
          <span className="dash-iconChip" aria-hidden>
            💬
          </span>
          Parent Communication
        </h3>
        <Link href="/parent-communication" className="dash-viewAll">
          View All
        </Link>
      </div>

      <div className="dash-pcRows">
        <div className="dash-pcRow">
          <div className="dash-pcMeta">
            <span className="dash-pcIcon dash-pcWarn" aria-hidden>
              ❓
            </span>
            <span>Concerns</span>
          </div>
          <div className="dash-pcBox dash-pcBoxWarn">
            <b>{data.concernsPending} Pending</b>
            <span>{data.concernsReportedToday} Reported Today</span>
          </div>
        </div>

        <div className="dash-pcRow">
          <div className="dash-pcMeta">
            <span className="dash-pcIcon dash-pcOk" aria-hidden>
              📝
            </span>
            <span>Notes</span>
          </div>
          <div className="dash-pcBox dash-pcBoxOk">
            <b>{data.notesPending} Pending</b>
            <span>{data.notesCreatedToday} Created Today</span>
          </div>
        </div>

        <div className="dash-pcRow">
          <div className="dash-pcMeta">
            <span className="dash-pcIcon dash-pcInfo" aria-hidden>
              🏖️
            </span>
            <span>Leaves</span>
          </div>
          <div className="dash-pcBox dash-pcBoxInfo">
            <b>{data.leavesPending} Pending</b>
            <span>{data.leavesOutToday} Out today</span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
