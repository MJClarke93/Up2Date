// Requires secret keys (i.e. consumer_key, consumer_secret, access_token and access_token_secret)
var twitterAPI_config = require('./twitterAPI_config');
var Twit = require('twit');
var u = require("./utils");

function twitter_conn() {
    // Establishes a connection with the Twitter Standard Search API and returns connection object T
    var T = new Twit(twitterAPI_config);
    return T
}

function twitter_retrieve(T, keyword, callback = (results) => {}) {
    // Uses Twitter Standard Search API and Twit npm package to search for five popular tweets in English based on a keyword
    // T is the connection object
    // keyword reflects the user's interest
    T.get('search/tweets', { q: keyword, count: 5, lang: 'en', result_type: 'popular'}, function(err, data, response) {
        var tweet_array = [];
        var tweets = data.statuses;
        for (var i = 0; i < tweets.length; i++) {
            tweet_object = {
                id: u.randomString(12),
                title: "Twitter Post",
                author: tweets[i].user.name,
                content: tweets[i].text,
                posted: tweets[i].created_at,
                source: "Twitter",
                url: null};
            tweet_array.push(tweet_object);
        }
        callback(tweet_array);
    });
}

module.exports = {'twitter_conn':twitter_conn,'twitter_retrieve':twitter_retrieve}