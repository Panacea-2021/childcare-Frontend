import type { DoseStatus, VaccineDose, VaccineRecord } from './types';

/** Matches Illumine Step-1 demo catalog */
const CATALOG: { name: string; doses: number; mandatory?: boolean; overdueFirst?: number }[] = [
  { name: 'Boostrix', doses: 5, overdueFirst: 1 },
  { name: 'Rotarix® (oral)', doses: 2, overdueFirst: 2 },
  { name: 'Infanrix® hexa', doses: 3, mandatory: true, overdueFirst: 1 },
  { name: 'Prevenar 13®', doses: 3, overdueFirst: 3 },
  { name: 'Bexsero®', doses: 3, overdueFirst: 3 },
  { name: 'Priorix®', doses: 2, mandatory: true, overdueFirst: 1 },
  { name: 'Varivax®', doses: 2, mandatory: true, overdueFirst: 1 },
  { name: 'Infanrix® IPV', doses: 1, overdueFirst: 0 },
  { name: 'Gardasil® 9', doses: 3, overdueFirst: 0 },
  { name: 'Nimenrix®', doses: 1, overdueFirst: 0 },
];

function makeDoses(count: number, overdueFirst = 0): VaccineDose[] {
  return Array.from({ length: count }, (_, i) => {
    const index = i + 1;
    if (i < overdueFirst) {
      return {
        index,
        status: 'Overdue' as const,
        dueDate: `${String(9 + i).padStart(2, '0')}/05/2017`,
      };
    }
    return {
      index,
      status: 'Pending' as const,
      dueDate: `18/04/${2028 + i}`,
    };
  });
}

export function defaultVaccines(): VaccineRecord[] {
  return CATALOG.map((v, i) => ({
    id: `vax-v2-${i + 1}`,
    name: v.name,
    mandatory: v.mandatory,
    dosesRequired: v.doses,
    doses: makeDoses(v.doses, v.overdueFirst ?? 0),
  }));
}

export function isLegacyVaccine(v: VaccineRecord) {
  return (
    !Array.isArray(v.doses) ||
    typeof v.dosesRequired !== 'number' ||
    !String(v.id).startsWith('vax-v2-')
  );
}

export function normalizeVaccines(list: VaccineRecord[] | undefined): VaccineRecord[] {
  if (!list?.length) return defaultVaccines();
  if (list.some(isLegacyVaccine)) return defaultVaccines();
  return list;
}

/** `09/05/2017` or ISO → `09/05/17` */
export function formatVaccineShortDate(value?: string) {
  if (!value) return '—';
  const dmy = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/);
  if (dmy) {
    const yy = dmy[3].length === 2 ? dmy[3] : dmy[3].slice(-2);
    return `${dmy[1].padStart(2, '0')}/${dmy[2].padStart(2, '0')}/${yy}`;
  }
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1].slice(-2)}`;
  return value;
}

export type FlattenedVaccineDose = {
  key: string;
  vaccineId: string;
  vaccineName: string;
  doseIndex: number;
  label: string;
  date: string;
  status: DoseStatus;
};

export function flattenDoses(vaccines: VaccineRecord[]): FlattenedVaccineDose[] {
  const rows: FlattenedVaccineDose[] = [];
  for (const v of vaccines) {
    if (v.exempt) continue;
    for (const d of v.doses || []) {
      const date = d.status === 'Done' ? d.administeredOn : d.dueDate;
      rows.push({
        key: `${v.id}-${d.index}`,
        vaccineId: v.id,
        vaccineName: v.name,
        doseIndex: d.index,
        label: `${v.name} Dose ${d.index}`,
        date: formatVaccineShortDate(date),
        status: d.status,
      });
    }
  }
  return rows;
}

export function listOverdueVaccineDoses(vaccines: VaccineRecord[]): FlattenedVaccineDose[] {
  return flattenDoses(vaccines).filter((d) => d.status === 'Overdue');
}

/** Latest / next relevant dose for Health table “Vaccination Status”. */
export function vaccinationStatusDisplay(vaccines: VaccineRecord[]): {
  label: string;
  date: string;
} | null {
  const flat = flattenDoses(vaccines);
  if (!flat.length) return null;

  const overdue = flat.find((d) => d.status === 'Overdue');
  if (overdue) return { label: overdue.label, date: overdue.date };

  const pending = flat.find((d) => d.status === 'Pending');
  if (pending) return { label: pending.label, date: pending.date };

  const done = [...flat].reverse().find((d) => d.status === 'Done');
  if (done) return { label: done.label, date: done.date };

  const exempt = flat.find((d) => d.status === 'Exempt');
  if (exempt) return { label: exempt.label, date: exempt.date || '—' };

  return { label: flat[0].label, date: flat[0].date };
}
