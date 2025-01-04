const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;  // Añadimos el usuario decodificado al request para futuras validaciones
        next();
    } catch (error) {
        res.status(400).json({ mensaje: 'Token inválido.' });
    }
};

module.exports = authMiddleware;


