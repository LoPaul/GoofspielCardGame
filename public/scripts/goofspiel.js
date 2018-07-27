$(document).ready(function () {

    var canvas = document.getElementById("Goofspiel");
    // Canvas dimensions
    canvas.width = 1600;
    canvas.height = 900;
    canvasTop = canvas.offsetTop;
    canvasLeft = canvas.offsetLeft;
    var ctx = canvas.getContext("2d");

    var cardValues  = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    var prizeValues = [  1,   2,   3,   4,   5,   6,   7,   8,   9,   10,  11,  12,  13];
    var playingCard = {
        width: 100,
        height: 150,
        backColor: "#CB4335",
        frontColor: "#FFFFFF"
    }
    var playerHand = [];
    var opponentHand = [];


    canvas.addEventListener('click', function (event) {
        var mouseX = event.pageX - canvasLeft;
        var mouseY = event.pageY - canvasTop;
        
        // Collision detection for player cards
        playerHand.forEach(function(card) {
            if ((mouseX > card.left && mouseX < card.left + playingCard.width)
            && (mouseY > card.top && mouseY < card.top + playingCard.height)) {
                alert(`You clicked your ${cardValues[card.value - 1]}`);
            }
        })
    })

    // Renders a card on canvas. Specify inner color and value if card is face up
    function renderCard(xpos, ypos, width, length, innerColor, value) {
        ctx.beginPath();
        ctx.rect(xpos, ypos, width, length);
        ctx.fillStyle = playingCard.backColor;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        if (innerColor) {
            ctx.beginPath();
            ctx.rect(xpos + 10, ypos + 10, width -20, length -20);
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

        for (var i = 0; i < cardValues.length; i++) {
            var cardObj = {};
            cardObj.value = prizeValues[i];
            cardObj.left = offsetX;
            cardObj.top = y;
            playerHand.push(cardObj);
            renderCard(cardObj.left, cardObj.top, playingCard.width, playingCard.height, "#FFFFFF", cardValues[i]);
            offsetX = offsetX + playingCard.width + 5
        }
    }

    function renderOpponentHand() {
        var offSetX = 20;
        var y = 20;
        for (var i = 0; i < cardValues.length; i++) {
            var cardObj = {};
            cardObj.value = prizeValues[i];
            cardObj.left = offSetX;
            cardObj.top = y;
            opponentHand.push(cardObj);
            renderCard(cardObj.left, cardObj.top, playingCard.width, playingCard.height);
            offSetX = offSetX + playingCard.width + 5;

        }
    }
    renderPlayerHand();
    renderOpponentHand();
    console.log(playerHand);
    console.log(opponentHand);
})