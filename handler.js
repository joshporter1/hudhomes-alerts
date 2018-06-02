'use strict';
const request = require('axios');
const {extractListings} = require('./helpers');

module.exports.gethudhomes = (event, context, callback) => {
  let base_uri = 'https://www.hudhomestore.com/Listing/PropertySearchResult.aspx'
  let params = {
    zipCode: undefined,
    city: 'Baltimore',
    county: undefined,
    sState: 'MD',
    fromPrice: 0,
    toPrice: 0,
    fCaseNumber: undefined,
    bed: 0,
    bath: 0,
    street: undefined,
    buyerType: 'Good Neighbor Next Door',
    specialProgram: undefined,
    Status: 0,
    indoorAmenities: undefined,
    outdoorAmenities: undefined,
    housingType: undefined,
    stories: undefined,
    parking: undefined,
    propertyAge: undefined,
    OrderbyName: 'SCASENUMBER',
    OrderbyValue: 'ASC',
    sPageSize: 10,
    pageId: 1,
    sLanguage: 'ENGLISH'
  }

  request(base_uri, {params: params})
    .then(({data}) => {
      const homes = extractListings(data);
      callback(null, {homes});
    })
    .catch(callback);
};
