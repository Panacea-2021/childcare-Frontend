export type PcTone =
  | 'purple'
  | 'green'
  | 'pink'
  | 'coral'
  | 'amber'
  | 'sky'
  | 'mint'
  | 'lavender';

export function newsletterThemeTone(
  theme: 'parents' | 'learning' | 'independence' | 'stem' | 'default' | string,
): PcTone {
  switch (theme) {
    case 'parents':
      return 'pink';
    case 'learning':
      return 'purple';
    case 'independence':
      return 'green';
    case 'stem':
      return 'sky';
    default:
      return 'lavender';
  }
}
