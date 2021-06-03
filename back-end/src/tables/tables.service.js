const knex = require("../db/connection");
const {readReservation} = require("../reservations/reservations.service")

/**
 * Overwrites data in the table for the given ID
 * @module tables
 * @function
 * @param {Number} table_id - The ID of the table to be updated
 * @param {Object} updatedTable - The new data to save in the db
 * @return {Object} - The newly saved table
 */
function update(updatedTable, table_id) {
  return knex("tables")
    .select("*")
    .where({ table_id })
    .update(updatedTable, "*")
}

/**
 * Queries the db for the row with the given ID
 * @module tables
 * @function
 * @param {Number} table_id - The ID of the table to be queried
 * @return {Object} - The table object
 */
function read(table_id) {
  return knex("tables").select("*").where({ table_id });
}

/**
 * Reads all data in the db table
 * @module tables
 * @function
 * @return {Array} - All table objects in the db table
 */
function listAll() {
  return knex("tables as t").select("t.*");
}

/**
 * Saves a new table object into the db and assigns an ID
 * @module tables
 * @function
 * @param {Object} newData - The new data to save in the db
 * @return {Object} - The newly saved table, complete with table_id property
 */
function create(newData) {
  return knex("tables")
    .insert(newData)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

module.exports = {
  update,
  read,
  readReservation,
  listAll,
  create,
};
