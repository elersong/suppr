/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./reservations.controller");
const notAllowed = require('../errors/methodNotAllowed')

router.route("/").get(controller.list).all(notAllowed);
router.route("/new").post(controller.create).all(notAllowed);

module.exports = router;
