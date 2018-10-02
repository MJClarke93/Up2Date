var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bcrypt = require('bcryptjs');
var saltRounds = 10;
var verbose = true;


function say(text, bypass=false) {
// Blocks printing if verbose is set to false, unless specificially told to bypass
  if (verbose || bypass) {console.log(text);}
}


function db_start() {
// Establishes connection to MongoDB using Mongoose; returns a connection object
  say("Connecting to database...", true);
  mongoose.connect("mongodb://localhost:27017/Up2Date", { useNewUrlParser: true }, (err) => {
    if (err) {
      say("Database connection error: "+err, true);
    } else {
      say("Database connection successful.", true);
    }
  });
  mongoose.Promise = global.Promise;
  return mongoose.connection
}


function db_make_creds() {
// Creates the usercreds schema and model; returns the model
  say("Creating usercreds model...");
  var usercreds_schema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
  });
  var usercreds_model = mongoose.model("usercreds", usercreds_schema);
  say("Finished creating usercreds model.");
  return usercreds_model
}


function db_make_prefs() {
// Creates the userprefs schema and model; returns the model
  say("Creating userprefs model...");
  var userprefs_schema = new mongoose.Schema({
    username: String,
    tags: [String],
  });
  var userprefs_model = mongoose.model("userprefs", userprefs_schema);
  say("Finished creating userprefs model.");
  return userprefs_model
}


function db_drop(models) {
// Drops all of the collections associated with each model in models; returns true on completion
  Object.keys(models).forEach((key) => {
    var mname = models[key].collection.collectionName;
    say("Dropping data from collection "+mname+"...");
    x = models[key].collection.drop();
    say("Dropped collection "+mname+".");
  });
  return true
}


function db_add(model, instance, callback = (success)=>{}) {
// Adds 'instance' to collection associated with 'model' and returns if it was successful via callback
  say("Inserting data "+JSON.stringify(instance)+" into collection "+model.collection.collectionName+"...");
  new_instance = new model(instance);
  new_instance.save((err) => {
    if (err) {
      say("Data insertion error: "+err, true);
      callback(false);
    } else {
      say("Data "+JSON.stringify(instance)+" inserted into "+model.collection.collectionName+" successfully.");
      callback(true);
    }
  });
}


function db_find(model, query, callback = (docs, success)=>{}) {
// Finds matches to Mongoose 'query' against collection associated with 'model' and returns results and if it was successful via callback
  say("Searching "+model.collection.collectionName+" with query "+JSON.stringify(query)+" ...");
  model.find(query, (err, docs) => {
    if (err) {
      say("Search error: "+err, true);
      callback(null, false);
    } else {
      say("Search for "+JSON.stringify(query)+" in "+model.collection.collectionName+" complete with "+docs.length+" result(s).");
      callback(docs, true);
    }
  });
}


function db_delete(model, query, callback = (success)=>{}) {
// Deletes the first match to Mongoose 'query' against collection associated with 'model' and returns if it was successful via callback
  say("Deleting from "+model.collection.collectionName+" via query "+JSON.stringify(query)+" ...");
  model.deleteOne(query, (err) => {
    if (err) {
      say("Deletion error: "+err, true);
      callback(false);
    } else {
      say("Record matching "+JSON.stringify(query)+" deleted from "+model.collection.collectionName+".");
      callback(true);
    }
  });
}


function db_update(model, query, instance, callback = (success)=>{}) {
// Applies update 'instance' to the first match to Mongoose 'query' against collection associated with 'model' and returns if it was successful via callback
  say("Updating "+model.collection.collectionName+" via query "+JSON.stringify(query)+" with data "+JSON.stringify(instance)+" ...");
  model.updateOne(query, instance, (err) => {
    if (err) {
      say("Update error: "+err, true);
      callback(false);
    } else {
      say("Record matching "+JSON.stringify(query)+" in "+model.collection.collectionName+" updated with "+JSON.stringify(instance)+".");
      callback(true);
    }
  });
}


function db_exists(models, username, callback = (result, success)=>{}) {
// Checks if a 'username' exists in both usercreds and userprefs, returning if it exists and whether the operation was successful via callback
  say("Checking if user "+username+" exists...")
  db_find(models.usercreds, {username: username}, (doca, succa) => {
    db_find(models.userprefs, {username: username}, (docb, succb) => {
      if (succa && succb) {
        if (doca.length >= 1 && docb.length >= 1) {
          say("User "+username+" found.")
          callback(true, true);
        } else {
          say("User "+username+" not found.")
          callback(false, true);
        }
      } else {
        say("Could not determine if user "+username+" exists due to error.")
        callback(null, false);
      }
    });
  });
}


