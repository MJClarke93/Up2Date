var mongoose = require("mongoose");
var bcrypt = require('bcryptjs');


var verbose = true; // Whether or not to display ALL debug messages, or just 'major' ones
const DEFAULT_TAG = ["News"]; // The default tags that a new user is subscribed to
var SALTROUNDS = 10; // Rounds of salting used by Bcrypt


function say(text, bypass=false) {
// Blocks printing if verbose is set to false, unless specificially told to bypass
  if (verbose || bypass) {console.log("\x1b[33m%s\x1b[0m","DB: "+text);}
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


// USERCREDS collection stores usernames and passwords

function db_make_creds() {
// Creates the usercreds schema and model; returns the model
  say("Creating usercreds model...");
  var usercreds_schema = new mongoose.Schema({
    username: {type: String, index: true},
    password: String,
  });
  var usercreds_model = mongoose.model("usercreds", usercreds_schema);
  say("Finished creating usercreds model.");
  return usercreds_model
}


// USERPREFS collection stores user's preferences, including their subscribed tags

function db_make_prefs() {
// Creates the userprefs schema and model; returns the model
  say("Creating userprefs model...");
  var userprefs_schema = new mongoose.Schema({
    username: {type: String, index: true},
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
// Finds first match to Mongoose 'query' against collection associated with 'model' and returns results and if it was successful via callback
  say("Searching "+model.collection.collectionName+" with query "+JSON.stringify(query)+" ...");
  model.findOne(query, (err, docs) => {
    if (err) {
      say("Search error: "+err, true);
      callback(null, false);
    } else {
      say("Search for "+JSON.stringify(query)+" in "+model.collection.collectionName+" complete.");
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
  db_find(models.userprefs, {username: username}, (doca, succa) => {
    if (succa) {
      if (doca) {
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
    //adding a blank row creates enough buffer to prevent it (and simultaneously checks that it's working)
    db_drop(models);
    db_add(creds,{username: "", password: ""});
    db_add(prefs,{username: "", tags: [""]});
  }
  say("Database environment prepared.", true)
  return models
}


function user_add(models, username, password, callback = (success, errmsg)=>{}) {
// Adds a new user to the database (all collections); returns whether it was successful and the errormsg if not via callback
// Note that trying to add a user that already exists will result in {success = false}
// Params: models   - the object of model objects associated with the database, as generated by user_db
//         username - the username of the user you want to add
//         password - the plain-text password of the user you want to add; is hashed before storage
//         callback - a callback function to run after the user has been added; it passes:
//                    success - whether or not the transaction was successful
//                    errmsg  - the type of error that occured, or "No error" if none
  say("Adding new user "+username+"...")
  db_exists(models, username, (result, succa)=>{
    if (!result && succa) {
      say("Hashing "+username+"'s password...");
      bcrypt.hash(password, SALTROUNDS, function(err, hash) {
        if (err) {
          say("Could not add "+username+" to the database due to a password hashing error: "+err, true);
          callback(false, "Server error");
        } else {
          say("Successfully hashed "+username+"'s password.");
          db_add(models.usercreds,{username: username, password: hash}, (succb)=>{
            db_add(models.userprefs,{username: username, tags: DEFAULT_TAG}, (succc)=>{
              if (succb && succc) {
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
// Checks if a user's credentials match the ones stored in the database (e.g. at log-in); returns if it matched, if it was successful, and error messages
// Note that 'result' is whether or not the credentials matched, and 'success' is for checking if a server error occured
// Params: models   - the object of model objects associated with the database, as generated by user_db
//         username - the username that you're checking for
//         password - the plain-text password that you want to compare
//         callback - a callback function to run after the check has occured; it passes:
//                    result  - whether or not the credentials match
//                    success - whether or not the check was completed successfully
//                    errmsg  - the type of error that occured, or "No error" if none
  say("Checking credentials for user "+username+"...");
  db_find(models.usercreds, {username: username}, (docs, success)=>{
    if (success) {
      if (docs) {
        say("Unhashing "+username+"'s password...");
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


function user_get_prefs(models, username, callback = (result, success, errmsg)=>{}) {
// Retrieves a user's preferences in full from the userprefs collection; returns the preferences, if it was successful, and any error messages
// Note that 'result' is the preferences, and 'success' is for checking if a server error occured
// Params: models   - the object of model objects associated with the database, as generated by user_db
//         username - the username that you're getting the preferences for
//         callback - a callback function to run after the preferences are retrieved; it passes:
//                    result  - the preferences object, if found
//                    success - whether or not the retrieval was completed successfully
//                    errmsg  - the type of error that occured, or "No error" if none
  say("Retrieving "+username+"'s preferences...");
  db_find(models.userprefs, {username: username}, (docs, succa)=>{
    if (succa) {
      if (docs) {
        say("Retrieved "+username+"'s preferences.", true);
        var d = docs[0];
        callback({tags: d.tags}, true, "No error");
      } else {
        say("Could not retrieve "+username+"'s preferences: username does not exist.", true);
        callback(null, false, "Username doesn't exist");
      }
    } else {
      say("Could not retrieve "+username+"'s preferences due to an error.", true);
      callback(null, false, "Server error");
    }
  });
}


function user_delete(models, username, callback = (success, errmsg)=>{}) {
// Deletes a username from the database (all collections); returns if it was successful, and any error messages
// Params: models   - the object of model objects associated with the database, as generated by user_db
//         username - the username you want to delete from the database
//         callback - a callback function to run after the username is deleted; it passes:
//                    success - whether or not the deletion was completed successfully
//                    errmsg  - the type of error that occured, or "No error" if none
  say("Deleting "+username+" from database...");
  db_delete(models.usercreds, {username: username}, (succa)=>{
    db_delete(models.userprefs, {username: username}, (succb)=>{
      if (succa && succb) {
        say("Successfully deleted "+username+" from database.", true);
        callback(true, "No error");
      } else {
        say("Could not delete "+username+" from database due to an error.", true);
        callback(false, "Server error");
      }
    });
  });
}


function user_update_creds(models, username, new_password, callback = (success, errmsg)=>{}) {
// Updates a user's credentials; returns if it was successful and any error messages
// Params: models       - the object of model objects associated with the database, as generated by user_db
//         username     - the username you want to change the associated password for
//         new_password - the user's plaintext new password; is hashed before insertion into database
//         callback     - a callback function to run after the password is updated; it passes:
//                      success - whether or not the update was completed successfully
//                      errmsg  - the type of error that occured, or "No error" if none
  say("Updating usercreds for "+username+"...");
  say("Hashing "+username+"'s new password...");
  bcrypt.hash(new_password, SALTROUNDS, function(err, hash) {
    if (err) {
      say("Could not update usercreds for "+username+" due to a password hashing error: "+err, true);
      callback(false, "Server error");
    } else {
      say("Successful hashed "+username+"'s new password.");
      db_update(models.usercreds, {username: username}, {password: hash}, (success) => {
        if (success) {
          say("Successfully updated usercreds for "+username+".");
          callback(true, "No error");
        } else {
          say("Could not update usercreds for "+username+" due to an error.");
          callback(false, "Server error");
        }
      });
    }
  });
}


function user_update_prefs(models, username, new_tags, callback = (success, errmsg)=>{}) {
// Updates a user's preferences; returns if it was successful and any error messages
// Params: models   - the object of model objects associated with the database, as generated by user_db
//         username - the username you want to change the associated preferences for
//         new_tags - the user's new subscription tags
//         callback - a callback function to run after the prefs are updated; it passes:
//                      success - whether or not the update was completed successfully
//                      errmsg  - the type of error that occured, or "No error" if none
  say("Updating userprefs for "+username+" with new data "+new_tags+"...");
  if (new_tags != [""]) {
    db_update(models.userprefs, {username: username}, {tags: new_tags}, (success) => {
      if (success) {
        say("Successfully updated userprefs for "+username+" with new data "+new_tags+".");
        callback(true, "No error");
      } else {
        say("Could not update userprefs for "+username+" due to an error.");
        callback(false, "Server error");
      }
    });
  } else {
    say("Could not update userprefs for "+username+", because there was no tags.")
    callback(false, "Server error");
  }
}


/* To check in mongo:
use Up2Date
db.usercreds.find()
db.userprefs.find()
*/

module.exports = {'user_db': user_db, 'user_add': user_add, 'user_check': user_check, 'user_get_prefs': user_get_prefs,
'user_delete': user_delete, 'user_update_creds': user_update_creds, 'user_update_prefs': user_update_prefs}
