$(document).ready(function () {

    var gameState;

    // polling server for new gamestate
    (function poll() {
        setTimeout(function () {
            $.ajax({
                method: "GET",
                url: "/gs"
            }).done((gs) => {
                // only update if timestamp is later
                gameState = gs;
                draw();
                poll();
            });;
        }, 1000);
    })();


    function postGameState() {
        //update timestamp here 
        gameState["timestamp"] = new Date();
        $.ajax({
            method: "POST",
            url: "/gs",
            data: gameState
        })
            .done(function () {
                console.log("GS sent")
            })
    }

    var canvas = document.getElementById("Goofspiel");
    // Canvas dimensions
    canvas.width = 1600;
    canvas.height = 900;
    canvasTop = canvas.offsetTop;
    canvasLeft = canvas.offsetLeft;
    var ctx = canvas.getContext("2d");

    var cardValues = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    var prizeValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    var playingCard = {
        width: 80,
        height: 120,
        backColor: "#CB4335",
        frontColor: "#FFFFFF"
    }
    var playerHand = [];
    var opponentHand = [];
    var playerPlayedCard = {};
    var opponentPlayedCard = {};
    var currentPrize = {};
    var turnState = 0;


    canvas.addEventListener('click', function (event) {
        var mouseX = event.pageX - canvasLeft;
        var mouseY = event.pageY - canvasTop;

        // Collision detection for player cards
        playerHand.forEach(function (card) {
            if (turnstate === 1 && (mouseX > card.left && mouseX < card.left + playingCard.width)
                && (mouseY > card.top && mouseY < card.top + playingCard.height)) {
                //alert(`You clicked your ${cardValues[card.value - 1]}`);
                playerPlayedCard = card;
                if (turnState === 3) {
                    turnState = 4;
                } else {
                    turnState = 2;
                }
            }
        })
    })

    // Renders a card on canvas. Specify inner color and value if card is face up
    function renderPlayingCard(xpos, ypos, innerColor, value) {
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
            ctx.fillText(value, xpos + 20, ypos + 30);
            ctx.closePath();
        }
    }

    function renderPlayerHand() {
        var offsetX = 20;
        var y = canvas.height - playingCard.height - 20;
        playerhand = [];

        for (var i = 0; i < cardValues.length; i++) {
            var cardObj = {};
            cardObj.value = prizeValues[i];
            cardObj.left = offsetX;
            cardObj.top = y;
            cardObj.name = cardValues[i];
            if (cardObj.name !== playerPlayedCard.name) {
                playerHand.push(cardObj);
                renderPlayingCard(cardObj.left, cardObj.top, playingCard.frontColor, cardValues[i]);
                offsetX = offsetX + playingCard.width + 5;
            }
        }
    }

    function renderOpponentHand() {
        var offSetX = 20;
        var y = 20;
        opponentHand = [];

        for (var i = 0; i < cardValues.length; i++) {
            var cardObj = {};
            cardObj.value = prizeValues[i];
            cardObj.left = offSetX;
            cardObj.top = y;
            cardObj.name = cardValues[i];
            if (cardObj.name !== opponentPlayedCard.name) {
                opponentHand.push(cardObj);
                renderPlayingCard(cardObj.left, cardObj.top);
                offSetX = offSetX + playingCard.width + 5;
            }
        }
    }

    function renderPrizeDeck() {
        renderPlayingCard((canvas.width - playingCard.width - 20), canvas.height / 2);
    }

    // renders the top card of the prize card array in game state on the play area
    function renderPrizeCard() {
        valueOfCard(gameState._prizeCards[0])
        renderPlayingCard(canvas.width / 2, canvas.height / 2, playingCard.frontColor, valueOfCard(gameState._prizeCards[0]));
    }

    function renderPlayerPlayed() {
        if (playerPlayedCard) {
            renderPlayingCard(canvas.width / 2 - playingCard.width - 20, canvas.height / 2, playingCard.frontColor, playerPlayedCard.name);
        }
    }

    function renderOpponentPlayed() {
        if (opponentPlayedCard) {
            renderPlayingCard(canvas.width / 2 + playingCard.width + 20, canvas.height / 2, playingCard.frontColor, opponentPlayedCard.name);
        }
    }

    function drawPrizeCard() {
        console.log(gameState._prizeCards[0]);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderPlayerHand();
        renderOpponentHand();
        renderPrizeDeck();
        renderPrizeCard();
        renderPlayerPlayed();
        renderOpponentPlayed();
        if (turnState === 2) {
            // remove when redundant
            opponentMove();
        }
        if (turnState === 4) {
            setTimeout(function () { turnstate = 5 }, 5000);
        }
    }
    turnstate = 1;
    console.log(turnstate);
    console.log(opponentPlayedCard == true)

    // Simulates an opponent moving, remove when obsolete
    function opponentMove() {
        opponentPlayedCard = opponentHand[0];
        if (turnState === 2) {
            turnState = 4;
        } else {
            turnState = 3;
        }
    }

    function valueOfCard(gsCard) {
        result = gsCard.name;
        if ((gsCard.name) === "Ace") {
            result = "A";
        } else if ((gsCard.name) === "Jack") {
            result = "J";
        } else if ((gsCard.name) === "Queen") {
            result = "Q";
        } else if ((gsCard.name) === "King") {
            result = "K";
        }
        return result;
    }
})