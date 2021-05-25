/**
 * List handler for table resources
 */
const service = require("./tables.service");

// Helper fxns ==============================================================

const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// Validation fxns ==========================================================

const hasData = (req, res, next) => {
  if (req.body.data) {
    next();
  } else {
    next({
      status: 400,
      message: "Expected request to provide `data` in body."
    })
  }
}

const hasAllValidProperties = require("../errors/hasProperties")(
  "table_name",
  "capacity"
);

const hasValidTableData = (req, res, next) => {
  const {
    table_name,
    capacity
  } = req.body.data;
  let message, tableNameIsValid, capacityIsValid;

  tableNameIsValid = table_name.length > 1;
  capacityIsValid = (typeof capacity === 'number') && (capacity > 0)

  if (tableNameIsValid && capacityIsValid) {
    return next();
  } else {
    next({
      status: 400,
      message: message || "Invalid data provided. Requires {string: table_name, number: capacity}"
    });
  }
};

const tableExists = (req, res, next) => {
  service
    .read(req.params.table_id)
    .then((table) => {
      console.log("RECEIVED TABLE ID:", req.params.table_id)
      console.log("DATA RETRIEVED: ", table)
      if (table) {
        res.locals.table = table[0];
        return next();
      }
      next({ status: 404, message: `Table cannot be found.` });
    })
    .catch(next);
}

const reservationExists = (req, res, next) => {
  const {reservation_id} = req.body.data;
  service
    .readReservation(reservation_id)
    .then((reserv) => {
      if (reserv.length > 0) {
        res.locals.reservation = reserv[0];
        return next();
      }
      next({ status: 404, message: `Reservation ${reservation_id} cannot be found.` });
    })
    .catch(e => next({status: 400, message: e.message}));
}

const hasSufficientCapacity = (req, res, next) => {
  let {people} = res.locals.reservation;
  let {capacity} = res.locals.table;

  let isSufficient = capacity >= people;

  if (isSufficient) {
    return next();
  } else {
    return next({status: 400, message: "Insufficient table capacity for reservation."})
  }
}

const isVacant = (req, res, next) => {
  if (!res.locals.table.reservation_id) {
    return next();
  } else {
    return next({status: 400, message: "Table currently occupied. Select another table."});
  }
}


// Middleware fxns ==========================================================

// GET /tables
async function list(req, res) {
  let tables = await service.listAll();
  
  if (tables.length > 1) {
    tables = tables.sort((a,b) => a.table_name.localeCompare(b.table_name))
  }

  res.json({ data: tables });
}

// POST /tables
async function create(req, res) {
  let incomingData = req.body.data;
  res.status(201).json({ data: await service.create(incomingData) });
}

// GET /tables/:table_id
async function read(req, res) {
  res.json({ data: res.locals.table });
}

// PUT /tables/:table_id/seat
async function seat(req, res) {
  let newTableData = res.locals.table;
  newTableData.reservation_id = res.locals.reservation.reservation_id;
  res.json({ data: await service.update(newTableData, newTableData.table_id) })
}


module.exports = {
  list,
  create: [hasAllValidProperties, hasValidTableData, asyncErrorBoundary(create)],
  read: [tableExists, asyncErrorBoundary(read)],
  seat: [hasData, tableExists, reservationExists, hasSufficientCapacity, isVacant, asyncErrorBoundary(seat)],
};