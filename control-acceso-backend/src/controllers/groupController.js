
const Group = require('../models/Group');
const User = require('../models/User');

// Crear un nuevo grupo sin transacciones
const createGroup = async (req, res) => {
  try {
    console.log("🔍 BODY RECIBIDO:", req.body);  // 📌 Verifica qué llega realmente

    const { name, description, type, isUnlimited, startDate, endDate, coordenadas } = req.body;
    const userId = req.usuario?.id;  // 📌 Usamos `?.` por si `usuario` es `undefined`

    if (!name || !type) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const existingGroup = await Group.findOne({ name, admins: userId });
    if (existingGroup) {
      return res.status(400).json({ message: "Ya tienes un grupo con este nombre." });
    }

    const group = await Group.create({
      name,
      description,
      type,
      isUnlimited,
      startDate,
      endDate,
      admins: [userId],
      coordenadas
    });

     // Actualizar el usuario
     await User.findByIdAndUpdate(userId, {
      $push: {
        groupRoles: {
          groupId: group._id,
          role: 'admin',
        },
      },
    });



    console.log("✅ Grupo creado con éxito:", group);
    
    res.status(201).json(group);
  } catch (error) {
    console.error("❌ Error en createGroup:", error);
    res.status(500).json({ message: "Error al crear el grupo", error });
  }
};

// Actualizar un grupo por ID
const updateGroup = async (req, res) => {
  try {
    console.log("🔍 BODY RECIBIDO PARA UPDATE:", req.body);

    const { groupId } = req.params;
    const { name, description, type, isUnlimited, startDate, endDate, coordenadas } = req.body;
    const userId = req.usuario?.id;

    // Verificar que el grupo existe
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    // Verificar si el usuario es admin del grupo
    if (!group.admins.includes(userId)) {
      return res.status(403).json({ message: "No tienes permisos para actualizar este grupo" });
    }

    // Actualizar solo los campos enviados en la solicitud
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        $set: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(type !== undefined && { type }),
          ...(isUnlimited !== undefined && { isUnlimited }),
          ...(startDate !== undefined && { startDate }),
          ...(endDate !== undefined && { endDate }),
          ...(coordenadas !== undefined && { coordenadas })
        }
      },
      { new: true } // Devuelve el grupo actualizado
    );

    console.log("✅ Grupo actualizado con éxito:", updatedGroup);
    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("❌ Error en updateGroup:", error);
    res.status(500).json({ message: "Error al actualizar el grupo", error });
  }
};

module.exports = { updateGroup };

// Eliminar un grupo por ID
const deleteGroup = async (req, res) => {
  try {
    console.log("🔍 Solicitud para eliminar grupo con ID:", req.params.groupId);

    const { groupId } = req.params;
    const userId = req.usuario?.id;

    // Verificar que el grupo existe
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    // Verificar si el usuario es admin del grupo
    if (!group.admins.includes(userId)) {
      return res.status(403).json({ message: "No tienes permisos para eliminar este grupo" });
    }

    // Eliminar el grupo
    await Group.findByIdAndDelete(groupId);

    // Remover la referencia del grupo en los usuarios que eran parte de él
    await User.updateMany(
      { "groupRoles.groupId": groupId },
      { $pull: { groupRoles: { groupId } } }
    );

    console.log("✅ Grupo eliminado con éxito:", groupId);
    res.status(200).json({ message: "Grupo eliminado exitosamente" });
  } catch (error) {
    console.error("❌ Error en deleteGroup:", error);
    res.status(500).json({ message: "Error al eliminar el grupo", error });
  }
};

module.exports = { deleteGroup };

module.exports = {
  createGroup,
  updateGroup,
  deleteGroup,
};
