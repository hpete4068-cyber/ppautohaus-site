/** Presentation-only photos for SAMPLE listings. The car records stay sample data. */
export interface Shot {
  base: string;
  alt: string;
  width: number;
  height: number;
}

export const SAMPLE_SHOTS: Record<string, Shot[]> = {
  'SAMPLE-001': [
    {
      base: 'stock-huracan-profile',
      alt: 'White Lamborghini Huracán in side profile in a showroom. Sample photograph, not the listed vehicle.',
      width: 2400,
      height: 1350,
    },
    {
      base: 'stock-huracan-interior',
      alt: 'Tan leather interior of a Lamborghini Huracán from the driver seat. Sample photograph, not the listed vehicle.',
      width: 2400,
      height: 1350,
    },
  ],
  'SAMPLE-002': [
    {
      base: 'stock-db11-rear',
      alt: 'Rear view of a dark blue Aston Martin DB11 in a showroom. Sample photograph, not the listed vehicle.',
      width: 2400,
      height: 1600,
    },
    {
      base: 'stock-db11-interior',
      alt: 'Aston Martin DB11 interior with a red steering wheel and white leather seats. Sample photograph, not the listed vehicle.',
      width: 2400,
      height: 1600,
    },
  ],
  'SAMPLE-003': [
    {
      base: 'stock-portofino-profile',
      alt: 'Blue Ferrari Portofino with the roof down, side view on a paved forecourt. Sample photograph, not the listed vehicle.',
      width: 2400,
      height: 1350,
    },
  ],
};
