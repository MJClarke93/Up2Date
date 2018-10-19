// Retrieves key required by News API
// Uses dotenv package for management of environment variables

require('dotenv').config();

module.exports = {
  newsAPI_key:           process.env.NEWSAPI_KEY
}