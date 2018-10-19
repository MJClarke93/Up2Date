var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http, { origins: "*:*" });
var bodyParser = require("body-parser");
var cors = require("cors");
var twitter = require("./twitterAPI");
var news = require("./newsAPI");
var u = require("./utils");

function say(text) {
  console.log("\x1b[31;1m%s\x1b[0m", "Server: " + text);
}

// Connects to the MongoDB database
var db = require("./db");
var m = db.user_db(true, true);


// --------------------------------------------------------
// SOCKET.IO
// --------------------------------------------------------

var T = twitter.twitter_conn();
var newsapi = news.news_conn();

io.on("connection", function(socket) {
  say("Socket connection established.");
  // Delivers news posts on request
  socket.on("loadPosts", data => {
    db.user_get_prefs(m, data.username, (result) => {
      var tags = result.tags;
      for (var i=0; i<tags.length; i++) {
        var q_string = "";
        var string_part = "";
        if (i == tags.length-1) {
          string_part = tags[i];
        } else {
          string_part = tags[i]+" OR ";
        }
        q_string = q_string.concat(string_part);
      }
      twitter.twitter_retrieve(T, q_string, results_t => {
        news.news_retrieve_everything(newsapi, q_string, results_n => {
          results = [...results_t, ...results_n];
          shuffled = u.randomSubset(results, results.length);
          socket.emit("receivePosts", shuffled);
        });
      });
    });
  });
});


// --------------------------------------------------------
// EXPRESS
// --------------------------------------------------------

// Enables body-parser to parse JSON streams
jsonparser = bodyParser.json();

// Enable CORS on server
app.use(cors());

// Log connections
app.use((req, res, next) => {
  say("Recieved " +req.method +" request to " +req.originalUrl +" from " +req.headers.host +".");
  next();
});

// -----------------
// GET-ing resources
// -----------------

// Reponds to GET at "/api" by returning a user's information
app.get("/api", (req, res) => {
  // Not currently implemented, as it isn't necessary
  res.sendStatus(501);
});

// Reponds to GET at "/api/creds" by returning a user's credentials
app.get("/api/creds", (req, res) => {
  // Not currently implemented, as it isn't necessary
  res.sendStatus(501);
});

// Responds to GET at "/api/prefs" by returning a user's preferences
app.get("/api/prefs/:username", jsonparser, (req, res) => {
  var username = req.params.username;
  if (username) {
    db.user_get_prefs(m, username, (result, success, errmsg) => {
      if (success) {
        res.json({ success: true, error: null, result: result });
      } else {
        res.json({ success: false, error: errmsg, result: null });
      }
    });
  } else {
    res.sendStatus(400);
  }
});

// ------------------
// POST-ing resources
// ------------------

// Responds to POST at "/api" by adding a user to the database
app.post("/api", jsonparser, (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  if (username && password) {
    db.user_add(m, username, password, (success, errmsg) => {
      if (success) {
        res.json({ success: true, error: null });
      } else {
        res.json({ success: false, error: errmsg });
      }
    });
  } else {
    res.sendStatus(400);
  }
});

// Responds to POST at "/api/creds" by checking if a user's credentials are correct
app.post("/api/creds", jsonparser, (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  if (username && password) {
    db.user_check(m, username, password, (result, success, errmsg) => {
      if (success) {
        res.json({ success: true, error: null, result: result });
      } else {
        res.json({ success: false, error: errmsg, result: null });
      }
    });
  } else {
    res.sendStatus(400);
  }
});

// Reponds to POST at "/api/prefs" by checking if a user's preferences match those in the request
app.get("/api/prefs", (req, res) => {
  // Not implemented, as it isn't necessary
  res.sendStatus(501);
});

// --------------------
// DELETE-ing resources
// --------------------

// Responds to DELETE at "/api" and similar by deleting the user from the database
app.delete(["/api", "/api/creds", "/api/prefs"], jsonparser, (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  if (username && password) {
    db.user_check(m, username, password, (result, success, errmsg) => {
      if (success) {
        if (result) {
          db.user_delete(m, username, (del_success, del_errmsg) => {
            if (del_success) {
              res.json({ success: true, error: null, result: result });
            } else {
              res.json({ success: false, error: del_errmsg, result: result });
            }
          });
        } else {
          res.json({success: false,error: "Provided username and password did not match"});
        }
      } else {
        res.json({ success: false, error: errmsg });
      }
    });
  } else {
    res.sendStatus(400);
  }
});

// --------------------------
// PUT-ing (update) resources
// --------------------------

// Reponds to PUT at "/api"
app.put("/api", (req, res) => {
  // Not implemented, as PUT requests should target creds or prefs in particular
  res.sendStatus(501);
});

// Responds to PUT requests at "/api/creds" by updating the user's password
app.put("/api/creds", jsonparser, (req, res) => {
  username = req.body.username;
  old_password = req.body.password;
  new_password = req.body.new_password;
  if (username && old_password && new_password) {
    db.user_check(m, username, old_password, (result, success, errmsg) => {
      if (success) {
        if (result) {
          db.user_update_creds(m, username, new_password, (success_new, errmsg_new) => {
              if (success_new) {
                res.json({ success: true, error: null, result: result });
              } else {
                res.json({ success: false, error: errmsg_new, result: result });
              }
            }
          );
        } else {
          res.send({success: false, error: "Provided username and password did not match"});
        }
      } else {
        res.send({ success: false, error: errmsg });
      }
    });
  } else {
    res.sendStatus(400);
  }
});

// Responses to PUT requests at "/api/prefs" by updating the user's preferences
app.put("/api/prefs", jsonparser, (req, res) => {
  username = req.body.username;
  new_tags = req.body.tags;
  if (username && new_tags) {
    db.user_update_prefs(m, username, new_tags, (success, errmsg) => {
      if (success) {
        res.send({ success: true, error: null });
      } else {
        res.send({ success: false, error: errmsg });
      }
    });
  } else {
    res.sendStatus(400);
  }
});


// -----
// OTHER
// -----

// Responds to requests at "/", confirming it's the server root
app.all("/", (req, res) => {
  res.send("This is the server root.");
});

// Connections to unknown locations return a 404
app.all("*", (req, res) => {
  res.sendStatus(404);
});

// Makes the app listen at http://localhost:3001
http.listen(3001, () => {
  say("Express server established and listening to http://localhost:3001.");
});
