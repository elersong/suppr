const knex = require("../db/connection");

function update(updatedReservation, reservation_id) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id })
    .update(updatedReservation, "*")
    .then(data => data[0])
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

function search(mobile_number) {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '(). -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

module.exports = {
  update,
  destroy,
  readReservation,
  listAll,
  create,
  listByDate,
  search,
};
