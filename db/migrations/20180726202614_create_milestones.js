exports.up = function(knex, Promise) {
  return knex.schema.dropTable('games');
};

exports.down = function(knex, Promise) {
 
};
