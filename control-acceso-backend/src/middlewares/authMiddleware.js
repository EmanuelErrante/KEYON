const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;  // Agrega los datos del usuario al request
        next();  // Continúa con la siguiente función
    } catch (error) {
        res.status(400).json({ mensaje: 'Token inválido.' });
    }
};

module.exports = authMiddleware;


