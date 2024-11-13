// const { isAuth, isAdmin } = require("../../middlewares/auth");
const upload = require('../../middlewares/file');
const { authenticateToken } = require ('../../utils/jwt'); 
const { registro, login, deleteUser, getUsers, updateUser, searchUsers, getUserById } = require("../controllers/user");
const userRoutes = require("express").Router();

userRoutes.post("/registro", upload.single('imagenPerfil'), registro);
userRoutes.post("/login", login);

//isAdmin nos limina a sólo el tipo de usuario indicado en el middlewares (admin) pueda o no ejecutar esta función

// userRoutes.delete("/:id", [isAdmin], deleteUser);
// userRoutes.put("/:id", [isAuth], upload.single('imagenPerfil'), updateUser);

userRoutes.delete("/:id", deleteUser);
userRoutes.put("/:id", upload.single('imagenPerfil'), updateUser);
userRoutes.get("/users-list", getUsers);
userRoutes.get("/me", authenticateToken, getUserById);

//rutas para filtros
userRoutes.get('/search', searchUsers);

module.exports = userRoutes;