/**
 * List handler for reservation resources
 */
const service = require("./reservations.service");

// Helper fxns ==============================================================

const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// Validation fxns ==========================================================

const hasAllValidProperties = require("../errors/hasProperties")(
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people"
);

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
  const peopleIsValid = typeof people === 'number'

  const dateIsValid = (new Date(reservation_date).getDay() !== 1) && (Date.parse(`${reservation_date} ${reservation_time}`) >= Date.now())

  if (dateFormatIsValid && !dateIsValid) {
    message = "Restaurant closed. Date must be any future non-Tuesday."
  }

  if (dateFormatIsValid && dateIsValid && timeIsValid && peopleIsValid) {
    next();
  } else {
    next({
      status: 400,
      message: message || "Invalid data format provided. Requires {string: [first_name, last_name, mobile_number], date: reservation_date, time: reservation_time, number: people}"
    });
  }
};

const isDuringBusinessHours = (req, res, next) => {
  const { reservation_time, reservation_date } = req.body.data;

  // Cannot be before 10:30:00
  let afterOpen = reservation_time.localeCompare('10:30:00') === 1

  // Cannot be after 21:30:00
  let beforeClose = reservation_time.localeCompare('21:30:00') === -1

  // Cannot be in the past compared to current server time
  let inFuture;
  if (Date.parse(reservation_date) === Date.now()) { // middleware already checks futurism
    let today = new Date();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    inFuture = reservation_time.localeCompare(time) === 1
  } else {
    inFuture = true;
  }
  

  if (afterOpen && beforeClose && inFuture) {
    next();
  } else {
    next({
      status: 400,
      message: "Reservation must be a future time between 10:30AM and 9:30PM."
    })
  }

}

function reservationExists(req, res, next) {
  service
    .readReservation(req.params.reservation_id)
    .then((reserv) => {
      if (reserv) {
        res.locals.reservation = reserv[0];
        return next();
      }
      next({ status: 404, message: `Reservation cannot be found.` });
    })
    .catch(next);
}

// Middleware fxns ==========================================================

// GET /reservations
async function list(req, res) {
  let reservations;
  if (req.query.date) {
    reservations = await service.listByDate(req.query.date);
  } else if (req.query.mobile_number) {
    reservations = await service.search(req.query.mobile_number)
  } else {
    reservations = await service.listAll();
  }
  
  if (reservations.length > 1) {
    reservations = reservations.sort((a,b) => a.reservation_time.localeCompare(b.reservation_time))
  }

  res.json({ data: reservations });
}

// POST /reservations
async function create(req, res) {
  let incomingData = req.body.data;
  res.status(201).json({ data: await service.create(incomingData) });
}

// GET /reservations/:reservation_id
async function read(req, res) {
  res.json({ data: res.locals.reservation })
}

// PUT /reservations/:reservation_id/status
async function updateStatus(req, res) {
  let newStatus = req.body.data.status;
  let newReservationData = res.locals.reservation;
  newReservationData.status = newStatus;
  res.json({ data: await service.update(newReservationData, newReservationData.reservation_id) });
}

module.exports = {
  list,
  create: [hasAllValidProperties, hasValidReservationData, isDuringBusinessHours, asyncErrorBoundary(create)],
  read: [reservationExists, asyncErrorBoundary(read)],
  reservationExists,
  updateStatus: [reservationExists, asyncErrorBoundary(updateStatus)]
};
