const knex = require("../db/connection");

function update(updatedReservation, reservation_id) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id })
    .update(updatedReservation, "*")
}

function destroy(review_id) {
  return knex("reviews").select("*").where({ review_id }).del();
}

function readReservation(reservation_id) {
  return knex("reservations").select("*").where({ reservation_id });
}

function listByDate(reservation_date) {
  return knex("reservations")
  .select("*")
  .where({ reservation_date });
}

function listAll() {
  return knex("reservations as r").select("r.*");
}

function create(newData) {
  return knex("reservations")
    .insert(newData)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

module.exports = {
  update,
  destroy,
  readReservation,
  listAll,
  create,
  listByDate,
};
