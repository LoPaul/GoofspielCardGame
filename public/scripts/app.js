

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
(function poll(){
  setTimeout(function(){
    $.ajax({
      method: "GET",
      url: "/gs"
    }).done((gs) => {
     
      console.log(gs)
      poll();
    });;
 }, 1000);
})();


// $.ajax({
//   method: "POST",
//   url: "/tweets",
//   data: $(this).serialize()
// })
//   .done(function(newTweet) {
//     loadTweets([newTweet]);
//   })