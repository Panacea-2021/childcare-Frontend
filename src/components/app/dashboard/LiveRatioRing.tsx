type Props = {
  student: number;
  staff: number;
};

/** SVG live ratio ring — Panacea accent + mint. */
export function LiveRatioRing({ student, staff }: Props) {
  const total = student + staff;
  const size = 128;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const studentPct = total === 0 ? 0 : student / total;
  const staffPct = total === 0 ? 0 : staff / total;
  const studentLen = c * studentPct;
  const staffLen = c * staffPct;

  return (
    <div className="dash-ratioRingWrap" aria-hidden={total === 0}>
      <svg className="dash-ratioRing" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="dash-ratioTrack"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
        />
        {total > 0 ? (
          <>
            <circle
              className="dash-ratioArc dash-ratioArcStudent"
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              strokeWidth={stroke}
              strokeDasharray={`${studentLen} ${c - studentLen}`}
              strokeDashoffset={c * 0.25}
              strokeLinecap="round"
            />
            <circle
              className="dash-ratioArc dash-ratioArcStaff"
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              strokeWidth={stroke}
              strokeDasharray={`${staffLen} ${c - staffLen}`}
              strokeDashoffset={c * 0.25 - studentLen}
              strokeLinecap="round"
            />
          </>
        ) : null}
      </svg>
      <div className="dash-ratioRingCenter">
        <span>Ratio</span>
        <strong>
          {student}:{staff}
        </strong>
      </div>
    </div>
  );
}
