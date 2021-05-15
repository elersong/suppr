/**
 * List handler for reservation resources
 */
const service = require('./reservations.service');

// Helper fxns ==============================================================

const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// Validation fxns ==========================================================

//  table.increments("reservation_id").primary();
//  table.string("first_name");
//  table.string("last_name");
//  table.string("mobile");
//  table.date("date");
//  table.time("time");
//  table.integer("size");
//  table.timestamps(true, true);
const hasAllValidProperties = require("../errors/hasProperties")("first_name", "last_name", "mobile", "date", "time", "size");


// Middleware fxns ==========================================================

// GET /reservations
async function list(req, res) {
  res.json({ data: await service.listAll() });
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
