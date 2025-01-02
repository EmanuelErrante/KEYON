const roleMiddleware = (rolesPermitidos) => {
    return (req, res, next) => {
        const { usuario } = req;
        
        // Verificar si el usuario está autenticado
        if (!usuario) {
            return res.status(401).json({ mensaje: 'Acceso denegado. Token no válido o expirado.' });
        }

        // Verificar si el rol del usuario está en la lista de roles permitidos
        if (!rolesPermitidos.includes(usuario.rol)) {
            return res.status(403).json({ 
                mensaje: 'Acceso prohibido. Rol insuficiente.', 
                rolUsuario: usuario.rol, 
                rolesRequeridos: rolesPermitidos 
            });
        }

        next();
    };
};

module.exports = roleMiddleware;
