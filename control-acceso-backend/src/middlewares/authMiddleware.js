/*const jwt = require('jsonwebtoken');

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

module.exports = authMiddleware;*/


const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Captura el token del header Authorization (independiente de mayúsculas/minúsculas)
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    // Verifica si se proporciona el token
    if (!authHeader) {
        return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    // Extrae el token y elimina 'Bearer' si está presente
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]  // Si tiene Bearer, extrae solo el token
        : authHeader;               // Si no tiene Bearer, usa el valor completo

    try {
        // Verifica el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;  // Guarda el usuario decodificado para futuras validaciones
        next();
    } catch (error) {
        res.status(403).json({ mensaje: 'Token inválido o expirado.' });
    }
};

module.exports = authMiddleware;
