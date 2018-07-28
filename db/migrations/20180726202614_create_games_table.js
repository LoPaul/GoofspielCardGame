exports.up = function(knex, Promise) {
  return knex.schema.createTable('games', function (table) {
    table.increments();
    table.integer("game_id")
    table.integer("player1_id");
    table.integer("player2_id");
    table.integer("p1Score");
    table.integer("p2Score")
    table.json('game_state');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('games');
};
