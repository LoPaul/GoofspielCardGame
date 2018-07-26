"use strict";

// Defines helper functions for saving and getting tweets, using the database `db`
module.exports = function makeDataHelpers(knex) {
  return {

    // get or add user
    getUsers: function(cb) {
      knex
        .select("*")
        .from("users")
        .then(results => cb(null, results))
        .catch(err => cb(err, null));
    },

    // get by username
    getUser: function(username, cb) {
      knex
        .select("*")
        .from("users")
        .where({name: username})
        .then(results => cb(null, results))
        .catch(err => cb(err, null));
    },

    // insert user *** no check for existing **
    insertUser: function(username, cb) {
      knex("users")
        .insert([{name: username}])
        .then(results => cb(null, results))
        .catch(err => cb(err, null));
    }
  };
}