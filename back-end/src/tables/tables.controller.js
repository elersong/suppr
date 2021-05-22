/**
 * List handler for table resources
 */
const service = require("./tables.service");

// Helper fxns ==============================================================

const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// Validation fxns ==========================================================

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

function tableExists(req, res, next) {
  service
    .read(req.params.table_id)
    .then((table) => {
      if (table) {
        res.locals.table = table;
        return next();
      }
      next({ status: 404, message: `Table cannot be found.` });
    })
    .catch(next);
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


module.exports = {
  list,
  create: [hasAllValidProperties, hasValidTableData, asyncErrorBoundary(create)],
  read: [tableExists, asyncErrorBoundary(read)]
};