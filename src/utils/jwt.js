const jwt = require("jsonwebtoken");

//crear una llave con el id y el ROL del usuario
const generateSing = (id, rol) => {

    return jwt.sign({ id, rol }, process.env.JWT_SECRET, { expiresIn: "30d"});

}

//comprobar si una llave es de confianza
const verifyJwt = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { generateSing, verifyJwt }