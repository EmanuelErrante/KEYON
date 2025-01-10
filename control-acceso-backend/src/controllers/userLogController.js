const UserLog = require('../models/UserLog');

// Obtener logs de un usuario específico
exports.obtenerLogsPorUsuario = async (req, res) => {
    try {
        const { usuarioId } = req.params;

        // Validar que el usuario tenga permisos para ver logs
        if (
            req.usuario.rolGlobal !== 'super_admin' && 
            req.usuario.id !== usuarioId
        ) {
            return res.status(403).json({ mensaje: 'No tienes permiso para ver estos logs' });
        }

        const logs = await UserLog.find({ usuarioId })
            .populate('realizadoPor', 'nombre email')
            .sort({ fecha: -1 });

        res.json(logs);
    } catch (error) {
        console.error('Error al obtener logs de usuario:', error);
        res.status(500).json({ mensaje: 'Error al obtener logs de usuario' });
    }
};

// Obtener todos los logs (super_admin y admin de grupo)
exports.obtenerTodosLosLogs = async (req, res) => {
    try {
        const { grupoId } = req.query; // Grupo específico para filtrar logs
        const { rolGlobal, rolesPorGrupo } = req.usuario;

        // Validar que el usuario sea super_admin o admin del grupo
        if (rolGlobal !== 'super_admin') {
            const esAdminDelGrupo = rolesPorGrupo.some(
                (rol) => rol.grupoId.toString() === grupoId && rol.rol === 'admin'
            );

            if (!esAdminDelGrupo) {
                return res.status(403).json({ mensaje: 'No tienes permiso para ver estos logs' });
            }
        }

        // Paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Filtrar por grupo si se proporciona
        const filtro = grupoId ? { grupoId } : {};

        const logs = await UserLog.find(filtro)
            .populate('usuarioId', 'nombre email')
            .populate('realizadoPor', 'nombre email')
            .sort({ fecha: -1 })
            .skip(skip)
            .limit(limit);

        // Total de logs para paginación
        const totalLogs = await UserLog.countDocuments(filtro);

        res.json({
            total: totalLogs,
            page,
            pages: Math.ceil(totalLogs / limit),
            logs,
        });
    } catch (error) {
        console.error('Error al obtener logs:', error);
        res.status(500).json({ mensaje: 'Error al obtener logs' });
    }
};

// Obtener logs de un grupo específico (admins del grupo o super_admin)
exports.obtenerLogsPorGrupo = async (req, res) => {
    try {
        const { grupoId } = req.params;

        // Validar que el usuario sea admin del grupo o super_admin
        const { rolGlobal, rolesPorGrupo } = req.usuario;

        if (rolGlobal !== 'super_admin') {
            const esAdminDelGrupo = rolesPorGrupo.some(
                (rol) => rol.grupoId.toString() === grupoId && rol.rol === 'admin'
            );

            if (!esAdminDelGrupo) {
                return res.status(403).json({ mensaje: 'No tienes permiso para ver los logs de este grupo' });
            }
        }

        const logs = await UserLog.find({ grupoId })
            .populate('usuarioId', 'nombre email')
            .populate('realizadoPor', 'nombre email')
            .sort({ fecha: -1 });

        res.json(logs);
    } catch (error) {
        console.error('Error al obtener logs del grupo:', error);
        res.status(500).json({ mensaje: 'Error al obtener logs del grupo' });
    }
};
