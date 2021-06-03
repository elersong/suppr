/**
 * List handler for reservation resources
 */
const service = require("./reservations.service");

// Helper fxns ==============================================================

const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// Validation fxns ==========================================================

/**
 * Validates that req.body.data has the specified non-falsey properties.
 * @module reservations
 * @function
 * @param properties
 * @return {undefined}
 */
const hasAllValidProperties = require("../errors/hasProperties")(
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people"
);

/**
 * Validates that the req.body.data has the proper data types and formats
 * @module reservations
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {String} req.body.data.reservation_date - Selected date of reservation obj
 * @param {String} req.body.data.reservation_time - Selected time of reservation obj
 * @param {Number} req.body.data.people - Selected party size of reservation obj
 * @return {undefined}
 */
const hasValidReservationData = (req, res, next) => {
  const {
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
  } = req.body.data;

  let message;

  const dateFormat = /\d\d\d\d-\d\d-\d\d/;
  const timeFormat = /\d\d:\d\d/;

  const dateFormatIsValid = reservation_date.match(dateFormat)?.length > 0;
  const timeIsValid = reservation_time.match(timeFormat)?.length > 0;
  const peopleIsValid = typeof people === "number";

  const dateIsValid =
    new Date(reservation_date).getDay() !== 1 &&
    Date.parse(`${reservation_date} ${reservation_time}`) >= Date.now();

  if (dateFormatIsValid && timeIsValid && !dateIsValid) {
    message = "Restaurant closed. Date must be any future non-Tuesday.";
  }

  if (dateFormatIsValid && dateIsValid && timeIsValid && peopleIsValid) {
    next();
  } else {
    next({
      status: 400,
      message:
        message ||
        "Invalid data format provided. Requires {string: [first_name, last_name, mobile_number], date: reservation_date, time: reservation_time, number: people}",
    });
  }
};

/**
 * Validates that the time of the incoming request is inside business hours
 * @module reservations
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {String} req.body.data.reservation_time - Selected time of reservation
 * @param {String} req.body.data.reservation_date - Selected date of reservation
 * @return {undefined}
 */
const isDuringBusinessHours = (req, res, next) => {
  const { reservation_time, reservation_date } = req.body.data;

  // Cannot be before 10:30:00
  let afterOpen = reservation_time.localeCompare("10:30:00") === 1;

  // Cannot be after 21:30:00
  let beforeClose = reservation_time.localeCompare("21:30:00") === -1;

  // Cannot be in the past compared to current server time
  let inFuture;
  if (Date.parse(reservation_date) === Date.now()) {
    // middleware already checks futurism
    let today = new Date();
    let time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    inFuture = reservation_time.localeCompare(time) === 1;
  } else {
    inFuture = true;
  }

  if (afterOpen && beforeClose && inFuture) {
    next();
  } else {
    next({
      status: 400,
      message: "Reservation must be a future time between 10:30AM and 9:30PM.",
    });
  }
};

/**
 * Validates that the described reservation_id represents a non-"finished" obj in the db
 * @module reservations
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {String|Number} req.params.reservation_id - ID of the selected reservation
 * @return {undefined}
 */
function reservationExists(req, res, next) {
  service
    .readReservation(req.params.reservation_id)
    .then((reserv) => {
      if (reserv.length > 0 && reserv[0].status) {
        res.locals.reservation = reserv[0];
        return next();
      }
      next({ status: 404, message: `Reservation #${req.params.reservation_id} cannot be found.` });
    })
    .catch(next);
}

/**
 * Validates that reservation in db doesn't have a status of "finished"
 * @module reservations
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {String|Number} req.params.reservation_id - ID of the selected reservation
 * @return {undefined}
 */
function isUnfinished(req, res, next) {
  service.readReservation(req.params.reservation_id)
    .then(reservation => {
      if (reservation.length > 0 && reservation[0].status !== "finished") {
        next()
      } else {
        next({
          status: 400,
          message: "Cannot modify a finished reservation."
        })
      }
    })
}

/**
 * Validates that the described reservation has a 'status' property of 'booked'
 * @module reservations
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {String} req.body.data.status - The string "booked"
 * @return {undefined}
 */
function hasBookedStatus(req, res, next) {
  if (req.body.data.status === "booked") {
    next();
  } else {
    next({
      status: 400,
      message: "Only reservations with status 'booked' can be edited.",
    });
  }
}

/**
 * Validates that incoming data doesn't have status of "finished", "seated"
 * @module reservations
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {String} req.body.data.status - The status string of incoming data
 * @return {undefined}
 */
function missingInvalidStatus(req, res, next) {
  if (!["finished", "seated"].includes(req.body.data.status)) {
    next();
  } else {
    next({
      status: 400,
      message: "New reservations cannot have status values of 'seated' or 'finished'."
    })
  }
}

/**
 * Validates that incoming data has a valid status string
 * @module reservations
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {String} req.body.data.status - The status string of incoming data
 * @return {undefined}
 */
function noCrazyStatus(req, res, next) {
  if (["finished", "seated", "booked", "cancelled"].includes(req.body.data.status)) {
    next();
  } else {
    next({
      status: 400,
      message: `Status of data must be a valid value. Given: '${req.body.data.status}'`
    })
  }
}
// Middleware fxns ==========================================================

// GET /reservations
async function list(req, res) {
  let reservations;
  if (req.query.date) {
    reservations = await service.listByDate(req.query.date);
  } else if (req.query.mobile_number) {
    reservations = await service.search(req.query.mobile_number);
  } else {
    reservations = await service.listAll();
  }

  if (reservations.length > 1) {
    reservations = reservations.sort((a, b) =>
      a.reservation_time.localeCompare(b.reservation_time)
    );
  }

  res.json({ data: reservations.filter(res => res.status !== "finished") });
}

// POST /reservations
async function create(req, res) {
  let incomingData = req.body.data;
  res.status(201).json({ data: await service.create(incomingData) });
}

// GET /reservations/:reservation_id
async function read(req, res) {
  res.json({ data: res.locals.reservation });
}

// PUT /reservations/:reservation_id/status
async function updateStatus(req, res, options) {
  let newStatus = req.body.data.status || options.status;
  let newReservationData = res.locals.reservation || options.reservation;
  newReservationData.status = newStatus;
  res.json({
    data: await service.update(
      newReservationData,
      newReservationData.reservation_id
    ),
  });
}

// PUT /reservations/:reservation_id
async function updateReservation(req, res) {
  let newReservationData = req.body.data;
  res.json({
    data: await service.update(
      newReservationData,
      newReservationData.reservation_id
    ),
  });
}

module.exports = {
  list,
  create: [
    asyncErrorBoundary(hasAllValidProperties),
    asyncErrorBoundary(hasValidReservationData),
    asyncErrorBoundary(isDuringBusinessHours),
    asyncErrorBoundary(missingInvalidStatus),
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
  reservationExists,
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(noCrazyStatus),
    asyncErrorBoundary(isUnfinished),
    asyncErrorBoundary(updateStatus),
  ],
  updateReservation: [
    asyncErrorBoundary(hasAllValidProperties),
    asyncErrorBoundary(hasValidReservationData),
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(isUnfinished),
    asyncErrorBoundary(hasBookedStatus),
    asyncErrorBoundary(updateReservation),
  ],
};
