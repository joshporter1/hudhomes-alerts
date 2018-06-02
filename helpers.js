const cheerio = require('cheerio');
const moment = require('moment');

function extractListings (html) {
  const $ = cheerio.load(html);
  const homeRows = $('#dgPropertyList tbody tr.FormTableRow, #dgPropertyList tbody tr.FormTableRowAlt');

  const homes = [];
  homeRows.each((i, el) => {
    // scrape necessary data from each row and push to array
    let id = $(el).children('td:nth-child(2)').first().text().trim();
    let address = $($(el).children('td:nth-child(3)').first().html().replace(/<br>/g,' ')).text().trim()
    let price = $(el).children('td:nth-child(4)').first().text().trim();
    let status = $(el).find('td:nth-child(5) img').first().attr('title');
    let link = $(el).find('td:nth-child(2) a').first().attr('onclick').replace('top.location.href=\'', '').replace('\';', '');
    let bidOpenDate = $(el).children('td:nth-child(9)').first().text().trim();
    homes.push({id, address, price, bidOpenDate, status, link})
  });

  return homes;
}

module.exports = {
  extractListings
};
