
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

const addUserToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { email, role } = req.body; // El admin envía el email del usuario a agregar
    const adminId = req.usuario.id;

    console.log('--- Iniciando proceso de agregar usuario a grupo ---');
    console.log('Admin solicitante:', adminId);
    console.log('Grupo ID:', groupId);
    console.log('Email del usuario:', email);
    console.log('Rol solicitado:', role);

    // Validar que el rol sea válido
    const validRoles = ['usuario', 'colaborador', 'admin','inspector'];
    if (!validRoles.includes(role)) {
      console.log('Error: Rol no válido.');
      return res.status(400).json({ message: 'Rol no válido.' });
    }

    // Buscar el grupo
    const group = await Group.findById(groupId);
    if (!group) {
      console.log('Error: Grupo no encontrado.');
      return res.status(404).json({ message: 'Grupo no encontrado.' });
    }

    console.log('Grupo encontrado:', group);

    // Verificar que el usuario que hace la solicitud es admin del grupo
    if (!group.admins.some(admin => admin.toString() === adminId)) {
      console.log('Acceso denegado: Solo los admins pueden agregar usuarios.');
      return res.status(403).json({ message: 'Solo los administradores pueden agregar usuarios.' });
    }

    // Buscar el usuario en la BD por email
    let user = await User.findOne({ email });

    if (!user) {
      console.log('Usuario no registrado. Aquí iría la lógica de invitaciones.');
      // 🔹 Aquí se debería crear una invitación pendiente para que el usuario se registre
      return res.status(404).json({ message: 'El usuario no está registrado. Implementar invitaciones en el futuro.' });
    }

    console.log('Usuario encontrado:', user);

    // Verificar si el usuario ya está en el grupo
    const existingRole = user.groupRoles.find(gr => gr.groupId.toString() === groupId);

    if (existingRole) {
      console.log('Error: Usuario ya pertenece al grupo.');
      return res.status(400).json({ message: 'El usuario ya pertenece a este grupo.' });
    }

   // Lógica corregida
if (role === 'usuario') {
  console.log('Agregando usuario normal al grupo...');
  user.groupRoles.push({ groupId, role: 'usuario' });
} else if (role === 'admin') {
  console.log('Agregando administrador al grupo...');
  group.admins.push(user._id);
  user.groupRoles.push({ groupId, role: 'admin' });
} else if (role === 'colaborador') {
  console.log('Agregando colaborador al grupo...');
  user.groupRoles.push({ groupId, role: 'colaborador' });
  // Aquí podríamos crear automáticamente un subgrupo si es necesario
} else if (role === 'inspector') {
  console.log('Agregando inspector al grupo...');
  user.groupRoles.push({ groupId, role: 'inspector' });
}

    // Guardar cambios en el usuario y en el grupo
    await user.save();
    await group.save();

    console.log('Usuario agregado correctamente al grupo.');
    res.status(200).json({ message: 'Usuario agregado al grupo con éxito.', user });

  } catch (error) {
    console.error('Error en addUserToGroup:', error);
    res.status(500).json({ message: 'Error al agregar usuario al grupo', error: error.message });
  }
};

const removeUserFromGroup = async (req, res) => {
  try {
    const { groupId, userId } = req.params; // Admin pasa el ID del usuario a eliminar
    const adminId = req.usuario.id;

    console.log('--- Iniciando eliminación de usuario del grupo ---');
    console.log('Admin solicitante:', adminId);
    console.log('Grupo ID:', groupId);
    console.log('Usuario a eliminar:', userId);

    // Buscar el grupo
    const group = await Group.findById(groupId);
    if (!group) {
      console.log('Error: Grupo no encontrado.');
      return res.status(404).json({ message: 'Grupo no encontrado.' });
    }

    console.log('Grupo encontrado:', group);

    // Verificar que el usuario que hace la solicitud es admin del grupo
    if (!group.admins.some(admin => admin.toString() === adminId)) {
      console.log('Acceso denegado: Solo los admins pueden eliminar usuarios.');
      return res.status(403).json({ message: 'Solo los administradores pueden eliminar usuarios.' });
    }

    // Buscar el usuario a eliminar
    const user = await User.findById(userId);
    if (!user) {
      console.log('Error: Usuario no encontrado.');
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    console.log('Usuario encontrado:', user);

    // Verificar si el usuario está en el grupo
    const userRoleIndex = user.groupRoles.findIndex(gr => gr.groupId.toString() === groupId);
    if (userRoleIndex === -1) {
      console.log('Error: Usuario no pertenece a este grupo.');
      return res.status(400).json({ message: 'El usuario no pertenece a este grupo.' });
    }

    const userRole = user.groupRoles[userRoleIndex].role;
    console.log(`Usuario tiene rol en el grupo: ${userRole}`);

    // Si es admin, verificar que no sea el último admin
    if (userRole === 'admin') {
      if (group.admins.length === 1) {
        console.log('Error: No se puede eliminar el último admin del grupo.');
        return res.status(403).json({ message: 'No se puede eliminar el último administrador del grupo.' });
      }
      console.log('Eliminando usuario de admins del grupo...');
      group.admins = group.admins.filter(adminId => adminId.toString() !== userId);
    }

    // Si es colaborador, eliminar su subgrupo asociado
    if (userRole === 'colaborador') {
      console.log('Eliminando subgrupo asociado al colaborador...');
      await SubGroup.deleteMany({ collaborator: userId, groupId });
    }

    // Eliminar el usuario del grupo en su modelo de usuario
    console.log('Eliminando usuario del grupo en su perfil...');
    user.groupRoles.splice(userRoleIndex, 1);

    // Guardar cambios
    await user.save();
    await group.save();

    console.log('Usuario eliminado correctamente del grupo.');
    res.status(200).json({ message: 'Usuario eliminado del grupo con éxito.' });

  } catch (error) {
    console.error('Error en removeUserFromGroup:', error);
    res.status(500).json({ message: 'Error al eliminar usuario del grupo', error: error.message });
  }
};




module.exports = { deleteGroup };

module.exports = {
  createGroup,
  updateGroup,
  deleteGroup,
  addUserToGroup,
  removeUserFromGroup,
};
