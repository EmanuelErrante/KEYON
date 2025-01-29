const User = require('../models/User');

const getUserMemberships = async (req, res) => {
  try {
    const userId = req.usuario.id;

    console.log(`📌 Obteniendo afiliaciones del usuario: ${userId}`);

    // Buscar al usuario y poblar dinámicamente los grupos/subgrupos usando refPath
    const user = await User.findById(userId)
      .populate('groupRoles.groupId', 'name') // Mongoose usa refPath para resolver
      .select('groupRoles');

    if (!user) {
      console.log("❌ Usuario no encontrado en la base de datos.");
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log("🔍 Datos después de populate:", JSON.stringify(user, null, 2));

    // Validar que groupRoles tenga datos y no contenga valores nulos
    if (!user.groupRoles || user.groupRoles.length === 0) {
      console.log("⚠️ El usuario no tiene grupos ni subgrupos asignados.");
      return res.status(200).json([]);
    }

    // Filtrar y mapear los datos para evitar errores con groupId nulo
    const memberships = user.groupRoles
      .filter(membership => membership.groupId) // Evitar registros inválidos
      .map(membership => ({
        _id: membership.groupId._id.toString(),
        name: membership.groupId.name || 'Nombre no encontrado',
        role: membership.role,
        type: membership.type // 'group' o 'subgroup'
      }));

    console.log(`✅ Afiliaciones obtenidas correctamente para el usuario ${userId}`);

    res.status(200).json(memberships);
  } catch (error) {
    console.error('❌ Error obteniendo afiliaciones del usuario:', error);
    res.status(500).json({ message: 'Error obteniendo afiliaciones del usuario', error: error.message });
  }
};

module.exports = { getUserMemberships };