// ----------------------------------------------------------------------------------------------------------------------------

function user_db(do_drop = false, verb = false) {
// Establishes connection to database, defines models and drops old data if necessary; returns an object of model objects
// Params: do_drop - if true, drops all of the existing collections when the server starts
//         verb    - if true, prints all server-side debug statements, otherwise it only prints important ones
  verbose = verb;
  db_start();
  creds = db_make_creds();
  prefs = db_make_prefs();
  models = {'usercreds': creds, 'userprefs': prefs};
  if (do_drop) {
    //db_drop not truly synchronous; can drop fresh data if executed before connection is live, with data ready to insert
    //adding a blank row creates enough buffer to prevent it; investigate and fix this behavior later
    db_drop(models);
    db_add(creds,{username: "", email: "", password: ""});
    db_add(prefs,{username: "", tags: [""]});
  }
  say("Database environment prepared.", true)
  return models
}


function user_add(models, username, email, password, callback = (success, errmsg)=>{}) {
// Adds a new user to the database (all collections); returns whether it was successful and the errormsg if not via callback
// Note that trying to add a user that already exists will result in {success = false}
// Params: models   - the object of model objects associated with the database, as generated by user_db
//         username - the username of the user you want to add
//         password - the plain-text password of the user you want to add; is hashed before storage
//         email    - the email of the user you want to add
//         callback - a callback function to run after the user has been added; it passes:
//                    success - whether or not the transaction was successful
//                    errmsg  - the type of error that occured, or "No error" if none
  db_exists(models, username, (result, succa)=>{
    if (!result && succa) {
      say("Hashing"+username+"'s password...");
      bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) {
          say("Could not add "+username+" to the database due to a password hashing error: "+err, true);
          callback(false, "Server error");
        } else {
          say("Successfully hashed "+username+"'s password.");
          db_add(models.usercreds,{username: username, email: email, password: hash}, (succb)=>{
            db_add(models.userprefs,{username: username, tags: [""]}, (succc)=>{
              if (succa && succb) {
                say("Successfully added user "+username+" to the database.", true)
                callback(true, "No error");
              } else {
                say("Could not add "+username+" to the database.", true)
                callback(false, "Server error");
              }
            });
          });
        }
      });
    } else {
      if (!succa) {
        say("Could not add "+username+" to the database due to an error.", true)
        callback(false, "Server error");
      } else {
        say("Could not add "+username+" to the database because user already exists.", true)
        callback(false, "Username already exists");
      }
    }
  });
}


function user_check(models, username, password, callback = (result, success, errmsg)=>{}) {
// Checks if a user's credentials match the ones stored in the database (e.g. at log-in)
// Note that 'result' is whether or not the credentials matched, and 'success' is for checking if a server error occured
// Params: models   - the object of model objects associated with the database, as generated by user_db
//         username - the username that you're checking for
//         password - the plain-text password that you want to compare
//         callback - a callback function to run after the check has occured; it passes:
//                    result  - whether or not the credentials match
//                    success - whether or not the check was completed successfully
//                    errmsg  - the type of error that occured, or "No error" if none
  db_find(models.usercreds, {username: username}, (docs, success)=>{
    if (success) {
      if (docs.length >= 1) {
        say("Unhashing"+username+"'s password...");
        var hash = docs[0].password;
        bcrypt.compare(password, hash, function(err, res) {
          if (err) {
            say("Could not verify "+username+"'s credentials due to a password hashing error: "+err, true)
            callback(null, false, "Server error");
          } else {
            say("Successfully unhashed "+username+"'s password.");
            if (res === true) {
              say("Verified "+username+"'s credentials.", true)
              callback(true, true, "No error");
            } else {
              say("Denied "+username+"'s credentials: password incorrect.", true)
              callback(false, true, "No error");
            }
          }
        });
      } else {
        say("Denied "+username+"'s credentials: username does not exist.", true)
        callback(false, true, "No error");
      }
    } else {
      say("Could not verify "+username+"'s credentials due to an error.", true)
      callback(null, false, "Server error");
    }
  });
}


/* To check in mongo:
use Up2Date
db.usercreds.find()
db.userprefs.find()
*/

module.exports = {'user_db': user_db, 'user_add': user_add, 'user_check': user_check}