export const lagnas = [
  'mesha',
  'vrushabha',
  'mithuna',
  'kataka',
  'simha',
  'kanya',
  'thula',
  'vrushchika',
  'dhanu',
  'makara',
  'kumbha',
  'meena',
] as const;

export type Lagna = (typeof lagnas)[number];
