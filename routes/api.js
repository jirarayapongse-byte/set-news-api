const express = require('express');
const router = express.Router();
const scrapeSET = require('../scrapers/set');

router.get('/news/set', async (req, res) => {
  const { ticker, fromDate, toDate } = req.query;

  if (!ticker || !fromDate || !toDate) {
    return res.status(400).json({ error: 'ticker, fromDate, and toDate are required' });
  }

  try {
    const news = await scrapeSET(ticker, fromDate, toDate);
    res.json({ source: 'SET', results: news });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch SET news' });
  }
});

module.exports = router;

Add API route for SET news
