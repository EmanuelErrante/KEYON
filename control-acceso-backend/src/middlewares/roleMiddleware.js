

// Middleware para verificar permisos de roles
const roleMiddleware = (rolesPermitidos) => {
    return async (req, res, next) => {
        const { usuario } = req;
        const groupId = req.params.groupId;

        console.log('Usuario autenticado en roleMiddleware:', usuario);
        console.log('Group ID recibido:', groupId);

        if (!usuario) {
            return res.status(401).json({ message: 'Usuario no autenticado.' });
        }

        try {
            // Convertir groupId en ObjectId si es necesario
            const userRole = usuario.groupRoles.find(
                (gr) => gr.groupId.toString() === groupId.toString() // Comparación estricta
            );

            console.log('Rol encontrado:', userRole);

            if (!userRole || !rolesPermitidos.includes(userRole.role)) {
                return res.status(403).json({
                    message: 'Acceso prohibido. Rol insuficiente.',
                    userRole: userRole ? userRole.role : 'Sin rol',
                    requiredRoles: rolesPermitidos,
                });
            }

            next();
        } catch (error) {
            console.error('Error en roleMiddleware:', error);
            res.status(500).json({ message: 'Error en la verificación de permisos', error });
        }
    };
};

module.exports = roleMiddleware;
