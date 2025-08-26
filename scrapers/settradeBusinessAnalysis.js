const axios = require('axios');

async function scrapeSettradeBusinessAnalysis({ ticker, industry, fromDate, toDate, limit = 100 }) {
  // There is no public doc; endpoint inferred from network calls may change.
  // We try a couple of plausible paths and merge results, filtering on client side.
  const candidateEndpoints = [
    'https://www.settrade.com/api/research/businessanalysis',
    'https://www.settrade.com/api/research/business-analysis',
  ];

  const results = [];
  for (const endpoint of candidateEndpoints) {
    try {
      const response = await axios.get(endpoint, {
        params: {
          symbol: ticker || undefined,
          industry: industry || undefined,
          from: fromDate || undefined,
          to: toDate || undefined,
          limit
        },
        timeout: 15000,
      });

      const rows = response.data?.data || response.data || [];
      for (const row of rows) {
        const record = {
          timeBKK: row.publishedAt || row.displayDate || row.date || null,
          source: 'SETTRADE',
          category: row.category || 'INDUSTRY_NOTE',
          symbols: Array.isArray(row.symbols) ? row.symbols : (row.symbol ? [row.symbol] : []),
          title: row.title || row.headline || '',
          articleSummary: row.summary || row.abstract || row.description || '',
          pdf: row.pdfUrl || row.pdf || row.link || null,
          url: row.url || row.link || null,
          industry: row.industry || null,
        };
        results.push(record);
      }
    } catch (err) {
      // try next endpoint candidate
      continue;
    }
  }

  return results;
}

module.exports = scrapeSettradeBusinessAnalysis;