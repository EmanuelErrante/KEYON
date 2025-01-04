const Grupo = require('../models/Grupo');

// Middleware para verificar permisos de roles
const roleMiddleware = (rolesPermitidos) => {
    return async (req, res, next) => {
        const { usuario } = req;

        if (!usuario) {
            return res.status(401).json({ mensaje: 'Acceso denegado. Token no válido o expirado.' });
        }

        // Si el usuario es super_admin, omite verificaciones
        if (usuario.rolGlobal === 'super_admin') {
            return next();
        }

        // Obtener el grupo desde los parámetros o el cuerpo
        const grupoId = req.params.grupoId || req.body.grupoId || req.params.id;

        try {
            const grupo = await Grupo.findById(grupoId);
            if (!grupo) {
                return res.status(404).json({ mensaje: 'Grupo no encontrado' });
            }

            // Verificar el rol del usuario en el grupo
            const usuarioEnGrupo = grupo.usuariosConRoles.find(u =>
                u.usuarioId.toString() === usuario.id
            );

            if (!usuarioEnGrupo || !rolesPermitidos.includes(usuarioEnGrupo.rol)) {
                return res.status(403).json({
                    mensaje: 'Acceso prohibido. Rol insuficiente.',
                    rolUsuario: usuarioEnGrupo ? usuarioEnGrupo.rol : 'Sin rol',
                    rolesRequeridos: rolesPermitidos
                });
            }

            next();
        } catch (error) {
            res.status(500).json({ mensaje: 'Error en la verificación de permisos', error });
        }
    };
};

module.exports = roleMiddleware;
