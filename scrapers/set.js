const axios = require('axios');

async function scrapeSET(ticker, fromDate, toDate) {
  const endpoint = 'https://www.set.or.th/api/set/market/newsandalert/news';

  try {
    const response = await axios.post(endpoint, {
      language: 'TH',
      securitySymbol: ticker,
      fromDate,
      toDate,
      page: 1,
      limit: 50
    });

    const results = response.data?.data?.map(item => ({
      symbol: item.symbol,
      date: item.displayDate,
      title: item.headline,
      link: item.pdfUrl || item.newsUrl || 'https://www.set.or.th',
    })) || [];

    return results;
  } catch (error) {
    console.error('❌ SET API Error:', error.message);
    throw new Error('SET API request failed');
  }
}

module.exports = scrapeSET;
