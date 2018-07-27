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

    fetchUser: function(username, cb) {
      let query = {name: username};
      knex
        .select("*")
        .from("users")
        .where(query)
        .then(results => {
          if (results.length < 1)
          knex("users").insert([query])
              .then(results => this.getUser(username, cb))
          else
            cb(null, results)
          })
        .catch(err => cb(err, null))
    }


  }
}