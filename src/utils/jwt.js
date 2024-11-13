const jwt = require("jsonwebtoken");

//crear una llave con el id y el ROL del usuario
const generateSing = (id, rol) => {

    return jwt.sign({ id, rol }, process.env.JWT_SECRET, { expiresIn: "30d"});

}

//comprobar si una llave es de confianza
const verifyJwt = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}

//toma el id del token del usuario que se ha identificado
const authenticateToken = (req, res, next) => {
    // Obtener el token del header Authorization
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // Verificar el token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token no válido' });
        }

        // Almacenar el id del usuario decodificado en la request
        req.userId = decoded.id;
        next();
    });
};

module.exports = { generateSing, verifyJwt, authenticateToken }