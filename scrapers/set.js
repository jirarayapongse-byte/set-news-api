const axios = require('axios');

async function scrapeSET(ticker, fromDate, toDate) {
  const endpoint = 'https://www.set.or.th/api/set/market/newsandalert/news';

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
}

module.exports = scrapeSET;


