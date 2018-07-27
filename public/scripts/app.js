

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


// (function poll(){
//   setTimeout(function(){
//     $.ajax({
//       method: "GET",
//       url: "/api/users"
//     }).done((users) => {
//       for(user of users) {
//         $("<div>").text(user.name).appendTo($("body"));
//       };
//       console.log("Refresh")
//       poll();
//     });;
//  }, 1000);
// })();