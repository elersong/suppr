/**
 * Defines the router for table resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./tables.controller");
const notAllowed = require('../errors/methodNotAllowed')

router.route("/:table_id/seat").put(controller.seat).delete(controller.reset).all(notAllowed)
router.route("/").get(controller.list).post(controller.create).all(notAllowed);

module.exports = router;
