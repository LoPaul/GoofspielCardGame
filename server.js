"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();
const cookieSession = require("cookie-session");

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

// Serializer
// var s = require("serialijse");
// //var s = require("./index.js");
// var assert = require("assert");

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");
const DataHelpers = require("./data-helpers.js")(knex);

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

// Cookie Session
app.use(cookieSession({
  name: "session",
  keys: ["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"]
}));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public/"));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));

// Home page
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }
  res.render("index");
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/");
    return;
  }
  res.render("login");
});

app.get("/games/:id", (req, res) => {
  var localVars= {gameID: req.params.id,
                  username: req.session.user_id};
  res.render("games_show", localVars);
});

app.post("/login", (req, res) => {
  const user = req.body.username;
  req.session.user_id = user;
  DataHelpers.fetchUser(user, (err, result) => {
    if(err) { throw err };
    GameState.matchParticipant(user);
    res.redirect("/");
  });
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});

app.get("/gs", (req, res) => {
  var localVars= {gameID: req.params.id};
  res.json(currentGameState);
});

app.post("/gs/", (req, res) => {
  console.log(req.body);
  currentGameState = req.body;
  res.end();
});

// Game State Class to capture state context
class GameState {
  constructor() {
    this.game_id = GameState.all().length+1;
    this.initialize();
    GameState.all().push(this);
  };
  initialize() {
    this.timestamp = new Date();
    this.turnsP1 = [];
    this.turnsP2 = [];

    this.prizeCards = Card.randomizeCardsFor(Card.getHearts());
  }
  addParticipant(userName) { 
    if(this._player1 === undefined) {
      this._player1 = userName
    } else { 
      this._player2 = userName }
    return this
  };
  needParticipants() { return this.participants.length < 2 }
  hasParticipant(userName) { return this._player1 === userName || this._player2 === userName }

  get prizeCards() { this._prizeCards };
  set prizeCards(cards) { this._prizeCards = cards };
  get turnsP1() { this._turnsP1};
  set turnsP1(cards) { this._turnsP1 = cards };
  get turnsP2() { this._turnsP2};
  set turnsP2(cards) { this._turnsP2 = cards };
  participants()  { return [this._player1, this.player2] };

  static matchParticipant(userName) {
    let result = this.all().find(each => each.needParticipants());
    if (result === undefined) { result = new GameState() };
    result.addParticipant(userName);
    return result;
  }
  userAndTurnHistories() {
    let turns = Math.min(this._turnsP1.length, this._turnsP2.length, 12) + 1;
    return {  turnHistory: [...Array(turns).keys()]
        .map(i => { return {  "player1": this._turnsP1.length <= i ? this._turnsP1[i] : undefined,
                              "player2": this._turnsP2.length <= i ? this._turnsP2[i] : undefined,
                              "prizeCard": this._prizeCards[i]}}),
              player1: this._player1,
              player2: this._player2
    }
  }
  static allParticipatingFor(username) {
    this.all().filter(each => each.hasParticipant(userName))
  }
  static all() { 
      if (this._all === undefined)
        this._all = [];
      return this._all }
}

// Card class represents deck of cards
class Card {
  // static cards = [];
  static getAllCards() {
    if (this._cards === undefined)
      this.initializeCards();
    return this._cards
  };
  static randomizeCardsFor(cards) {
    var results = [];
    do {
      let num = Math.floor(Math.random() * cards.length);
      results.push(cards.splice(num, 1)[0]);
    } while(cards.length > 0)
    return results;
  }
  static initializeCards() {
    var result = [];
    ['Spade', 'Heart', 'Club', 'Diamond'].forEach(mySuit => {
      ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'].forEach (myName => {
        result.push(new Card(myName, mySuit))
      })
    });
    this._cards = result;
  };
  static allCards() { return cards };
  static getSuit(aSuit) { return this.getAllCards().filter(each => each.suit == aSuit) };
  static getHearts() { return this.getSuit("Heart") };
  static getSpades() { return this.getSuit("Spade") };
  static getClubs() { return this.getSuit("Club") };
  static getDiamonds() { return this.getSuit("Diamond") };

  constructor(name, suit) {
    this.name = name;
    this.suit = suit;
  };
}



GameState.matchParticipant("Joey");
console.log("gamestate", GameState.all()[0]);
console.log(GameState.all()[0].userAndTurnHistories());

console.log("FetchUser", fetchUser("Mary"));
DataHelpers.getUsers((x, result) => console.log(result));


function fetchUser(username) {
  DataHelpers.fetchUser(username, (err, result) => {
    if(err) { throw err };
    return result;
  });
};
