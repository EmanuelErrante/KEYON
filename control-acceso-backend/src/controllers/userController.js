const User = require('../models/User');
const bcrypt = require('bcrypt');
const UserLog = require('../models/UserLog');

// Obtener todos los usuarios (solo super_admin puede ver todos)
exports.getAllUsers = async (req, res) => {
    try {
        // Validar que el usuario tenga permisos de super_admin
        if (req.usuario.rolGlobal !== 'super_admin') {
            return res.status(403).json({ mensaje: 'No tienes permiso para ver todos los usuarios' });
        }

        const usuarios = await User.find().populate('rolesPorGrupo.grupoId');
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ mensaje: 'Error al obtener usuarios' });
    }
};

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
    const { nombre, email, password, identificacion, rolesPorGrupo, rolGlobal } = req.body;

    try {
        // Verificar si el email ya existe
        const usuarioExistente = await User.findOne({ email });
        if (usuarioExistente) {
            return res.status(422).json({ mensaje: 'El correo electrónico ya está registrado' });
        }

        const salt = await bcrypt.genSalt(12); // Aumentamos la longitud del salt
        const hashedPassword = await bcrypt.hash(password, salt);

        const nuevoUsuario = new User({
            nombre,
            email,
            password: hashedPassword,
            identificacion,
            rolGlobal: rolGlobal || 'usuario',
            rolesPorGrupo,
        });

        await nuevoUsuario.save();

        // Crear log de usuario
        await UserLog.create({
            usuarioId: nuevoUsuario._id,
            accion: 'creado',
            realizadoPor: req.usuario ? req.usuario.id : null,
        });

        res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario: nuevoUsuario });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ mensaje: 'Error al crear usuario' });
    }
};

// Eliminar usuario (colaboradores solo pueden eliminar usuarios de su subgrupo)
exports.deleteUser = async (req, res) => {
    try {
        const usuario = await User.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const { rolGlobal, rolesPorGrupo } = req.usuario; // Datos del usuario que realiza la acción

        // Verificar si el usuario es super_admin
        if (rolGlobal === 'super_admin') {
            await User.findByIdAndDelete(req.params.id);

            await UserLog.create({
                usuarioId: usuario._id,
                accion: 'eliminado',
                realizadoPor: req.usuario.id,
            });

            return res.json({ mensaje: 'Usuario eliminado correctamente' });
        }

        // Verificar si el usuario es colaborador y tiene permisos en el subgrupo
        const colaboradorPermiso = rolesPorGrupo.some((rol) => {
            return (
                rol.grupoId.toString() === req.body.grupoId && // Validar grupo
                rol.rol === 'colaborador' && // Solo colaboradores
                usuario.rolesPorGrupo.some((ur) => ur.grupoId.toString() === rol.grupoId) // Usuario pertenece al grupo/subgrupo
            );
        });

        if (!colaboradorPermiso) {
            return res
                .status(403)
                .json({ mensaje: 'No tienes permiso para eliminar este usuario' });
        }

        await User.findByIdAndDelete(req.params.id);

        await UserLog.create({
            usuarioId: usuario._id,
            accion: 'eliminado',
            realizadoPor: req.usuario.id,
        });

        res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ mensaje: 'Error al eliminar usuario' });
    }
};


// Actualizar roles por grupo (valida que colaboradores solo asignen rol usuario)
exports.updateUserRole = async (req, res) => {
    const { grupoId, rol } = req.body;
    const userId = req.params.id;

    try {
        const usuario = await User.findById(userId);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const { rolGlobal, rolesPorGrupo } = req.usuario; // Usuario que realiza la acción

        // Validar rol
        const rolesValidos = ['admin', 'colaborador', 'usuario'];
        if (!rolesValidos.includes(rol)) {
            return res.status(422).json({ mensaje: 'Rol inválido' });
        }

        // Verificar permisos del colaborador (solo rol usuario en su subgrupo)
        if (rolGlobal !== 'super_admin') {
            const colaboradorPermiso = rolesPorGrupo.some((r) => {
                return r.grupoId.toString() === grupoId && r.rol === 'colaborador';
            });

            if (!colaboradorPermiso || rol !== 'usuario') {
                return res
                    .status(403)
                    .json({ mensaje: 'No tienes permiso para asignar este rol' });
            }
        }

        const rolExistente = usuario.rolesPorGrupo.find((r) => r.grupoId.toString() === grupoId);

        if (rolExistente) {
            rolExistente.rol = rol;
        } else {
            usuario.rolesPorGrupo.push({ grupoId, rol });
        }

        await usuario.save();

        await UserLog.create({
            usuarioId: usuario._id,
            accion: 'rol_actualizado',
            realizadoPor: req.usuario.id,
        });

        res.json({ mensaje: 'Rol actualizado correctamente', usuario });
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        res.status(500).json({ mensaje: 'Error al actualizar rol' });
    }
};
