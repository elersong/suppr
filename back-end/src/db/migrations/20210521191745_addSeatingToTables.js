
exports.up = function(knex) {
  return knex.schema.table("tables", function (table) {
    table.integer("reservation_id").unsigned();
    table
      .foreign("reservation_id")
      .references("reservation_id")
      .inTable("reservations")
      .onDelete("cascade");
  })
};

exports.down = function(knex) {
  return knex.schema.table("tables", function (table) {
    table.dropColumn("reservation_id");
  })
};
