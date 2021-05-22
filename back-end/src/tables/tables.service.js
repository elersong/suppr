const knex = require("../db/connection");

// function update(updatedReview, review_id) {
//   return knex("reviews")
//     .select("*")
//     .where({ review_id })
//     .update(updatedReview, "*")
//     .then((unneeded) => {
//       return knex("reviews")
//         .select("*")
//         .where({ review_id })
//         .join("critics as c", "c.critic_id", "reviews.critic_id")
//         .select("reviews.*", "c.*")
//         .then((data) => addCritic(data[0]));
//     });
// }

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
  //update,
  //destroy,
  read,
  listAll,
  create,
  //listByDate,
};
