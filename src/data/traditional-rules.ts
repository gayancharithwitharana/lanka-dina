export type Planet = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn';

export type Location = {
  name: { en: string; si?: string; ta?: string };
  latitude: number;
  longitude: number;
};

export type TraditionalRules = {
  location: Location;
  rahuKalayaParts: number[];
  dayRulers: Planet[];
  horawaOrder: Planet[];
  maru: (string | null)[];
};
