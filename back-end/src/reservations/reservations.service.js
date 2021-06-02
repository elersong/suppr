const knex = require("../db/connection");

/**
 * Updates a given reservation object within the database
 * @module reservations
 * @function
 * @param {Object} updatedReservation - The data to overwrite the existing db row
 * @param {Number} reservation_id - The ID of the reservation to be overwritten
 * @return {Object} - The updated reservation
 */
function update(updatedReservation, reservation_id) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id })
    .update(updatedReservation, "*")
    .then(data => data[0])
}

/**
 * Queries the db for the reservation with the given ID
 * @module reservations
 * @function
 * @param {Number} reservation_id - The ID of the reservation to be searched
 * @return {Object} - The reservation
 */
function readReservation(reservation_id) {
  return knex("reservations").select("*").where({ reservation_id });
}

/**
 * Queries the db for all reservations with the given date
 * @module reservations
 * @function
 * @param {String} reservation_date - The date of the reservation(s) to be searched
 * @return {Array} - A possibly empty array of reservation objects
 */
function listByDate(reservation_date) {
  return knex("reservations")
  .select("*")
  .where({ reservation_date });
}

/**
 * Queries the db for all reservations
 * @module reservations
 * @function
 * @return {Array} - A possibly empty array of reservation objects
 */
function listAll() {
  return knex("reservations as r").select("r.*");
}

/**
 * Creates a new reservation object within the db
 * @module reservations
 * @function
 * @param {Object} newData - The reservation object to be saved
 * @return {Object} - The new reservation object, including an assigned ID
 */
function create(newData) {
  return knex("reservations")
    .insert(newData)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

/**
 * Searches for any reservations with the given date, ordered by date
 * @module reservations
 * @function
 * @param {String} mobile_number - The mobile number to be searched
 * @return {Array} - A possibly empty array of reservation objects
 */
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
  readReservation,
  listAll,
  create,
  listByDate,
  search,
};
