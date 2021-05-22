const knex = require("../db/connection");
const {readReservation} = require("../reservations/reservations.service")

function update(updatedTable, table_id) {
  return knex("tables")
    .select("*")
    .where({ table_id })
    .update(updatedTable, "*")
}

// function destroy(review_id) {
//   return knex("reviews").select("*").where({ review_id }).del();
// }

function read(table_id) {
  return knex("tables").select("*").where({ table_id });
}

function listAll() {
  return knex("tables as t").select("t.*");
}

function create(newData) {
  return knex("tables")
    .insert(newData)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

module.exports = {
  update,
  //destroy,
  read,
  readReservation,
  listAll,
  create,
  //listByDate,
};
