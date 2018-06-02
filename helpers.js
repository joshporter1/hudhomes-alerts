const cheerio = require('cheerio');
const moment = require('moment');
const nodemailer = require('nodemailer');

function extractListings(html) {
  const $ = cheerio.load(html);
  const homeRows = $('#dgPropertyList tbody tr.FormTableRow, #dgPropertyList tbody tr.FormTableRowAlt');

  const homes = [];
  homeRows.each((i, el) => {
    // scrape necessary data from each row and push to array
    // grab bidOpenDate. listings page does not have list date.
    // new listings usually have a bidOpenDate 7 days after listing date
    let bidOpenDate = $(el).children('td:nth-child(9)').first().text().trim();
    let isNew = moment(bidOpenDate).subtract(7, 'days').isSame(moment(), 'day')
    // only add "new" homes
    if (isNew) {
      // TODO: scrape these better..
      let id = $(el).children('td:nth-child(2)').first().text().trim();
      let address = $($(el).children('td:nth-child(3)').first().html().replace(/<br>/g, ' ')).text().trim()
      let price = $(el).children('td:nth-child(4)').first().text().trim();
      let beds = $(el).children('td:nth-child(6)').first().text().trim();
      let baths = $(el).children('td:nth-child(7)').first().text().trim();
      let status = $(el).find('td:nth-child(5) img').first().attr('title');
      let link = $(el).find('td:nth-child(2) a').first().attr('onclick').replace('top.location.href=\'', '').replace('\';', '');
      homes.push({
        address,
        price,
        beds,
        baths,
        bidOpenDate,
        status,
        link
      })
    }
  });
  // fire off email
  mailListings(homes);
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
        <th style="vertical-align: bottom; ${cellStyle}">Bid Open Date</th>
        <th style="vertical-align: bottom; ${cellStyle}">Status</th>
        <th style="vertical-align: bottom; ${cellStyle}"></th>
      </tr>
    </thead>
    <tbody>`
  homes.forEach((home) => {
    let link = home.link
    delete home.link
    html += `<tr>`
    Object.values(home).forEach((val) => {
      html += `<td style="vertical-align: top; ${cellStyle}">${val}</td>`
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

  // TODO: Set up a real mailer

  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: account.user, // generated ethereal user
        pass: account.pass // generated ethereal password
      }
    });

    // setup email data with unicode symbols
    let mailOptions = {
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: 'joshporter1@gmail.com', // list of receivers
      subject: 'New HUDHome Listings Available! 🏚🏠', // Subject line
      text: JSON.stringify(homes), // plain text body
      html: messageHTML // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
  });

}

module.exports = {
  extractListings
};
