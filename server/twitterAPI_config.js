// Retrieves the keys required by the Standard Search Twitter API
// Uses dotenv package for management of environment variables

require('dotenv').config();

module.exports = {
  consumer_key:         process.env.CONSUMER_KEY,
  consumer_secret:      process.env.CONSUMER_SECRET,
  access_token:         process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
  // timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  // strictSSL:            true      // optional - requires SSL certificates to be valid.
}