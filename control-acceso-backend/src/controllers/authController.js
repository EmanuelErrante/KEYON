const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { nombre, email, password, identificacion } = req.body;

    try {
        const usuarioExistente = await User.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const nuevoUsuario = new User({
            nombre,
            email,
            password: hashedPassword,
            identificacion,
            rolGlobal: 'usuario'  // Por defecto, los usuarios se crean como 'usuario'
        });

        await nuevoUsuario.save();

        // Crear token
        const token = jwt.sign(
            { id: nuevoUsuario._id, email: nuevoUsuario.email, rolGlobal: nuevoUsuario.rolGlobal },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ mensaje: 'Usuario registrado', token });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al registrar usuario', error });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const usuario = await User.findOne({ email });
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(password, usuario.password);
        if (!isMatch) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

        const token = jwt.sign(
            { id: usuario._id, email: usuario.email, rolGlobal: usuario.rolGlobal },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ mensaje: 'Inicio de sesión exitoso', token });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al iniciar sesión', error });
    }
};
