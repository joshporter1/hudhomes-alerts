'use strict';
const request = require('axios');
const {extractListings} = require('./helpers');

module.exports.gethudhomes = (event, context, callback) => {
  let base_uri = 'https://www.hudhomestore.com/Listing/PropertySearchResult.aspx'
  let params = '?&zipCode=&city=Baltimore&county=&sState=MD&fromPrice=0&toPrice=0&fCaseNumber=&bed=0&bath=0&street=&buyerType=Good%20Neighbor%20Next%20Door&specialProgram=&Status=0&indoorAmenities=&outdoorAmenities=&housingType=&stories=&parking=&propertyAge=&OrderbyName=SCASENUMBER&OrderbyValue=ASC&sPageSize=10&pageId=1&sLanguage=ENGLISH#'
  let uri = base_uri + params

  request(uri)
    .then(({data}) => {
      const homes = extractListings(data);
      callback(null, {homes});
    })
    .catch(callback);
};
