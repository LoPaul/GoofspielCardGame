

// $(() => {
//   $.ajax({
//     method: "GET",
//     url: "/api/users"
//   }).done((users) => {
//     for(user of users) {
//       $("<div>").text(user.name).appendTo($("body"));
//     }
//   });;
// });



var gameState;

// polling server for new gamestate
(function poll(){
  setTimeout(function(){
    $.ajax({
      method: "GET",
      url: "/gs"
    }).done((gs) => {
      // only update if timestamp is later
      gameState = gs;
      console.log(gs);
      postGameState();
      poll();
    });;
 }, 10000);
})();

function postGameState() {
  //update timestamp here 
  gameState["timestamp"] = new Date();
  $.ajax({
    method: "POST",
    url: "/gs",
    data: gameState
  })
    .done(function() {
      console.log("GS sent")
    })
}