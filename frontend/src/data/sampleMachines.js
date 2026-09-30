/**
 * Fallback machine data used when the API is unreachable (offline dev,
 * backend not running). This is the one real machine currently in the
 * system — the Karl Mayer HKS 3-M nameplate/video already wired into
 * MachineDetail.jsx. Shared here so HomePage's featured section and
 * MachineListings' fallback stay in sync instead of duplicating data.
 */
export const SAMPLE_MACHINES = [
  {
    id: 1,
    type: 'knitting',
    subtype: 'Warp Knitting (Tricot)',
    brand: 'Karl Mayer',
    model: 'HKS 3-M',
    year: 2003,
    location: 'On request',
    price: 0,
    photo: '/machines/karl-mayer-hks3m-plate.webp',
    description: 'E28 gauge, 210" working width, needle number 51.50. Made in Germany.',
  },
];
