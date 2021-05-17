/**
 * List handler for reservation resources
 */
const service = require('./reservations.service');

// Helper fxns ==============================================================

const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// Validation fxns ==========================================================


const hasAllValidProperties = require("../errors/hasProperties")("first_name", "last_name", "mobile_number", "reservation_date", "reservation_time", "people");


// Middleware fxns ==========================================================

// GET /reservations
async function list(req, res) {
  let reservations;
  if (req.query.reservation_date) {
    reservations = await service.listByDate(req.query.reservation_date)
  } else {
    reservations = await service.listAll();
  }
  console.log(reservations)
  res.json({ data: reservations });
}

// POST /reservations
async function create(req, res) {
  let incomingData = req.body.data;
  res.status(201).json({ data: await service.create(incomingData) })
}

module.exports = {
  list,
  create: [hasAllValidProperties, asyncErrorBoundary(create)]
};
