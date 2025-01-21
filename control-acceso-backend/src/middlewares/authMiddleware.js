const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // Verificar el token usando la misma clave que en el controlador de login
    console.log(token);
    console.log(process.env.JWT_SECRET);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    if (!decoded.id) {
      return res.status(401).json({ message: 'Token inválido o faltan datos.' });
    }

    // Buscar el usuario en la base de datos con los datos necesarios
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Agregar el usuario completo al request
    req.usuario = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado.', error });
  }
};

module.exports = authMiddleware;
