const cheerio = require('cheerio');
const moment = require('moment');
const nodemailer = require('nodemailer');

function extractListings(html) {
  const $ = cheerio.load(html);
  const homeRows = $('#dgPropertyList tbody tr.FormTableRow, #dgPropertyList tbody tr.FormTableRowAlt');

  const homes = [];
  const newHomes = []
  homeRows.each((i, el) => {
    // scrape necessary data from each row and push to array
    // grab bidOpenDate. listings page does not have list date.
    // new listings usually have a bidOpenDate 7 days after listing date
    // TODO: scrape these better
    let scrapes = {
      id: $(el).children('td:nth-child(2)').first().text().trim(),
      address:  $($(el).children('td:nth-child(3)').first().html().replace(/<br>/g, ' ')).text().trim(),
      price:  $(el).children('td:nth-child(4)').first().text().trim(),
      beds:  $(el).children('td:nth-child(6)').first().text().trim(),
      baths:  $(el).children('td:nth-child(7)').first().text().trim(),
      status:  $(el).find('td:nth-child(5) img').first().attr('title'),
      link:  $(el).find('td:nth-child(2) a').first().attr('onclick').replace('top.location.href=\'', '').replace('\';', ''),
      bidOpenDate: $(el).children('td:nth-child(9)').first().text().trim()
    }
    // add to newHomes array
    let listingDate = moment(scrapes.bidOpenDate, 'MM/DD/YYYY').subtract(7, 'days')
    scrapes.listingDate = listingDate.format('MM/DD/YYYY')
    if (listingDate.isSame(moment(), 'day')) {
      newHomes.push(scrapes)
    }
    homes.push(scrapes)
  });
  // fire off email if there are any new homes
  if (newHomes.length > 0){
    mailListings(newHomes);
  }
  return homes;
}

function listingsTable(homes) {
  let cellStyle = 'border-bottom: 2px solid #dee2e6; padding: .75rem; border-top: 2px solid #dee2e6"'
  let html = `<table style="border-collapse: collapse;">
    <thead>
      <tr>
        <th style="vertical-align: bottom; ${cellStyle}">ID</th>
        <th style="vertical-align: bottom; ${cellStyle}">Address</th>
        <th style="vertical-align: bottom; ${cellStyle}">Price</th>
        <th style="vertical-align: bottom; ${cellStyle}">Beds</th>
        <th style="vertical-align: bottom; ${cellStyle}">Baths</th>
        <th style="vertical-align: bottom; ${cellStyle}">Status</th>
        <th style="vertical-align: bottom; ${cellStyle}">Bid Open Date</th>
        <th style="vertical-align: bottom; ${cellStyle}">Listing Date</th>
        <th style="vertical-align: bottom; ${cellStyle}"></th>
      </tr>
    </thead>
    <tbody>`
  homes.forEach((home) => {
    let link = home.link
    delete home.link
    html += `<tr>`
    Object.keys(home).forEach((k) => {
      html += `<td style="vertical-align: top; ${cellStyle}">${home[k]}</td>`
    })
    html += `<td style="vertical-align: top; ${cellStyle}">
      <a href='${link}' target='_BLANK'>View Listing</a>
      </td></tr>`
  });
  html += `</tbody></table>`
  return html
}

function mailListings(homes) {
  let messageHTML = listingsTable(homes);
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.MAILER_USER, // generated ethereal user
      pass: process.env.MAILER_PASS // generated ethereal password
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"JPorter Mailer" <jporter.mailer@gmail.com>', // sender address
    to: 'joshporter1@gmail.com', // list of receivers
    subject: 'New HUDHome Listings Available! 🏚🏠', // Subject line
    text: JSON.stringify(homes), // plain text body
    html: messageHTML // html body
  };
  // send mail
  transporter.sendMail(mailOptions, function (err, info) {
    if(err)
      console.log(err)
    else
      console.log(info);
  });
}

module.exports = {
  extractListings
};
