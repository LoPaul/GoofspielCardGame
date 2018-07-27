$(document).ready(function () {

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
    var turnState = 0;


    canvas.addEventListener('click', function (event) {
        var mouseX = event.pageX - canvasLeft;
        var mouseY = event.pageY - canvasTop;

        // Collision detection for player cards
        playerHand.forEach(function (card) {
            if ((mouseX > card.left && mouseX < card.left + playingCard.width)
                && (mouseY > card.top && mouseY < card.top + playingCard.height)) {
                //alert(`You clicked your ${cardValues[card.value - 1]}`);
                playerPlayedCard = card;
                turnState = 2;
                console.log(playerPlayedCard);
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

        for (var i = 0; i < cardValues.length; i++) {
            var cardObj = {};
            cardObj.value = prizeValues[i];
            cardObj.left = offsetX;
            cardObj.top = y;
            cardObj.name = cardValues[i];
            if (cardObj.name !== playerPlayedCard.name) {
                ctx.clearRect(cardObj.left, cardObj.top, playingCard.width, playingCard.height)
                playerHand.push(cardObj);
                renderPlayingCard(cardObj.left, cardObj.top, playingCard.frontColor, cardValues[i]);
                offsetX = offsetX + playingCard.width + 5
            }
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
            cardObj.name = cardValues[i];
            opponentHand.push(cardObj);
            renderPlayingCard(cardObj.left, cardObj.top);
            offSetX = offSetX + playingCard.width + 5;

        }
    }

    function renderPrizeDeck() {
        renderPlayingCard((canvas.width - playingCard.width - 20), canvas.height / 2);
    }

    function renderPrizeCard() {
        renderPlayingCard(canvas.width / 2, canvas.height / 2, playingCard.frontColor, "K");
    }

    function renderPlayerPlayed() {
        renderPlayingCard(canvas.width / 2 - playingCard.width - 20, canvas.height / 2, playingCard.frontColor, playerPlayedCard.name);
    }

    function draw() {
        if (turnState === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            renderPlayerHand();
            renderOpponentHand();
            renderPrizeDeck();
        }
        if (turnState === 1) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            renderOpponentHand();
            renderPrizeDeck();
            renderPlayerHand();
            renderPrizeCard();
        }

        if (turnState === 2) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            renderOpponentHand();
            renderPrizeDeck();
            renderPlayerHand();
            renderPrizeCard();
            renderPlayerPlayed();
        }
    }

    function shuffle(array) {
        var j, x, i;
        for (i = array.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = array[i];
            array[i] = array[j];
            array[j] = x;
        }
        return a;
    }

    draw();
    setTimeout(
        function () {
            turnState = 1;
            setInterval(draw, 1000);
        }, 5000);
    
})