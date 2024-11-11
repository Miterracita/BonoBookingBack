// const { isAuth, isAdmin } = require("../../middlewares/auth");
const upload = require('../../middlewares/file');
const { registro, login, deleteUser, getUsers, updateUser, searchUsers } = require("../controllers/user");
const userRoutes = require("express").Router();

userRoutes.post("/registro", upload.single('imagenPerfil'), registro);
userRoutes.post("/login", login);

//isAdmin nos limina a sólo el tipo de usuario indicado en el middlewares (admin) pueda o no ejecutar esta función

// userRoutes.delete("/:id", [isAdmin], deleteUser);
// userRoutes.put("/:id", [isAuth], upload.single('imagenPerfil'), updateUser);

userRoutes.delete("/:id", deleteUser);
userRoutes.put("/:id", upload.single('imagenPerfil'), updateUser);
userRoutes.get("/users-list", getUsers);

//rutas para filtros
userRoutes.get('/search', searchUsers);

module.exports = userRoutes;