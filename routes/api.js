const express = require('express');
const router = express.Router();
const scrapeSET = require('../scrapers/set');
const scrapeSettradeBusinessAnalysis = require('../scrapers/settradeBusinessAnalysis');
const scrapeSettradeIaa = require('../scrapers/settradeIaa');
const { formatBangkok } = require('../utils/time');
const { summarizeThaiArticle } = require('../services/summarizer');
const { getSampleResults } = require('../services/mockData');

router.get('/news/set', async (req, res) => {
  const { ticker, fromDate, toDate } = req.query;

  if (!ticker || !fromDate || !toDate) {
    return res.status(400).json({ error: 'ticker, fromDate, and toDate are required' });
  }

  try {
    if (process.env.MOCK === 'true') {
      return res.json({ source: 'SET', results: getSampleResults({ ticker }) });
    }

    const news = await scrapeSET(ticker, fromDate, toDate);
    res.json({ source: 'SET', results: news });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch SET news' });
  }
});

router.get('/search', async (req, res) => {
  const { ticker, industry, fromDate, toDate, sources, summarize } = req.query;

  try {
    if (process.env.MOCK === 'true') {
      return res.json({ count: 1, results: getSampleResults({ ticker, industry }) });
    }

    const sourceList = (sources || 'set,settrade_business,settrade_iaa')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    const tasks = [];
    if (sourceList.includes('set')) {
      if (ticker && fromDate && toDate) {
        tasks.push(
          scrapeSET(ticker, fromDate, toDate).then(rows => rows.map(r => ({
            timeBKK: formatBangkok(r.date),
            source: 'SET',
            category: 'NEWS',
            symbols: r.symbol ? [r.symbol] : [],
            title: r.title,
            articleSummary: '',
            pdf: r.link,
            url: r.link,
            industry: null,
          })))
        );
      }
    }

    if (sourceList.includes('settrade_business')) {
      tasks.push(scrapeSettradeBusinessAnalysis({ ticker, industry, fromDate, toDate }));
    }

    if (sourceList.includes('settrade_iaa')) {
      tasks.push(scrapeSettradeIaa({ ticker, industry, fromDate, toDate }));
    }

    const settled = await Promise.all(tasks.map(p => p.catch(() => [])));
    let items = settled.flat();

    // Filter by ticker and industry if provided
    if (ticker) {
      items = items.filter(it => (it.symbols || []).some(s => s && s.toUpperCase() === ticker.toUpperCase()));
    }
    if (industry) {
      items = items.filter(it => (it.industry || '').toLowerCase().includes(industry.toLowerCase()));
    }

    // Date filtering (assuming timeBKK is parseable) — keep as-is since some items may already formatted
    if (fromDate) {
      items = items.filter(it => !it.timeBKK || it.timeBKK >= fromDate);
    }
    if (toDate) {
      items = items.filter(it => !it.timeBKK || it.timeBKK <= toDate);
    }

    // Summarization optional
    if (String(summarize).toLowerCase() === 'true') {
      const summarized = [];
      for (const it of items) {
        const sum = await summarizeThaiArticle({ title: it.title, body: it.articleSummary });
        summarized.push({ ...it, articleSummary: sum });
      }
      items = summarized;
    }

    // Sort by time desc if available
    items.sort((a, b) => {
      const ad = a.timeBKK || '';
      const bd = b.timeBKK || '';
      return ad < bd ? 1 : ad > bd ? -1 : 0;
    });

    const formatted = items.map(it => ({
      Time_BKK: it.timeBKK || null,
      Source: it.source,
      Category: it.category,
      Symbols: it.symbols,
      Article_Summary: it.articleSummary,
      PDF: it.pdf || it.url || null,
    }));

    res.json({ count: formatted.length, results: formatted });
  } catch (err) {
    console.error('search error', err.message);
    res.status(500).json({ error: 'Failed to aggregate results' });
  }
});

module.exports = router;


