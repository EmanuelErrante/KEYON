const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const usuarioExistente = await User.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);  

        const nuevoUsuario = new User({
            name,
            email,
            password: hashedPassword,
                      
        });

        await nuevoUsuario.save();

     

        res.status(201).json({ mensaje: 'Usuario registrado'});
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al registrar usuario', error });
    }
};

exports.login = async (req, res) => {
    console.log("BODY RECIBIDO:", req.body);  // Ver qué está llegando realmente

    const { email, password } = req.body;

    try {
        const usuario = await User.findOne({ email });
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        console.log("Usuario encontrado:", usuario.email);

        const isMatch = await bcrypt.compare(password, usuario.password);
        console.log("Password Match:", isMatch);  // Ver si la contraseña es correcta

        if (!isMatch) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

        // Generar el token
        let token = jwt.sign(
            { id: usuario._id, email: usuario.email, rolGlobal: usuario.rolGlobal },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Si el token ya tiene "Bearer ", se limpia antes de enviarlo
        if (token.startsWith("Bearer ")) {
            token = token.slice(7);
        }

        res.json({ mensaje: 'Inicio de sesión exitoso', token, nombre: usuario.nombre });
    } catch (error) {
        console.error("Error en login:", error);  // Registrar errores en consola
        res.status(500).json({ mensaje: 'Error al iniciar sesión', error });
    }
};
