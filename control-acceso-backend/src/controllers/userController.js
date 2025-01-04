const User = require('../models/User');
const bcrypt = require('bcrypt');
const UserLog = require('../models/UserLog');

// Obtener todos los usuarios (solo super_admin puede ver todos)
exports.getAllUsers = async (req, res) => { 
    try {
        const usuarios = await User.find().populate('rolesPorGrupo.grupoId');
        res.json(usuarios);
    } catch (error) {
       console.error('Error al obtener usuarios:', error);  // Log completo del error en consola
        res.status(500).json({ 
            mensaje: 'Error al obtener usuarios', 
           // error: error.message,  // Mensaje específico del error
          //  stack: error.stack  // Traza completa para depuración
        });
    }
};


// Crear un nuevo usuario
exports.createUser = async (req, res) => {
    const { nombre, email, password, identificacion, rolesPorGrupo, rolGlobal } = req.body;

    try {
        // Verificar si el email ya existe
        const usuarioExistente = await User.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

      

        const nuevoUsuario = new User({
            nombre,
            email,
            password: hashedPassword,
            identificacion,
            rolGlobal: rolGlobal || 'usuario',  // Agregar rolGlobal
            rolesPorGrupo,
           
        });

        await nuevoUsuario.save();

        // Crear log de usuario
        await UserLog.create({
            usuarioId: nuevoUsuario._id,
            accion: 'creado',
            realizadoPor: req.usuario ? req.usuario.id : 'Sistema'
        });

        res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario: nuevoUsuario });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear usuario', error });
    }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
    try {
        const usuario = await User.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        await User.findByIdAndDelete(req.params.id);

        // Log de eliminación
        await UserLog.create({
            usuarioId: usuario._id,
            accion: 'eliminado',
            realizadoPor: req.usuario.id
        });

        res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar usuario', error });
    }
};

// Actualizar roles por grupo
exports.updateUserRole = async (req, res) => {
    const { grupoId, rol } = req.body;
    const userId = req.params.id;

    try {
        const usuario = await User.findById(userId);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const rolExistente = usuario.rolesPorGrupo.find(r => r.grupoId.toString() === grupoId);

        if (rolExistente) {
            rolExistente.rol = rol;
        } else {
            usuario.rolesPorGrupo.push({ grupoId, rol });
        }

        await usuario.save();

        // Log de actualización
        await UserLog.create({
            usuarioId: usuario._id,
            accion: 'rol_actualizado',
            realizadoPor: req.usuario.id
        });

        res.json({ mensaje: 'Rol actualizado correctamente', usuario });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar rol', error });
    }
};
