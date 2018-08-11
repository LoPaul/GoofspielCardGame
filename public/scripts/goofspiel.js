$(document).ready(function () {
    // thisUser: username as a String
    // gameID: game ID as a string

    // Canvas dimensions
    var canvas = document.getElementById("Goofspiel");
    canvas.width = 1600;
    canvas.height = 900;

    canvasTop = canvas.offsetTop;
    canvasLeft = canvas.offsetLeft;
    var ctx = canvas.getContext("2d");

    var colorThemePrimary = "#B63546";
    var colorThemeSecondary = "#D9CAB3";
    var winColor = "#5BD22E";
    var loseColor = "#FF0033";
    var tieColor = "#CBA249";
    var textColor = "#000000";

    ctx.fillStyle = colorThemePrimary;
    ctx.strokeStyle = colorThemeSecondary;

    class Card {
        // static cards = [];
        static getAllCards() {
            if (!this._cards) this.initializeCards();
            return this._cards
        };
        static initializeCards() {
            var result = [];
            ['Spade', 'Heart', 'Club', 'Diamond'].forEach(mySuit => {
                ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'].forEach((myName, index) => {
                    result.push(new Card(myName, mySuit, index + 1))
                })
            });
            this._cards = result;
        };
        static fromObject(object) { return this.allCards().find(each => object.name === each.name && object.suit === each.suit) };
        static fromObjects(collection) { return collection.map(each => this.fromObject(each)) };
        static allCards() { return this._cards };
        static getSuit(aSuit) { return this.getAllCards().filter(each => each.suit === aSuit) };
        static getHearts() { return this.getSuit("Heart") };
        static getSpades() { return this.getSuit("Spade") };
        static getClubs() { return this.getSuit("Club") };
        static getDiamonds() { return this.getSuit("Diamond") };
        static getCardFor(name, suit) { return this.allCards().find(each => each.name === name && each.suit === suit) }
        static width() { return 80 };
        static height() { return 120 };
        static dimensions() { return {x: this.width(), y: this.height()} }
        isSameAs(card) { return (card.name === this.name && card.suit === this.suit) }
        cardHolderForXY(xyPosition) { return new CardHolder(this, xyPosition) };
        imageFilename() { return `/images/png/${this.name}${this.suit}.png`};
        constructor(name, suit, number) {
            this.name = name;
            this.suit = suit;
            this.value = number;
        };
    }
    class CoveredCard extends Card {
        constructor() {
            super();
            this.name = "Unknown"
            this.suit = "Unknown"
            this.value = 0;
        }
        imageFilename() { return "/images/png/playingcardback.png" }
        static default() {
            if(this.myDefault === undefined) this.myDefault = new CoveredCard();
            return this.myDefault;
        }
    }

    class CardHolder {
        constructor(card, xyPos) {
            this.card = card;
            this.xyPos = xyPos;
            this.cardName = card.name;
            this.cardSuit = card.suit;
        }
        addOffset(offset, count) {
            this.xyPos = {  x: this.xyPos.x + Math.round((offset.x * count)),
                            y: this.xyPos.y + Math.round((offset.y * count)) };
            return this;
        }
        encompass(xPos, yPos) { return xPos > this.xyPos.x  && xPos < this.xyPos.x + Card.width() && 
                                        yPos > this.xyPos.y && yPos < this.xyPos.y + Card.height() }
    }

    class GoofspeilGameState {
        constructor(gameState, myUser) {
            this.player1 = gameState.player1;
            this.player2 = gameState.player2;
            this.turnHistory = gameState.turnHistory;
            this.currentUser = myUser;
            console.log("currentUser: ", [this.currentUser]);
            console.log("player1", [this.player1]);
            console.log("this.currentPlay == Player1", this.currentUser == player1)
            console.log("gameSate: ", gameState);
            this.initialize();
            console.log(TableMap.default())
        };
        initialize() {
            this.prizeCard = this.toCard(this.turnHistory[this.turnHistory.length - 1].prizeCard);
            this.currentPlayerKey = (this.currentUser === this.player1) ? "player1" : "player2";
            this.opponentPlayerKey = (this.currentUser === this.player1) ? "player2" : "player1";
            this.allMyCards = Card.getSuit(this.getPlayerSuit());
            this.myTurnHistory = this.turnHistory.map(turn => turn[this.currentPlayerKey]).filter(playedThisTurn => (playedThisTurn));
            this.opponentTurnHistory = this.turnHistory.map(turn => turn[this.opponentPlayerKey]).filter(playedThisTurn => (playedThisTurn));
            this.prizeDeckHistory = this.turnHistory.map(turn => turn['prizeCard']).filter(revealed => (revealed));
            this.myHand = this.allMyCards.filter(card => !myTurnHistory.find(played => card.isSameAs(played)));
            this.theirHand = 13 - this.opponentTurnHistory.length;
            this.prizeDeck = 13 - this.prizeDeckHistory.length;
            this.playerPlayed = this.toCard(this.turnHistory[this.turnHistory.length - 1][this.currentPlayerKey]);
            this.opponentPlayed = this.toCard(this.turnHistory[this.turnHistory.length - 1][this.opponentPlayerKey]);
            this.extractPrizeCards();
           }
        getOpponentPlayed() {
            if(this.opponentPlayed) 
                return this.playerPlayed ? this.opponentPlayed : CoveredCard.default()
            else
                return this.opponentPlayed }
        getPlayerSuit() { return this.currentPlayerKey === "player1" ? "Spade" : "Club"}
        static current() { return this.current };
        static setCurrent(gs) { this.current = gs };
        toCard(obj) { return obj ? Card.fromObject(obj) : obj }
        calculateScores() {
            var myScore1 = 0;
            var myScore2 = 0;
            this.turnHistory.forEach(function (turn) {
                if ((turn.prizeCard) && (turn.player1) && (turn.player2)) {
                    if (turn.player1.value > turn.player2.value) {
                        myScore1 += turn.prizeCard.value;
                    } else if (turn.player2.value > turn.player1.value) {
                        myScore2 += turn.prizeCard.value;
                    }
                    else return;
                }
            });
            this.score1 = myScore1;
            this.score2 = myScore2;
        }
        extractPrizeCards() {
            this.playerPrizeCards = [];
            this.opponentPrizeCards = [];
            this.turnHistory.forEach(turn => {
                if(turn.player1 !== undefined && turn.player2 !== undefined) {
                    if(turn[this.currentPlayerKey].value > turn[this.opponentPlayerKey].value) {
                        this.playerPrizeCards.push(turn.prizeCard)
                    }
                    if(turn[this.currentPlayerKey].value < turn[this.opponentPlayerKey].value) {
                        this.opponentPrizeCards.push(turn.prizeCard)
                    }
                }    
            })
        }
        renderOn(tableMap) {
            this.calculateScores();
            tableMap.renderPlayerCards(this.myHand);
            tableMap.renderOpponentCards([...Array(this.theirHand)].fill(CoveredCard.default()));
            tableMap.renderDeck(this.prizeDeck);
            tableMap.renderPrizeCard(this.prizeCard);
            tableMap.renderPlayerPlayedCard(this.playerPlayed);
            tableMap.renderOpponentPlayedCard(this.getOpponentPlayed());
            // console.log(this.getOpponentPlayed())
            tableMap.renderScoreboard(this.player1, this.player2, this.score1, this.score2);

            // tableMap.renderPlayerPrizeCards(this.playerPrizeCards);
        }
    }

    class TableMap {
        constructor(playerPos, opponentPos, deckPos, playerDiscardPos, opponentDiscardPos, prizeCardPos, prizeCardsPos, opponentPrizeCardsPos) {
            this.playerXY = playerPos;
            this.opponentXY = opponentPos;
            this.deckXY = deckPos;
            this.playerDiscardXY = playerDiscardPos;
            this.opponentDiscardXY = opponentDiscardPos;
            this.prizeCardXY = prizeCardPos;
            this.prizeCardsXY = prizeCardsPos;
            this.opponentPrizeCardsXY = opponentPrizeCardsPos;
            this.playerCardHolders = [];
        }
        static defaultMap() { return new TableMap({x: 210, y: 760}, {x: 400, y: 20}, {x: 880, y: 390}, {x: 495, y: 540}, {x: 1080, y: 220}, {x: 760, y: 390}) };
        static default() {
            if(!this._default) this._default = this.defaultMap();
            return this._default;
        }
        get cardPositions() { return this._cardPositions };
        set cardPositions(collection) { this._cardPositions = collection};
        addCardPositon(xyCord) { this.cardPositions().push(xyCord)};
        xPosToCenterFor(numberOfCards) { return Math.round((canvas.width - ((numberOfCards * Card.width()) + ((numberOfCards-1) * 20))) / 2) }
        renderDeck(count) { this.renderCards([...Array(count)].fill(CoveredCard.default()), this.deckXY, {x: -0.35, y: -0.35} )}

        renderPlayerPrizeCards(cards) { this.renderCards(cards, this.prizeCardXY.x, this.prizeCardXYy, { x: -0.35, y: -0.35 }) }

        renderPrizeCard(card) { this.renderCardWithOutline(card, this.prizeCardXY, 20) };
        renderPlayerPlayedCard(card) { this.renderCardWithOutline(card, this.playerDiscardXY, 20) }
        renderOpponentPlayedCard(card) { 
            // console.log("opponentCard", card);    
            this.renderCardWithOutline(card, this.opponentDiscardXY, 20) }
        renderPlayerCards(cards) { 
            this.playerCardHolders = this.renderCards(cards, {x: this.xPosToCenterFor(cards.length), y: this.playerXY.y}, { x: (Card.width() + 20), y: 0 }) };
        renderOpponentCards(cards) {
            var cardBackCards = cards.map(each => CoveredCard.default());
            this.renderCards(cardBackCards, {x: this.xPosToCenterFor(cards.length), y: this.opponentXY.y}, { x: (Card.width() + 20), y: 0 }) };
        renderCardWithOutline(card, initialPos, padding) {
            this.renderCard(card, initialPos, {x: 0, y: 0});
            this.renderCardOutline(initialPos, Card.dimensions(), padding) } 
        renderCard(card, initialPos, offset) { 
            // console.log("RenderCard", card, initialPos); 
            if(card !== undefined) return this.renderCards([card], initialPos, offset)[0] }
        renderCards(cards, initialPos, offset) { 
            // console.log("renderPlayerCards", cards, initialPos, offset)
            var cardHolders = cards.map((each, index) => each.cardHolderForXY(initialPos).addOffset(offset, index));
            cardHolders.forEach(cardHolder => this.renderCardHolder(cardHolder));
            return cardHolders;
        }
        renderCardHolder(cardHolder) {
            // console.log("Display image: ", cardHolder.xyPos.x, cardHolder.xyPos.y, Card.width(), Card.height())
            var img = new Image();
            img.src = cardHolder.card.imageFilename();
            ctx.drawImage(img, cardHolder.xyPos.x, cardHolder.xyPos.y, Card.width(), Card.height());
        }
        renderScoreboard(player1Name, player2Name, p1Score, p2Score) {
            var myFont = "20px Pacifico" || "20px cursive";
            this.renderBox(20, 325, 200, 50, colorThemePrimary, "SCORE", myFont, 85, 360, textColor);
            this.renderBox(20, 375, 133, 50, colorThemeSecondary, player1Name, myFont, 30, 405, textColor);
            this.renderBox(153, 375, 67, 50, colorThemeSecondary, p1Score, myFont, 187, 405, textColor); 
            this.renderBox(20, 425, 133, 50, colorThemeSecondary, player2Name, myFont, 30, 455, textColor);
            this.renderBox(153, 425, 67, 50, colorThemeSecondary, p2Score, myFont, 187, 455, textColor);
        }
        renderCardOutline(fromXY, dimensionsXY, padding) {
            ctx.beginPath();
            ctx.rect(fromXY.x - padding, fromXY.y - padding, dimensionsXY.x + (padding*2), dimensionsXY.y + (padding*2));
            ctx.strokeStyle = colorThemeSecondary;
            ctx.stroke();
            ctx.closePath();
        }
        renderBox(rectPosX, rectPosY, width, height, fillSyle, text, font, textPosX, textPosY, textColor) {
            ctx.beginPath();
            ctx.rect(rectPosX, rectPosY, width, height);
            ctx.fillStyle = fillSyle;
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.font = font;
            ctx.fillStyle = textColor;
            ctx.fillText(text, textPosX, textPosY);
            ctx.closePath();    
        }
    }
   
    function renderTest() {
        GoofspeilGameState.current.renderOn(TableMap.default());

    }


    // card specifications
    var cardNames = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];
    var cardValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    var playingCard = {
        width: 80,
        height: 120,
        backColor: colorThemePrimary,
        frontColor: colorThemeSecondary
    }

    var loaded;
    // properties extracted from gamestate
    var player1 = "Waiting ...";
    var player2 = "Waiting ...";
    var score1 = 0;
    var score2 = 0;
    var playerSuit = "Diamond";
    // turn histories
    var turnHistory = [];
    var myTurnHistory = [];
    var opponentTurnHistory = [];

    // stored as an array of cards
    var myHand = Card.getSuit(playerSuit);
    // stored as numbers for card rendering
    var theirHand = 13;
    var prizeDeck = 13;

    var myWinnings = Card.getHearts();
    var theirWinnings = Card.getHearts();

    // play area cards
    var prizeCard = {};
    var playerPlayed = {};
    var opponentPlayed = {};

    // card.top and card.left keys are for collision detection
    var playerHandCollision = [];
    var opponentHandCollision = [];

    // times for animated events
    var turnResolutionTime;
    var playerWonTurn = -1;
    // 0 -> lost, 1 -> won, 2 -> tie
    var matchResolutionTime;

    // polling server for new gamestate
    function poll() {
        $.ajax({
            method: "GET",
            url: "/gs/" + (gameID).toString()
        }).done((gs) => {
            loaded = window.performance.now();
            parseGameState(gs);
            // turnResolve();
        })
    }

    var intervalID;

    function doPoll() {
        intervalID = setInterval(poll, 5000);
    }

    $("canvas").on('click', function (event) {
        var mouseX = event.pageX - canvasLeft;
        var mouseY = event.pageY - canvasTop;
        console.log("currentUser", thisUser)
        console.log("MousePos", mouseX, mouseY)  // TEMP logging of mouse click
        console.log(globalGS);
        console.log(Card.getAllCards())
        console.log(Card.fromObject(
            {name: "3", suit: "Diamond", value: 3}) )
        if(!GoofspeilGameState.current.playerPlayed) {

            var tableMap = TableMap.default();
            console.log( tableMap.playerCardHolders)
            var selectedCardHolder = tableMap.playerCardHolders.find(cardHolder => cardHolder.encompass(mouseX, mouseY));
            if(selectedCardHolder) {
                $.ajax({
                    method: "POST",
                    url: "/gs/",
                    data: { gameid: gameID,
                            card: selectedCardHolder.card}
                }).done(function () {
                    console.log(`Played card:, ${selectedCardHolder.card}`)
                })
            }
        }   
        // playerHandCollision.forEach(function (card) {

        //     if (// mouseclick collision detection
        //         ((mouseX > card.left && mouseX < card.left + playingCard.width)
        //             && (mouseY > card.top && mouseY < card.top + playingCard.height))
        //         && // move validation, does not pass if move is illegal
        //         !playerPlayed && (player1 !== "Waiting ...") && (player2 !== "Waiting ...")) {
        //         var myData = {};
        //         myData.gameid = gameID;
        //         var cardData = {};
        //         cardData.name = card.name;
        //         cardData.suit = card.suit;
        //         myData.card = cardData;
        //         playerPlayed = cardData;
        //         $.ajax({
        //             method: "POST",
        //             url: "/gs/",
        //             data: myData
        //         }).done(function () {
        //             console.log(`Played card:, ${myData.card.name}, suit: ${myData.card.suit}`)
        //         })
        //     }
        // })
    })

    function rect(x, y, w, h, a) {
        // console.log("rect: ", x, y, w, h, a)
    }
    function fillText(text, x, y) {
    //     console.log("text", text, x, y)
    }
    // Renders the scoreboard
    function renderScoreBoard() {
        return ///////////*************** */
        var width = 200;
        var height = 150; // recommend value divisible by 3
        var xpos = 20;
        var ypos = canvas.height / 2 - height / 2;
        // SCORE rectangle
        ctx.beginPath();
        ctx.rect(xpos, ypos - height / 3, width, height / 3);
        rect(xpos, ypos - height / 3, width, height / 3, "**********");

        ctx.fillStyle = colorThemePrimary;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.font = "20px Pacifico" || "20px cursive";
        ctx.fillStyle = colorThemeSecondary;
        ctx.fillText("SCORE", xpos + width / 3, ypos - height / 7);
        fillText("SCORE", xpos + width / 3, ypos - height / 7);
        ctx.closePath();
        // Player 1 name rectangle
        ctx.beginPath();
        ctx.rect(xpos, ypos, width / 3 * 2, height / 3);
        rect(xpos, ypos, width / 3 * 2, height / 3);
        ctx.fillStyle = colorThemeSecondary;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.font = "20px Pacifico" || "20px cursive";
        ctx.fillStyle = textColor;
        ctx.fillText(player1, xpos + 10, ypos + 30);
        fillText(player1, xpos + 10, ypos + 30);
        ctx.closePath();
        // Player 1 score rectangle
        ctx.beginPath();
        ctx.rect(xpos + width / 3 * 2, ypos, width / 3, height / 3);
        rect(xpos + width / 3 * 2, ypos, width / 3, height / 3);
        ctx.fillStyle = colorThemeSecondary;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.font = "20px Pacifico" || "20px cursive";
        ctx.fillStyle = textColor;
        ctx.fillText(score1, xpos + 5 * width / 6, ypos + 30);
        fillText(score1, xpos + 5 * width / 6, ypos + 30);
        ctx.closePath();
        // Player 2 name rectangle
        ctx.beginPath();
        ctx.rect(xpos, ypos + height / 3, width / 3 * 2, height / 3);
        rect(xpos, ypos + height / 3, width / 3 * 2, height / 3);
        ctx.fillStyle = colorThemeSecondary;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.font = "20px Pacifico" || "20px cursive";
        ctx.fillStyle = textColor;
        ctx.fillText(player2, xpos + 10, ypos + height / 3 + 30);
        fillText(player2, xpos + 10, ypos + height / 3 + 30);
        ctx.closePath();
        // Player 2 score rectangle
        ctx.beginPath();
        ctx.rect(xpos + width / 3 * 2, ypos + height / 3, width / 3, height / 3);
        rect(xpos + width / 3 * 2, ypos + height / 3, width / 3, height / 3);
        ctx.fillStyle = colorThemeSecondary;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.font = "20px Pacifico" || "20px cursive";
        ctx.fillStyle = textColor;
        ctx.fillText(score2, xpos + 5 * width / 6, ypos + height / 3 + 30);
        fillText(score2, xpos + 5 * width / 6, ypos + height / 3 + 30);
        ctx.closePath();
    }

    // Renders a card on canvas. Specify inner color and value if card is face up
    function renderPlayingCard(xpos, ypos, innerColor, name) {
        
        // return //////////////***************** */

        var img = new Image();
        img.src = "/images/playingcardback.png";
    
        ctx.drawImage(img, xpos, ypos, playingCard.width, playingCard.height);

        if (innerColor) {
            ctx.beginPath();
            ctx.rect(xpos + 3, ypos + 3, playingCard.width - 6, playingCard.height - 6);
            ctx.fillStyle = colorThemePrimary;
            ctx.fill();
            ctx.stroke();
            ctx.closePath;

            ctx.beginPath();
            ctx.font = "16px Georgia";
            ctx.fillStyle = colorThemeSecondary;
            ctx.fillText(name, xpos + 12, ypos + 25);
            ctx.closePath();

            ctx.beginPath();
            ctx.font = "16px Georgia";
            ctx.fillStyle = colorThemeSecondary;
            ctx.fillText(name, xpos + playingCard.width - 25, ypos + playingCard.height - 20);
            ctx.closePath();
        }
    }

    // Accepts an array of cards representing player cards and renders them in a row
    function renderPlayerHand(myCards) {
        return ///*************** */
        var offsetX = 20;
        if (myCards.length % 2 === 0) {
            var xpos = canvas.width / 2 - (myCards.length / 2 * (playingCard.width + offsetX)) + offsetX / 2;
        } else {
            var xpos = canvas.width / 2 - (myCards.length + 1) / 2 * playingCard.width + playingCard.width / 2 - offsetX * (myCards.length - 1) / 2;
        }
        var ypos = canvas.height - playingCard.height - 20;
        playerHandCollision = []
        for (var i = 0; i < cardNames.length; i++) {
            for (var j = 0; j < myCards.length; j++) {
                if (cardNames[i] === myCards[j].name) {
                    var cardObj = {};
                    cardObj.name = cardNames[i];
                    cardObj.initial = cardInitial(cardNames[i]);
                    cardObj.suit = myCards[j].suit;
                    cardObj.value = cardValues[i];
                    cardObj.left = xpos;
                    cardObj.top = ypos;
                    playerHandCollision.push(cardObj);
                    renderPlayingCard(cardObj.left, cardObj.top, playingCard.frontColor, cardObj.initial);
                    xpos = xpos + playingCard.width + offsetX;
                }
            }
        }
    }

    // Accepts a number and renders that number of cards face down in a row
    function renderOpponentHand(n) {
        return //////**************** */
        var offsetX = 20;
        if (n % 2 === 0) {
            var xpos = canvas.width / 2 - (n / 2 * (playingCard.width + offsetX)) + offsetX / 2;
        } else {
            var xpos = canvas.width / 2 - (n + 1) / 2 * playingCard.width + playingCard.width / 2 - offsetX * (n - 1) / 2;
        }
        var ypos = 20;
        opponentHandCollision = [];
        for (var i = 0; i < n; i++) {
            var cardObj = {};
            cardObj.left = xpos;
            cardObj.top = ypos;
            opponentHandCollision.push(cardObj);
            renderPlayingCard(cardObj.left, cardObj.top);
            xpos = xpos + playingCard.width + offsetX;
        }
    }

    // TODO: accepts a number and renders that number of cards face down stacked up
    function renderPrizeDeck(n) {
        return;   //******* */
        initialXPos = 20;
        var xpos = canvas.width / 2 + playingCard.width + initialXPos;
        var ypos = canvas.height / 2 - playingCard.height / 2;
        var offset = 2;
        var thisOffset = offset;
        for (var i = 0; i < n; i++) {
            renderPlayingCard(xpos - thisOffset, ypos - thisOffset);
            thisOffset = thisOffset + offset;
        }
    }

    // Accepts a card and renders it on the center of the screen
    function renderPrizeCard(card) {
    return ///////////************ */
        xpos = canvas.width / 2 - playingCard.width / 2;
        ypos = canvas.height / 2 - playingCard.height / 2;
        ctx.beginPath();
        ctx.rect(xpos - 20, ypos - 20, playingCard.width + 40, playingCard.height + 40);
        ctx.strokeStyle = colorThemeSecondary;
        ctx.stroke();
        ctx.closePath();
        if (!turnResolutionTime && !matchResolutionTime && card !== undefined && (card.name)) {
            var cardName = cardInitial(card.name);
            renderPlayingCard(xpos, ypos, playingCard.frontColor, cardName);
        }
    }

    // Accepts a card object and renders it to the left and offset down to a card on the center of the screen face up
    function renderPlayerPlayed(card) {
        return //////////************ */
        var xpos = canvas.width / 3 - playingCard.width / 2;
        var ypos = canvas.height / 3 * 2 - playingCard.height / 2;
        ctx.beginPath();
        ctx.rect(xpos - 20, ypos - 20, playingCard.width + 40, playingCard.height + 40);
        if (playerWonTurn === 0) {
            ctx.fillStyle = loseColor;
            ctx.fill();
        }
        if (playerWonTurn === 1) {
            ctx.fillStyle = winColor;
            ctx.fill();
        }
        if (
            playerWonTurn === 2) {
            ctx.fillStyle = tieColor;
            ctx.fill()
        }
        ctx.strokeStyle = colorThemeSecondary;
        ctx.stroke();
        ctx.closePath();
        if (card !== undefined && (card.name)) {
            var cardName = cardInitial(card.name);
            renderPlayingCard(xpos, ypos, playingCard.frontColor, cardName);
        }
    }

    // Accepts a card object and renders it to the right and offset up to a card on the center of the screen face down
    function renderOpponentPlayed(card) {
        return ///////**************** */
        var xpos = canvas.width / 3 * 2 - playingCard.width / 2;
        var ypos = canvas.height / 3 - playingCard.height / 2;
        ctx.beginPath();
        ctx.rect(xpos - 20, ypos - 20, playingCard.width + 40, playingCard.height + 40);
        if (playerWonTurn === 0) {
            ctx.fillStyle = winColor;
            ctx.fill();
        }
        if (playerWonTurn === 1) {
            ctx.fillStyle = loseColor;
            ctx.fill();
        }
        if (playerWonTurn === 2) {
            ctx.fillStyle = tieColor;
            ctx.fill()
        }
        ctx.strokeStyle = colorThemeSecondary;
        ctx.stroke();
        ctx.closePath();
        if (card !== undefined && (card.name)) {
            var cardName = cardInitial(card.name);
            if (playerPlayed) {
                renderPlayingCard(xpos, ypos, playingCard.frontColor, cardName);
            } else {
                //play animation here
                renderPlayingCard(xpos, ypos);
            }
        }
    }

    // Accepts an array of card objects and render them to the right of the player face up
    function renderWinnings() {
        var myXpos = canvas.width / 3 - playingCard.width - 90;
        var myYpos = canvas.height / 3 * 2 - playingCard.height / 2;
        var theirXpos = canvas.width / 3 * 2 + playingCard.width + 30;
        var theirYpos = canvas.height / 3 - playingCard.height / 2;
        var offset = 0;
        var increment = 2;
        var myCurrentWinnings = myWinnings;
        var theirCurrentWinnings = theirWinnings;
        
        ctx.beginPath();
        ctx.font = "20px Pacifico" || "20px cursive";
        ctx.fillStyle = colorThemeSecondary;
        ctx.fillText("My winnings", myXpos - playingCard.width - 80, myYpos + playingCard.height / 2);
        ctx.closePath();
        myCurrentWinnings.forEach(function (card) {
            renderPlayingCard(myXpos - offset, myYpos - offset, playingCard.frontColor, cardInitial(card.name));
            offset = offset + increment;
        });
        offset = 0;
        ctx.beginPath();
        ctx.font = "20px Pacifico" || "20px cursive";
        ctx.fillStyle = colorThemeSecondary;
        ctx.fillText("Their winnings", theirXpos + playingCard.width + 50, theirYpos + playingCard.height / 2);
        ctx.closePath();
        theirCurrentWinnings.forEach(function (card) {
            renderPlayingCard(theirXpos - offset, theirYpos - offset, playingCard.frontColor, cardInitial(card.name));
            offset = offset + increment;
        });
    }

    function renderSpecialCondition(renderfn, eventStartTime, duration) {
        // Exit condition: no start time
        if (!eventStartTime) {
            return;
        }
        if (duration) {
            var timeStamp = window.performance.now();
            var eventEndTime = eventStartTime + duration;
            // Exit condition: event has ended
            if (timeStamp > eventEndTime) {
                return;
            }
        }
        renderfn();
        return eventStartTime;
    }

    function renderTurnResolution() {
        if (!playerPlayed || !opponentPlayed || !prizeCard) {
            return;
        }
        var xpos = canvas.width / 2;
        var ypos = canvas.height / 3 * 2;
        var boxWidth = 400;
        var boxHeight = 100;
        var scoreIncrease = prizeCard.value;

        ctx.beginPath();
        ctx.rect(xpos - boxWidth / 2, ypos - boxHeight / 2, boxWidth, boxHeight);
        ctx.font = "32px Pacifico" || "32px cursive";
        ctx.strokeStyle = colorThemePrimary;
        if (playerPlayed.value > opponentPlayed.value) {
            playerWonTurn = 1;
            ctx.stroke();
            ctx.fillStyle = colorThemeSecondary;
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.fillStyle = textColor;
            ctx.fillText(`You won ${scoreIncrease} points!`, xpos - boxWidth * 5 / 16, ypos + boxHeight / 10);
        } else if (playerPlayed.value < opponentPlayed.value) {
            playerWonTurn = 0;
            ctx.stroke();
            ctx.fillStyle = colorThemeSecondary;
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.fillStyle = textColor;
            ctx.fillText(`Opponent won ${scoreIncrease} points.`, xpos - boxWidth * 2 / 5, ypos + boxHeight / 10);
        } else {
            playerWonTurn = 2;
            ctx.stroke();
            ctx.fillStyle = colorThemeSecondary;
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.fillStyle = textColor;
            ctx.fillText(`It's a draw!`, xpos - boxWidth * 1 / 5, ypos + boxHeight / 10);
        }
        ctx.closePath();
    }

    function renderMatchResolution() {
        var xpos = canvas.width / 2;
        var ypos = canvas.height / 2;
        var boxWidth = 500;
        var boxHeight = 200;
        ctx.beginPath();
        ctx.rect(xpos - boxWidth / 2, ypos - boxHeight / 2, boxWidth, boxHeight);
        ctx.font = "48px Pacifico" || "48px cursive";
        ctx.strokeStyle = colorThemePrimary;
        ctx.stroke();
        // Player won
        if (((playerNum === "player1") && (score1 > score2))
            || ((playerNum === "player2") && (score2 > score1))) {
            ctx.fillStyle = colorThemeSecondary;
            ctx.fill();
            ctx.closePath;
            ctx.beginPath;
            ctx.fillStyle = textColor;
            ctx.fillText(`You won this match!`, xpos - boxWidth / 2 + 35, ypos + 10);
            ctx.closePath();
            // Player lost
        } else if (((score1 > score2) && (playerNum === "player2")) ||
            (score1 < score2) && (playerNum === "player1")) {
            ctx.fillStyle = colorThemeSecondary;
            ctx.fill();
            ctx.closePath;
            ctx.beginPath;
            ctx.fillStyle = textColor;
            ctx.fillText(`You lost this match.`, xpos - boxWidth / 2 + 40, ypos + 10);
            ctx.closePath();
            // Draw
        } else {
            ctx.fillStyle = colorThemeSecondary;
            ctx.fill();
            ctx.closePath;
            ctx.beginPath;
            ctx.fillStyle = textColor;
            ctx.fillText(`This match is a draw.`,xpos - boxWidth / 2 + 40, ypos + 10);
            ctx.closePath();
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

 

        if (loaded) {


                    /// ****** temp test
   
                    renderTest();

            renderScoreBoard();
            // renderPlayerHand(myHand);
            // renderOpponentHand(theirHand);
            // renderPrizeDeck(prizeDeck);
            // if (!turnResolutionTime && !matchResolutionTime) {
            //     playerWonTurn = -1;
                
            // }
            // renderPrizeCard(prizeCard);
            // renderPlayerPlayed(playerPlayed);
            // renderOpponentPlayed(opponentPlayed);
            // turnResolutionTime = renderSpecialCondition(renderTurnResolution, turnResolutionTime, 5000);
            // renderWinnings();
            // matchResolutionTime = renderSpecialCondition(renderMatchResolution, matchResolutionTime);
            
        } else {
            ctx.beginPath();
            ctx.font = "120px Pacifico" || "120px cursive";
            ctx.fillStyle = colorThemeSecondary;
            ctx.fillText("Loading...", canvas.width / 3, canvas.height / 2);
            ctx.closePath();
        }
        requestAnimationFrame(draw);
    }


let globalGS;
    // Helper functions to extract game state information and save them into global variables
    function parseGameState(gameState) {
        GoofspeilGameState.setCurrent(new GoofspeilGameState(gameState, thisUser));
        console.log("GS/ThisUser", gameState, thisUser)
        console.log(GoofspeilGameState.current)
        // globalGS = gameState;
        // player1 = gameState.player1 || "Waiting ...";
        // player2 = gameState.player2 || "Waiting ...";
        // turnHistory = gameState.turnHistory;
        // prizeCard = turnHistory[turnHistory.length - 1].prizeCard;
        // playerNum = playerAssignments(true);
        // myTurnHistory = turnHistory.map(turn => turn[playerAssignments(true)]).filter(playedThisTurn => (playedThisTurn));
        // opponentTurnHistory = turnHistory.map(turn => turn[playerAssignments(false)]).filter(playedThisTurn => (playedThisTurn));
        // prizeDeckHistory = turnHistory.map(turn => turn['prizeCard']).filter(revealed => (revealed));
        // myHand = myHand.filter(card => !myTurnHistory.find(played => card.isSameAs(played)));
        // theirHand = 13 - opponentTurnHistory.length;
        // prizeDeck = 13 - prizeDeckHistory.length;
        // playerPlayed = turnHistory[turnHistory.length - 1][playerAssignments(true)];
        // opponentPlayed = turnHistory[turnHistory.length - 1][playerAssignments(false)];
        // calculateScore(turnHistory);
        // if (playerNum === "player1") {
        //     myWinnings = player1PrizeCards(turnHistory);
        //     theirWinnings = player2PrizeCards(turnHistory);
        // } else if (playerNum === "player2") {
        //     theirWinnings = player1PrizeCards(turnHistory);
        //     myWinnings = player2PrizeCards(turnHistory);
        // }
    }

    function player1PrizeCards(history) {
        var result = [];
        history.forEach(turn => {
            if(turn.player1 !== undefined && turn.player2 !== undefined) {
                if(turn.player1.value > turn.player2.value) {
                    result.push(turn.prizeCard)
                }
            }
        })
        return result;
    }
    function player2PrizeCards(history) {
        var result = [];
        history.forEach(turn => {
            if(turn.player1 !== undefined && turn.player2 !== undefined) {
                if(turn.player2.value > turn.player1.value) {
                    result.push(turn.prizeCard)
                }
            }
        })
        return result;
    }

    // Return string "player1" or "player2" for user if given true, for opponent if given false
    // Used to extract value from output key in a turn object
    function playerAssignments(boolean) {
        if (!thisUser) {
            return;
        }
        if (boolean) {
            if (thisUser === player1) {
                return "player1"
            } else {
                return "player2"
            }
        } else {
            if (thisUser === player2) {
                return "player1";
            } else {
                return "player2";
            }
        }
    }

    // Other helper functions
    function calculateScore(history) {
        score1 = 0;
        score2 = 0;
        history.forEach(function (turn) {
            if ((turn.prizeCard) && (turn.player1) && (turn.player2)) {
                if (turn.player1.value > turn.player2.value) {
                    score1 = score1 + turn.prizeCard.value;
                } else if (turn.player2.value > turn.player1.value) {
                    score2 = score2 + turn.prizeCard.value;
                }
                else return;
            }
        })
    }

    function cardInitial(name) {
        var result = name;
        if (name === "Ace") {
            result = "A";
        } else if (name === "Jack") {
            result = "J";
        } else if (name === "Queen") {
            result = "Q";
        } else if (name === "King") {
            result = "K";
        }
        return result;
    }

    function turnResolve() {
        if (playerPlayed && opponentPlayed && !turnResolutionTime) {
            // hard coded match resolution condition as 13 turns
            if (turnHistory.length === 13) {
                matchResolutionTime = window.performance.now();
            }
            else {
                turnResolutionTime = window.performance.now();
            }
        }
    }

    // Polling and draw function invocations to start game!
    doPoll();
    draw();
})