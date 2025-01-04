const UserLog = require('../models/UserLog');

// Obtener logs de un usuario específico
exports.obtenerLogsPorUsuario = async (req, res) => {
    try {
        const logs = await UserLog.find({ usuarioId: req.params.usuarioId })
            .populate('realizadoPor', 'nombre email')
            .sort({ fecha: -1 });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener logs de usuario', error });
    }
};

// Obtener todos los logs (solo super_admin)
exports.obtenerTodosLosLogs = async (req, res) => {
    try {
        const logs = await UserLog.find()
            .populate('usuarioId', 'nombre email')
            .populate('realizadoPor', 'nombre email')
            .sort({ fecha: -1 });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener logs', error });
    }
};
