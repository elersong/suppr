const knex = require("../db/connection");

function update(updatedReview, review_id) {
  return knex("reviews")
    .select("*")
    .where({ review_id })
    .update(updatedReview, "*")
    .then((unneeded) => {
      return knex("reviews")
        .select("*")
        .where({ review_id })
        .join("critics as c", "c.critic_id", "reviews.critic_id")
        .select("reviews.*", "c.*")
        .then((data) => addCritic(data[0]));
    });
}

function destroy(review_id) {
  return knex("reviews").select("*").where({ review_id }).del();
}

function read(review_id) {
  return knex("reviews").select("*").where({ review_id });
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
  read,
  listAll,
  create,
  listByDate,
};
