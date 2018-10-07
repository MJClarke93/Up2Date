var twitterAPI_config = require('./twitterAPI_config');
var Twit = require('twit');
var u = require("./utils");

function twitter_conn() {
    // Retrieving consumer_key, consumer_secret, access_token and access_token_secret
    var T = new Twit(twitterAPI_config);
    return T
}

function twitter_retrieve(T, keyword, callback = (results) => {}) {
    T.get('search/tweets', { q: keyword, count: 5, lang: 'en', result_type: 'popular'}, function(err, data, response) {
        var tweet_array = [];
        var tweets = data.statuses;
        console.log(JSON.stringify(data));
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

// T = twitter_conn();
// twitter_retrieve(T);