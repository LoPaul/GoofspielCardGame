$(document).ready(function () {
    console.log(thisUser);
    console.log(gameID);
    // Canvas dimensions
    var canvas = document.getElementById("Goofspiel");
    canvas.width = 1600;
    canvas.height = 900;
    canvasTop = canvas.offsetTop;
    canvasLeft = canvas.offsetLeft;
    var ctx = canvas.getContext("2d");

    // Card specifications
    var cardNames = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];
    var cardValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    var playingCard = {
        width: 80,
        height: 120,
        backColor: "#CB4335",
        frontColor: "#FFFFFF"
    }

    var playerCards = cardNames;
    // Properties extracted from gamestate
    var gameState = {};
    var turnHistory = [];
    var turn = 0;
    var prizeCard = {};
    var player1 = "";
    var player2 = "";
    var thePlayer = "";
    var playerSuit = "Diamond";
    var opponentSuit = "Club";
    var prizeSuit = "Heart";

    var playerPlayed = {};


    // Card objects for collision detection
    var playerHand = [];
    var opponentHand = [];

    // polling server for new gamestate

    setInterval(function poll() {
        $.ajax({
            method: "GET",
            url: "/gs/" + (gameID).toString()
        }).done((gs) => {
            // {turnHistory: [], player1: string, player2: string}
            console.log(gs);
            gameState = gs;
            turnHistory = gs.turnHistory;
            turn = turnHistory.length;
            prizeCard = turnHistory[turn - 1].prizeCard;
            player1 = gs.player1;
            player2 = gs.player2;
            if (thisUser === player1) {
                thePlayer = player1;
            } else if (thisUser === player2) {
                thePlayer = player2;
            }
            playerPlayed = getPlayerPlayed(turnHistory);
            console.log(playerPlayed)
            playerHand = getHand(turnHistory);

        })
    }, 1000);



    // Turnstates - 
    // 0: Initial setup of the game, only rendered once in the beginning
    // 1: Prize card shown on play area, player allowed to make a move
    // 2: Player made a move, opponent has not. Waiting...
    // 3: Opponent made a move, player has not. Player allowed to make a move
    // 4: Both players made their move. Resolution phase: No input allowed. Scores shown
    // 5: Winning player places all 3 cards on his side of the table
    // 6: Player Won
    // 7: Player Lost
    // 8: Tie

    $("canvas").on('click', function (event) {
        var mouseX = event.pageX - canvasLeft;
        var mouseY = event.pageY - canvasTop;

        playerHand.forEach(function (card) {

            if (// mouseclick collision detection
                ((mouseX > card.left && mouseX < card.left + playingCard.width)
                    && (mouseY > card.top && mouseY < card.top + playingCard.height))
                && // move validation, does not pass if move is illegal
                !playerPlayed) {
                var myData = {};
                myData.gameid = gameID;
                var cardData = {};
                cardData.name = card.name;
                cardData.suit = playerSuit;
                myData.card = cardData;
                console.log(myData);
                //alert(`You clicked your ${cardNames[card.value - 1]}`);
                //console.log(playerCards);
                $.ajax({
                    method: "POST",
                    url: "/gs/",
                    data: myData
                }).done(function () {
                    console.log(`Played card:, ${Data.card.name}, suit: ${Data.card.suit}`)
                })
            }
        })
    })

    // Renders a card on canvas. Specify inner color and value if card is face up
    function renderPlayingCard(xpos, ypos, innerColor, name) {
        ctx.beginPath();
        ctx.rect(xpos, ypos, playingCard.width, playingCard.height);
        ctx.fillStyle = playingCard.backColor;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        if (innerColor) {
            ctx.beginPath();
            ctx.rect(xpos + 10, ypos + 10, playingCard.width - 20, playingCard.height - 20);
            ctx.fillStyle = playingCard.frontColor;
            ctx.fill();
            ctx.stroke();
            ctx.closePath;

            ctx.beginPath();
            ctx.font = "16px Arial";
            ctx.fillStyle = "#000000";
            ctx.fillText(name, xpos + 20, ypos + 30);
            ctx.closePath();
        }
    }

    // Accepts an array of cardNames representing player cards and renders them in a row
    function renderPlayerHand(playerCards) {
        var offsetX = 20;
        var y = canvas.height - playingCard.height - 20;
        playerHand = [];
        for (var i = 0; i < cardNames.length; i++) {
            for (var j = 0; j < playerCards.length; j++) {
                if (cardNames[i] === playerCards[j]) {
                    var cardObj = {};
                    cardObj.name = cardNames[i];
                    cardObj.value = cardValues[i];
                    cardObj.left = offsetX;
                    cardObj.top = y;
                    playerHand.push(cardObj);
                    renderPlayingCard(cardObj.left, cardObj.top, playingCard.frontColor, cardObj.name);
                    offsetX = offsetX + playingCard.width + 5;
                }
            }
        }
    }

    // Accepts a number and renders that number of cards face down in a row
    function renderOpponentHand(n) {
        var offSetX = 20;
        var y = 20;
        opponentHand = [];
        for (var i = 0; i < n; i++) {
            var cardObj = {};
            cardObj.left = offSetX;
            cardObj.top = y;
            opponentHand.push(cardObj);
            renderPlayingCard(cardObj.left, cardObj.top);
            offSetX = offSetX + playingCard.width + 5;
        }
    }


    // TODO: accepts a number and renders that number of cards face down stacked up
    function renderPrizeDeck(n) {
        var pixelsFromRightEdge = 30;
        var offset = pixelsFromRightEdge / 15;
        for (var i = 0; i < n; i++) {
            renderPlayingCard((canvas.width - playingCard.width - pixelsFromRightEdge - offset), canvas.height / 2 - offset);
            offset = offset + pixelsFromRightEdge / 15;
        }
    }

    // Accepts a string that should be the card's name and renders it on the center of the screen
    function renderPrizeCard(str) {
        cardName = cardInitial(str);
        renderPlayingCard(canvas.width / 2, canvas.height / 2, playingCard.frontColor, cardName);

    }

    // Accepts a card object and renders it to the left and offset down to a card on the center of the screen face up
    function renderPlayerPlayed(card) {
        if (card) {
            var offsetX = 20;
            var offsetY = 20;
            cardName = cardInitial(card);
            renderPlayingCard(canvas.width / 2 - playingCard.width - offsetX, canvas.height / 2 + offsetY, playingCard.frontColor, cardName);
        }
    }

    // Accepts a card object and renders it to the right and offset up to a card on the center of the screen face down
    function renderOpponentPlayed(card) {
        if (card) {
            var offsetX = 20;
            var offsetY = 20;
            renderPlayingCard(canvas.width / 2 + playingCard.width + offsetX, canvas.height / 2 - offsetY, playingCard.frontColor, card.name);
        }
    }

    // TODO: function which accepts opponent card object and renders it on the center of the screen face up

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // TODO: render scoreboard
        renderPlayerHand(cardNames);//gameState.turnHistory, thisPlayer));
        renderOpponentHand(13);
        renderPrizeDeck(13);
        // TODO: render player winnings pile
        // TODO: render opponent winnings pile
        renderPrizeCard("Ace"); //gamestate.turnHistory[0].prizeCard
        //renderPrizePile(gameState.prizePile);
        renderPlayerPlayed();
        renderOpponentPlayed();

        // animate cards moving to the winning side's winnings pile
        // CHECK IF PLAYER WON/LOST, change to state 6/7

        // TODO: highlight player green in scoreboard
        // and highlight opponent red
        // TODO: show big text: "YOU WON"

        // TODO: highlight player red in scoreboard
        // and highlight opponent green
        // TODO: show big text: "YOU LOST"

        requestAnimationFrame(draw);
    }

    function thePlayer(user) {
        if (!gameState) {
            return undefined;
        }
        if (user === gameState.player1) {
            return "player1";
        } else if (user === gameState.player2) {
            return "player2";
        }
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

    function cardName(initial) {
        result = initial.toString();
        if ((initial) === "A") {
            result = "Ace";
        } else if ((initial) === "J") {
            result = "Jack";
        } else if ((initial) === "Q") {
            result = "Queen";
        } else if ((initial) === "K") {
            result = "King";
        }
        return result;
    }
    // uses gameState's turnHistory array to create an array of cards with properies required for collision detection
    function getHand(history) {
        // var offsetX = 20;
        // var y = canvas.height - playingCard.height - 20;
        // playerhand = [];
        // for (var i = 0; i < cardNames.length; i++) {
        //     for (var j = 0; j < playerCards.length; j++) {
        //         if (cardNames[i] === playerCards[j]) {
        //             var cardObj = {};
        //             cardObj.name = cardNames[i];
        //             cardObj.value = cardValues[i];
        //             cardObj.left = offsetX;
        //             cardObj.top = y;
        //             playerHand.push(cardObj);
        //             offsetX = offsetX + playingCard.width + 5;
        //         }
        //     }
        // }
    }

    function getOpponentHand(n) {
        if (n) {
            return 13 - n;
        }
        else return 13;
    }

    function getPlayerPlayed(history) {
        var index = history.length - 1;
        return history[index][thePlayer];
    }

    //TODO: function to produce array of strings representing player card names from gamestate

    //TODO: function to produce a number representing number of opponent cards from gamestate

    draw();
})