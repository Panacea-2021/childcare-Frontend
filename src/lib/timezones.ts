/**
 * Browser Intl.supportedValuesOf('timeZone') only returns canonical IANA names
 * (Africa…Pacific — stops around "P"). Apps like Illumine also include legacy
 * aliases (US/*, Canada/*, CET, UTC, Zulu, …) so the list reads A→Z.
 */

const LEGACY_TIMEZONE_ALIASES = [
  'Africa/Asmera',
  'Africa/Timbuktu',
  'America/Argentina/ComodRivadavia',
  'America/Atka',
  'America/Buenos_Aires',
  'America/Catamarca',
  'America/Coral_Harbour',
  'America/Cordoba',
  'America/Ensenada',
  'America/Fort_Wayne',
  'America/Indianapolis',
  'America/Jujuy',
  'America/Knox_IN',
  'America/Louisville',
  'America/Mendoza',
  'America/Montreal',
  'America/Porto_Acre',
  'America/Rosario',
  'America/Santa_Isabel',
  'America/Shiprock',
  'America/Virgin',
  'Antarctica/South_Pole',
  'Asia/Ashkhabad',
  'Asia/Calcutta',
  'Asia/Chongqing',
  'Asia/Chungking',
  'Asia/Dacca',
  'Asia/Harbin',
  'Asia/Kashgar',
  'Asia/Katmandu',
  'Asia/Macao',
  'Asia/Rangoon',
  'Asia/Saigon',
  'Asia/Tel_Aviv',
  'Asia/Thimbu',
  'Asia/Ujung_Pandang',
  'Asia/Ulan_Bator',
  'Atlantic/Faeroe',
  'Atlantic/Jan_Mayen',
  'Australia/ACT',
  'Australia/Canberra',
  'Australia/LHI',
  'Australia/NSW',
  'Australia/North',
  'Australia/Queensland',
  'Australia/South',
  'Australia/Tasmania',
  'Australia/Victoria',
  'Australia/West',
  'Australia/Yancowinna',
  'Brazil/Acre',
  'Brazil/DeNoronha',
  'Brazil/East',
  'Brazil/West',
  'CET',
  'CST6CDT',
  'Canada/Atlantic',
  'Canada/Central',
  'Canada/Eastern',
  'Canada/Mountain',
  'Canada/Newfoundland',
  'Canada/Pacific',
  'Canada/Saskatchewan',
  'Canada/Yukon',
  'Chile/Continental',
  'Chile/EasterIsland',
  'Cuba',
  'EET',
  'EST',
  'EST5EDT',
  'Egypt',
  'Eire',
  'Etc/GMT',
  'Etc/Greenwich',
  'Etc/UCT',
  'Etc/UTC',
  'Etc/Universal',
  'Etc/Zulu',
  'GB',
  'GB-Eire',
  'GMT',
  'GMT+0',
  'GMT-0',
  'GMT0',
  'Greenwich',
  'HST',
  'Hongkong',
  'Iceland',
  'Iran',
  'Israel',
  'Jamaica',
  'Japan',
  'Kwajalein',
  'Libya',
  'MET',
  'MST',
  'MST7MDT',
  'Mexico/BajaNorte',
  'Mexico/BajaSur',
  'Mexico/General',
  'NZ',
  'NZ-CHAT',
  'Navajo',
  'PRC',
  'PST8PDT',
  'Pacific/Johnston',
  'Pacific/Ponape',
  'Pacific/Samoa',
  'Pacific/Yap',
  'Poland',
  'Portugal',
  'ROC',
  'ROK',
  'Singapore',
  'Turkey',
  'UCT',
  'US/Alaska',
  'US/Aleutian',
  'US/Arizona',
  'US/Central',
  'US/East-Indiana',
  'US/Eastern',
  'US/Hawaii',
  'US/Indiana-Starke',
  'US/Michigan',
  'US/Mountain',
  'US/Pacific',
  'US/Pacific-New',
  'US/Samoa',
  'UTC',
  'Universal',
  'W-SU',
  'WET',
  'Zulu',
] as const;

function etcGmtOffsets(): string[] {
  const out: string[] = [];
  for (let i = 0; i <= 14; i++) {
    out.push(`Etc/GMT+${i}`, `Etc/GMT-${i}`);
  }
  return out;
}

export function getAllTimezones(): string[] {
  const set = new Set<string>();

  try {
    if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
      for (const zone of Intl.supportedValuesOf('timeZone')) {
        set.add(zone);
      }
    }
  } catch {
    /* older runtimes */
  }

  for (const zone of LEGACY_TIMEZONE_ALIASES) set.add(zone);
  for (const zone of etcGmtOffsets()) set.add(zone);

  // Minimal fallbacks if Intl is unavailable
  if (set.size < 50) {
    for (const zone of [
      'Africa/Cairo',
      'America/New_York',
      'America/Los_Angeles',
      'Asia/Kolkata',
      'Asia/Dubai',
      'Asia/Tokyo',
      'Australia/Sydney',
      'Europe/London',
      'Europe/Paris',
      'Pacific/Auckland',
      'UTC',
    ]) {
      set.add(zone);
    }
  }

  return [...set].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}
