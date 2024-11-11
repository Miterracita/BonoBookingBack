const { isAuth, isAdmin } = require("../../middlewares/auth");
const { newReserva, getReservas, updateReserva, deleteReserva } = require("../controllers/booking");
const bookingRoutes = require("express").Router();

bookingRoutes.post("/new-booking", newReserva);
bookingRoutes.delete("/:id", [isAdmin], deleteReserva);
bookingRoutes.put("/:id", [isAuth], updateReserva);
bookingRoutes.get("/bookings-list", getReservas);

module.exports = bookingRoutes;