$(document).ready(function () {

    var canvas = document.getElementById("Goofspiel");
    // Canvas dimensions
    canvas.width = 1600;
    canvas.height = 900;
    canvasTop = canvas.offsetTop;
    canvasLeft = canvas.offsetLeft;
    var ctx = canvas.getContext("2d");

    var cardValues = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

    canvas.addEventListener('click', function (event) {
        alert(`${event.pageX - canvasLeft}, ${event.pageY - canvasTop}`);
    })

    function renderCard(value, xpos, ypos, width, length, innerColor) {
        ctx.beginPath();
        ctx.rect(xpos, ypos, width, length);
        ctx.fillStyle = "#CB4335";
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        if (innerColor) {
            ctx.beginPath();
            ctx.rect(xpos + 10, ypos + 10, width -20, length -20);
            ctx.fillStyle = innerColor;
            ctx.fill();
            ctx.stroke();
            ctx.closePath;
        }
        
        ctx.beginPath();
        ctx.font = "16px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText(value, xpos + 20, ypos + 30);
        ctx.closePath();
    }

    function renderPlayerHand() {
        var cardHeight = 150;
        var cardWidth = 100;
        var offsetX = 20;
        var y = canvas.height - cardHeight - 20;
        for (var i = 0; i < cardValues.length; i++) {
            renderCard(cardValues[i], offsetX, y, cardWidth, cardHeight, "#FFFFFF");
            offsetX = offsetX + cardWidth
        }
    }

    function renderOpponentHand() {
        var cardHeight = 150;
        var cardWidth = 100;
        var offSetX = 20;
        var y = 20;
        for (var i = 0; i < cardValues.length; i++) {
            renderCard("", offSetX, y, cardWidth, cardHeight);
            offSetX = offSetX + cardWidth;

        }
    }
    renderPlayerHand();
    renderOpponentHand();
})