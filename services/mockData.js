const { formatBangkok } = require('../utils/time');

function getSampleResults({ ticker = 'ADVANC', industry = 'ICT' } = {}) {
  const now = formatBangkok(new Date());
  return [
    {
      Time_BKK: now,
      Source: 'SETTRADE',
      Category: 'INDUSTRY_NOTE',
      Symbols: [ticker, 'TRUE'],
      Article_Summary: 'ICT sector: data growth re-accelerates. Traffic growth improved on QoQ comps as promotions eased…',
      PDF: 'PDF2',
    }
  ];
}

module.exports = { getSampleResults };