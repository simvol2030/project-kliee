const fs = require('fs');
const path = require('path');

const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, '../_old-static-site/catalog.json'), 'utf-8'));

const categoryToSlug = {
  'CHEBU-RASHA': 'chebu-rasha',
  '«π» OR THE LAST SUPPER': 'last-supper',
  "SOMEBODY'S BOUDOIR, SOMEBODY'S ABATTOIR": 'sbsa',
  'THE BULL': 'the-bull',
  'HOTEL SERIES': 'hotel-series',
  'SCULPTURES': 'sculptures',
  'PORCELAIN': 'porcelain',
  'NFT': 'nft'
};

const artworks = catalog.map((item) => {
  const id = 'artwork-' + String(item['ID']).padStart(3, '0');
  const seriesSlug = categoryToSlug[item['Категория']] || item['Категория'].toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Parse price
  let price = null;
  if (item['Цена'] && item['Цена'].startsWith('£')) {
    price = parseInt(item['Цена'].replace(/[^0-9]/g, ''));
  }

  // Parse year from note
  let year = null;
  const note = item['Примечание'] || '';
  if (/^\d{4}$/.test(note)) {
    year = parseInt(note);
  }

  return {
    id,
    title: {
      en: item['Название'],
      ru: item['Название'],
      es: item['Название'],
      zh: item['Название']
    },
    series: seriesSlug,
    technique: {
      en: item['Тип/Техника'],
      ru: item['Тип/Техника'],
      es: item['Тип/Техника'],
      zh: item['Тип/Техника']
    },
    year: year,
    dimensions: null,
    price: price,
    currency: price ? 'GBP' : null,
    images: ['/' + item['Путь к изображению']],
    available: true,
    note: note && !/^\d{4}$/.test(note) ? note : null
  };
});

const output = {
  version: '1.0',
  lastUpdated: '2025-12-20',
  artworks
};

fs.writeFileSync(path.join(__dirname, '../data/artworks.json'), JSON.stringify(output, null, 2));
console.log('Created artworks.json with', artworks.length, 'artworks');
