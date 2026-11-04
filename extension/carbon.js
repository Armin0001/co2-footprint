// Sustainable Web Design Model v4, with the same constants as CO2.js by
// The Green Web Foundation.
// https://sustainablewebdesign.org/estimating-digital-emissions/

const KWH_PER_GB =
  0.055 + 0.059 + 0.080 + // operational energy: data centres, networks, user devices
  0.012 + 0.013 + 0.081;  // embodied energy:    data centres, networks, user devices

const GRID_GCO2E_PER_KWH = 494; // global average grid intensity (Ember)

function gramsCO2e(bytes) {
  return (bytes / 1e9) * KWH_PER_GB * GRID_GCO2E_PER_KWH;
}

// Typical size of one file, used for files whose server keeps their size private.
// HTTP Archive Web Almanac 2024: median bytes per page ÷ median files per page, by type.
const TYPICAL_BYTES = {
  script: 26_000, // 613 KB of JavaScript in 24 files
  css: 10_000,    // 78 KB of CSS in 8 files
  font: 33_000,   // 131 KB of fonts in 4 files
  image: 59_000,  // 1,054 KB of images in 18 files
  html: 9_000,    // 18 KB of HTML in 2 files
};

// SWD v4 digital carbon ratings. Each grade's limit (grams per page view) is the
// 5th, 10th, 20th, 30th, 40th and 50th percentile of web pages.
const RATINGS = [
  { grade: 'A+', max: 0.040, cleanerThan: 95 },
  { grade: 'A', max: 0.079, cleanerThan: 90 },
  { grade: 'B', max: 0.145, cleanerThan: 80 },
  { grade: 'C', max: 0.209, cleanerThan: 70 },
  { grade: 'D', max: 0.278, cleanerThan: 60 },
  { grade: 'E', max: 0.359, cleanerThan: 50 },
  { grade: 'F', max: Infinity, cleanerThan: 0 },
];

function rate(grams) {
  return RATINGS.find((r) => grams <= r.max);
}
