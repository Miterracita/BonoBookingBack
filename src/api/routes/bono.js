// const { isAuth, isAdmin } = require("../../middlewares/auth");
const { newBono, deleteBono, getBonos, updateBono, searchBonos } = require("../controllers/bono");
const bonoRoutes = require("express").Router();

bonoRoutes.post("/new-bono", newBono);
// bonoRoutes.delete("/:id", [isAdmin], deleteBono);
// bonoRoutes.put("/:id", [isAuth], updateBono);
bonoRoutes.delete("/:id", deleteBono);
bonoRoutes.put("/:id", updateBono);
bonoRoutes.get("/bono-list", getBonos);

//rutas para filtros
bonoRoutes.get("/search", searchBonos);

module.exports = bonoRoutes;