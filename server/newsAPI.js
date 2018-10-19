var newsAPI_config = require('./newsAPI_config');
var NewsAPI = require('newsapi');
var u = require("./utils");

function news_conn() {
    const newsapi = new NewsAPI(newsAPI_config.newsAPI_key);
    return newsapi
}

function news_retrieve_topHeadlines(newsapi, keyword, callback = (results) => {}) {
    // To query /v2/top-headlines
    // All options passed to topHeadlines are optional, but you need to include at least one of them
    newsapi.v2.topHeadlines({
      // sources: 'bbc-news,the-verge',
      q: keyword,
      // category: 'business',
      language: 'en',
      //country: 'us',
      pageSize: 5
    }).then(response => {
      articles = response.articles;
      articles_array = [];
      for (var i = 0; i < articles.length; i++) {
        var news_object = {
          id: u.randomString(12),
          title: articles[i].title,
          content: articles[i].description,
          posted: articles[i].publishedAt,
          author: articles[i].author,
          source: articles[i].source.name,
          url: articles[i].url
        };
        articles_array.push(news_object);
      }
      callback(articles_array);
      /* response has the following format: {status: "ok", articles: [...]}*/
    });
}

function news_retrieve_everything(newsapi, keyword, callback = (results) => {}) {
    // To query /v2/everything
    // You must include at least one q, source, or domain
    newsapi.v2.everything({
      q: keyword,
      //sources: 'bbc-news,the-verge',
      //domains: 'bbc.co.uk, techcrunch.com',
      language: 'en',
      sortBy: 'relevancy',
      pageSize: 5
    }).then(response => {
      articles = response.articles;
      articles_array = [];
      for (var i = 0; i < articles.length; i++) {
        var news_object = {
          id: u.randomString(12),
          title: articles[i].title,
          content: articles[i].description,
          posted: articles[i].publishedAt,
          author: articles[i].author,
          source: articles[i].source.name,
          url: articles[i].url
        };
        articles_array.push(news_object);
      }
      callback(articles_array);
      /* response has the following format: {status: "ok",articles: [...]}*/
    });
}

function news_retrieve_sources(newsapi, keyword, callback = (results) => {}) {
    // To query sources
    // All options are optional
    newsapi.v2.sources({
      category: keyword,
      language: 'en',
      country: 'us'
    }).then(response => {
      sources = response.sources;
      sources_array = [];
      for (var i = 0; i < articles.length; i++) {
        articles_array.push(sources[i]);
      }
      callback(sources_array);
      /* response has the following format: {status: "ok",sources: [...]}*/
    });
    console.log('Retrieved NewsAPI Sources');
}

module.exports = {'news_conn':news_conn,'news_retrieve_topHeadlines':news_retrieve_topHeadlines,'news_retrieve_everything':news_retrieve_everything,'news_retrieve_sources':news_retrieve_sources}