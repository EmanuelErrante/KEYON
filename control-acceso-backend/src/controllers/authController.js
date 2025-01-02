const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { nombre, email, password, rol, grupo } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const usuario = new User({ nombre, email, password: hashedPassword, rol, grupo });
    await usuario.save();
    res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario', error });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
      console.log('Petición recibida:', req.body);
      const usuario = await User.findOne({ email });
      if (!usuario) {
          console.log('Usuario no encontrado:', email);
          return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }

      const isPasswordValid = await bcrypt.compare(password, usuario.password);
      if (!isPasswordValid) {
          console.log('Contraseña incorrecta para:', email);
          return res.status(401).json({ mensaje: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
          { id: usuario._id, email: usuario.email, rol: usuario.rol },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
      );

      console.log('Inicio de sesión exitoso:', email);
      res.status(200).json({ token, mensaje: 'Inicio de sesión exitoso' });
  } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      res.status(500).json({ 
          mensaje: 'Error al iniciar sesión', 
          error: error.message || 'Error desconocido' 
      });
  }
};

exports.getPerfil = (req, res) => {
  res.json({ mensaje: 'Ruta protegida', usuario: req.usuario });
};
