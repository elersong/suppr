/**
 * List handler for table resources
 */
const service = require("./tables.service");
const reservationsService = require("../reservations/reservations.service");

// Helper fxns ==============================================================

const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// Validation fxns ==========================================================

/**
 * Validates that the req.body has a 'data' property
 * @module tables
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {Object} req.body.data - Payload of the incoming request
 * @return {undefined}
 */
const hasData = (req, res, next) => {
  if (req.body.data) {
    next();
  } else {
    next({
      status: 400,
      message: "Expected request to provide `data` in body.",
    });
  }
};

/**
 * Validates that the req.body.data has the required properties
 * @module tables
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {String} req.body.data.table_name - Selected name of table obj
 * @param {String} req.body.data.capacity - Selected capacity of table obj
 * @return {undefined}
 */
const hasAllValidProperties = require("../errors/hasProperties")(
  "table_name",
  "capacity"
);

/**
 * Validates that the req.body.data has the proper data types and formats
 * @module tables
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {String} req.body.data.table_name - Selected name of table obj
 * @param {Number} req.body.data.capacity - Selected capacity of table obj
 * @return {undefined}
 */
const hasValidTableData = (req, res, next) => {
  const { table_name, capacity } = req.body.data;
  let message, tableNameIsValid, capacityIsValid;

  tableNameIsValid = table_name.length > 1;
  capacityIsValid = typeof capacity === "number" && capacity > 0;

  if (tableNameIsValid && capacityIsValid) {
    return next();
  } else {
    next({
      status: 400,
      message:
        message ||
        "Invalid data provided. Requires {string: table_name, number: capacity}",
    });
  }
};

/**
 * Validates that the specified table_id has an object in the db
 * @module table
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {Number} req.params.table_id - table_id of the table to be searched
 * @return {undefined}
 */
const tableExists = (req, res, next) => {
  service
    .read(req.params.table_id)
    .then((table) => {
      if (table.length > 0) {
        res.locals.table = table[0];
        return next();
      }
      next({ status: 404, message: `Table ${req.params.table_id} cannot be found.` });
    })
    .catch(next);
};

/**
 * Validates that the reservation associated with the table exists in the db
 * @module table
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {Number} req.body.data.reservation_id - ID of reservation to be checked
 * @param {Number} res.locals.table.table_id - ID of the associated table obj
 * @return {undefined}
 */
const reservationExists = (req, res, next) => {
  if (req.body.data.reservation_id) {
    const { reservation_id } = req.body.data;
    service
    .readReservation(reservation_id)
    .then((reserv) => {
      if (reserv.length > 0) {
        res.locals.reservation = reserv[0];
        return next();
      }
      next({
        status: 404,
        message: `Reservation ${reservation_id} cannot be found.`,
      });
    })
    .catch((e) => next({ status: 400, message: e.message }));
  } else {
    next({
      status: 400,
      message: `table_id: ${res.locals.table.table_id}, reservation_id: undefined`
    })
  }
};

/**
 * Validates that the table capacity is sufficient to hold reservation size
 * @module table
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {Object} res.locals.reservation - contextual reservation object
 * @param {Object} res.locals.table - contextual table object
 * @return {undefined}
 */
const hasSufficientCapacity = (req, res, next) => {
  let { people } = res.locals.reservation;
  let { capacity } = res.locals.table;

  let isSufficient = capacity >= people;

  if (isSufficient) {
    return next();
  } else {
    return next({
      status: 400,
      message: "Insufficient table capacity for reservation.",
    });
  }
};

/**
 * Validates that the table is not currently occupied
 * @module table
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {Object} res.locals.table - contextual table object
 * @return {undefined}
 */
const isVacant = (req, res, next) => {
  if (!res.locals.table.reservation_id) {
    return next();
  } else {
    return next({
      status: 400,
      message: "Table currently occupied. Select another table.",
    });
  }
};

/**
 * Validates that the table is currently occupied
 * @module table
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {Object} res.locals.table - contextual table object
 * @return {undefined}
 */
function isOccupied(req, res, next) {
  if (res.locals.table.reservation_id) {
    return next();
  } else {
    return next({
      status: 400,
      message: "Table currently not occupied. Select another table.",
    });
  }
}

/**
 * Validates that the reservation is not currently seated
 * @module table
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {String} res.locals.reservation.status - status of contextual reservation
 * @return {undefined}
 */
function isNotSeated(req, res, next) {
  if (res.locals.reservation.status !== "seated") {
    next();
  } else {
    next({
      status: 400,
      message: "Cannot seat a reservation that's already seated."
    });
  }
}

// Middleware fxns ==========================================================

// GET /tables
async function list(req, res) {
  let tables = await service.listAll();

  if (tables.length > 1) {
    tables = tables.sort((a, b) => a.table_name.localeCompare(b.table_name));
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
  let newReservationData = res.locals.reservation;
  newReservationData.status = "seated";
  await reservationsService.update(
      newReservationData,
      newReservationData.reservation_id
    );
  res.json({ data: await service.update(newTableData, newTableData.table_id) });
}

// DELETE /tables/:table_id/seat
async function reset(req, res) {
  let newTableData = res.locals.table;
  const foundReservation = await reservationsService.readReservation(newTableData.reservation_id);
  let resID = newTableData.reservation_id;
  let newReservationData = {
    ...foundReservation.first_name,
    ...foundReservation.last_name,
    ...foundReservation.mobile_number,
    ...foundReservation.reservation_date,
    ...foundReservation.reservation_time,
    ...foundReservation.people,
    "status": "finished"
  }
  await reservationsService.update(newReservationData, resID);
  newTableData.reservation_id = null;
  res.json({ data: await service.update(newTableData, newTableData.table_id) });
}

module.exports = {
  list,
  create: [
    asyncErrorBoundary(hasAllValidProperties),
    asyncErrorBoundary(hasValidTableData),
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(tableExists), asyncErrorBoundary(read)],
  seat: [
    asyncErrorBoundary(hasData),
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(hasSufficientCapacity),
    asyncErrorBoundary(isNotSeated),
    asyncErrorBoundary(isVacant),
    asyncErrorBoundary(seat),
  ],
  reset: [
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(isOccupied),
    asyncErrorBoundary(reset),
  ],
};
