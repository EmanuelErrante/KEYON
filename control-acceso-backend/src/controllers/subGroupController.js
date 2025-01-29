
const mongoose = require('mongoose');
const SubGroup = require('../models/SubGroup');
const Group = require('../models/Group'); 
const User = require('../models/User'); 



// Crear un nuevo subgrupo
const createSubgroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const groupId = req.params.groupId;
    const userId = req.usuario._id;

    // Validar campos requeridos
    if (!name || !description) {
      return res.status(400).json({ message: 'Name y description son obligatorios.' });
    }

    console.log('User ID:', userId);
    console.log('Group ID:', groupId);

    // Verificar si el grupo existe
    const group = await Group.findById(groupId);
    if (!group) {
      console.log('Error: Grupo no encontrado.');
      return res.status(404).json({ message: 'Grupo no encontrado.' });
    }

    console.log('Grupo encontrado:', group);

    // Verificar permisos
    if (!group.admins.some((adminId) => adminId.toString() === userId.toString())) {
      console.log('Error: Usuario sin permisos para crear subgrupos.');
      return res.status(403).json({ message: 'No tienes permisos para crear subgrupos en este grupo.' });
    }

    // Verificar si ya existe un subgrupo con el mismo nombre en el mismo grupo
    const existingSubgroup = await SubGroup.findOne({ name, groupId });
    if (existingSubgroup) {
      console.log('Error: Ya existe un subgrupo con el mismo nombre en este grupo.');
      return res.status(400).json({ message: 'Ya existe un subgrupo con este nombre en el grupo.' });
    }

    // Crear el subgrupo
    const subgroup = await SubGroup.create({ name, description, groupId });
    console.log('Subgrupo creado:', subgroup);

    // Agregar el subgrupo al array de subgrupos del grupo
    await Group.findByIdAndUpdate(
      groupId,
      { $push: { subgroups: subgroup._id } },
      { new: true }
    );

    console.log('Subgrupo agregado al grupo.');

    res.status(201).json(subgroup);
  } catch (error) {
    console.error('Error en createSubgroup:', error);
    res.status(500).json({ message: 'Error al crear el subgrupo', error: error.message });
  }
};

// Obtener todos los subgrupos de un grupo específico
const getSubgroupsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const subgroups = await Subgroup.find({ groupId }).populate('collaborator').populate('users');
    res.status(200).json(subgroups);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los subgrupos', error });
  }
};

// Actualizar un subgrupo por ID
const updateSubgroup = async (req, res) => {
  try {
    const { subgroupId } = req.params;
    const { name, description } = req.body;
    const userId = req.usuario.id;

    console.log('--- Inicio de actualización de Subgrupo ---');
    console.log('Usuario autenticado:', userId);
    console.log('Subgrupo ID recibido:', subgroupId);

    // Validar si el ID del subgrupo es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(subgroupId)) {
      console.log('Error: ID de subgrupo no válido');
      return res.status(400).json({ message: 'ID de subgrupo no válido.' });
    }

    // Buscar el subgrupo
    const subgroup = await SubGroup.findById(new mongoose.Types.ObjectId(subgroupId));

    if (!subgroup) {
      console.log('Error: Subgrupo no encontrado en la base de datos');
      return res.status(404).json({ message: 'Subgrupo no encontrado.' });
    }

    console.log('Subgrupo encontrado:', subgroup);

    // Buscar el grupo al que pertenece el subgrupo
    const group = await Group.findById(subgroup.groupId);

    if (!group) {
      console.log('Error: Grupo asociado al subgrupo no encontrado');
      return res.status(404).json({ message: 'Grupo no encontrado.' });
    }

    console.log('Grupo encontrado:', group);

    // Verificar si el usuario es admin del grupo
    const isAdmin = group.admins.some(adminId => adminId.toString() === userId);
    console.log('Es Admin?:', isAdmin);

    // Verificar si el usuario es colaborador del subgrupo
    const isCollaborator = subgroup.collaborator && subgroup.collaborator.toString() === userId;
    console.log('Es Colaborador?:', isCollaborator);

    // Si no es admin ni colaborador, rechazar la actualización
    if (!isAdmin && !isCollaborator) {
      console.log('Acceso denegado: El usuario no tiene permisos para actualizar este subgrupo.');
      return res.status(403).json({ message: 'No tienes permisos para actualizar este subgrupo.' });
    }

    // Actualizar solo los campos que se envían
    if (name) subgroup.name = name;
    if (description) subgroup.description = description;

    await subgroup.save();

    console.log('Subgrupo actualizado correctamente:', subgroup);

    res.status(200).json(subgroup);
  } catch (error) {
    console.error('Error en updateSubgroup:', error);
    res.status(500).json({ message: 'Error al actualizar el subgrupo', error: error.message });
  }
};

//Eliminar un subgrupo
const deleteSubgroup = async (req, res) => {
  try {
    const { subgroupId } = req.params;
    const userId = req.usuario.id;

    console.log('--- Iniciando eliminación del subgrupo ---');
    console.log('Subgrupo ID recibido:', subgroupId);
    console.log('Usuario autenticado:', userId);

    // Verificar si el ID del subgrupo es válido
    if (!mongoose.Types.ObjectId.isValid(subgroupId)) {
      console.log('Error: ID de subgrupo no válido.');
      return res.status(400).json({ message: 'ID de subgrupo no válido.' });
    }

    // Buscar el subgrupo
    const subgroup = await SubGroup.findById(subgroupId);
    if (!subgroup) {
      console.log('Error: Subgrupo no encontrado en la base de datos.');
      return res.status(404).json({ message: 'Subgrupo no encontrado.' });
    }

    console.log('Subgrupo encontrado:', subgroup);

    // Buscar el grupo al que pertenece el subgrupo
    const group = await Group.findById(subgroup.groupId);
    if (!group) {
      console.log('Error: Grupo asociado no encontrado.');
      return res.status(404).json({ message: 'Grupo no encontrado.' });
    }

    console.log('Grupo encontrado:', group);

    // Verificar si el usuario es admin del grupo
    const isAdmin = group.admins.some(adminId => adminId.toString() === userId);
    // Verificar si el usuario es colaborador del subgrupo
    const isCollaborator = subgroup.collaborator && subgroup.collaborator.toString() === userId;

    console.log('Es Admin?:', isAdmin);
    console.log('Es Colaborador del subgrupo?:', isCollaborator);

    // Si no es admin ni colaborador del subgrupo, no tiene permiso
    if (!isAdmin && !isCollaborator) {
      console.log('Acceso denegado: El usuario no tiene permisos para eliminar este subgrupo.');
      return res.status(403).json({ message: 'No tienes permisos para eliminar este subgrupo.' });
    }

    console.log('Eliminando referencias del subgrupo en los usuarios...');

    // Eliminar referencia del subgrupo en los usuarios
    await User.updateMany(
      { 'groupRoles.groupId': subgroupId },
      { $pull: { groupRoles: { groupId: subgroupId } } }
    );

    console.log('Eliminando referencia del subgrupo en el grupo...');

    // Eliminar referencia del subgrupo en el grupo padre
    await Group.findByIdAndUpdate(
      subgroup.groupId,
      { $pull: { subgroups: subgroupId } },
      { new: true }
    );

    console.log('Eliminando el subgrupo...');

    // Finalmente, eliminar el subgrupo
    await SubGroup.findByIdAndDelete(subgroupId);

    console.log('Subgrupo eliminado con éxito.');
    res.status(200).json({ message: 'Subgrupo eliminado con éxito.' });

  } catch (error) {
    console.error('Error al eliminar el subgrupo:', error);
    res.status(500).json({ message: 'Error al eliminar el subgrupo', error: error.message });
  }
};

const addUserToSubgroup = async (req, res) => {
  try {
    const { groupId, subgroupId } = req.params;
    const { email } = req.body;
    const requesterId = req.usuario.id;

    console.log('--- Iniciando proceso de agregar usuario a subgrupo ---');
    console.log('Usuario solicitante:', requesterId);
    console.log('Grupo ID:', groupId);
    console.log('Subgrupo ID:', subgroupId);
    console.log('Email del usuario:', email);

    // Buscar el grupo padre
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Grupo no encontrado.' });
    }

    console.log('Grupo encontrado:', group);

    // Buscar el subgrupo
    const subgroup = await SubGroup.findById(subgroupId);
    if (!subgroup) {
      return res.status(404).json({ message: 'Subgrupo no encontrado.' });
    }

    console.log('Subgrupo encontrado:', subgroup);

    // Verificar si el solicitante es admin del grupo o colaborador de ese subgrupo
    const isAdmin = group.admins.includes(requesterId);
    const isCollaborator = subgroup.collaborator && subgroup.collaborator.toString() === requesterId;

    if (!isAdmin && !isCollaborator) {
      return res.status(403).json({ message: 'Solo los administradores o colaboradores pueden agregar usuarios.' });
    }

    // Buscar el usuario en la BD
    let user = await User.findOne({ email });

    if (!user) {
      console.log('Usuario no registrado. Aquí iría la lógica de invitaciones.');
      // 🔹 Lógica de invitación pendiente (implementar más adelante)
      return res.status(404).json({ message: 'El usuario no está registrado. Implementar invitaciones en el futuro.' });
    }

    console.log('Usuario encontrado:', user);

    // Verificar que el usuario NO sea un colaborador del grupo padre
    const isGroupCollaborator = user.groupRoles.some(gr => gr.groupId.toString() === groupId && gr.role === 'colaborador');
    if (isGroupCollaborator) {
      console.log('Error: Un colaborador del grupo padre no puede ser usuario de un subgrupo.');
      return res.status(400).json({ message: 'Un colaborador del grupo no puede ser usuario de un subgrupo.' });
    }

    // Verificar que el usuario no esté ya en este subgrupo
    const userInSubgroup = user.groupRoles.find(gr => gr.groupId.toString() === subgroupId);
    if (userInSubgroup) {
      console.log('Error: Usuario ya pertenece a este subgrupo.');
      return res.status(400).json({ message: 'El usuario ya pertenece a este subgrupo.' });
    }

    // Permitir que el usuario pertenezca a varios subgrupos del mismo grupo padre
    console.log('Agregando usuario al subgrupo...');
    user.groupRoles.push({ groupId: subgroupId, role: 'usuario', type: 'SubGroup' });

    console.log("🛠️ Datos antes de guardar:", JSON.stringify(user.groupRoles, null, 2));

    // Guardar cambios en la BD
    await user.save();

    console.log('Usuario agregado correctamente al subgrupo.');
    res.status(200).json({ message: 'Usuario agregado al subgrupo con éxito.', user });

  } catch (error) {
    console.error('Error en addUserToSubgroup:', error);
    res.status(500).json({ message: 'Error al agregar usuario al subgrupo', error: error.message });
  }
};


//Eliminar Usuario de Subgrupo
const removeUserFromSubgroup = async (req, res) => {
  try {
    const { groupId, subgroupId, userId } = req.params;
    const requesterId = req.usuario.id;

    console.log('--- Iniciando proceso de eliminar usuario de subgrupo ---');
    console.log('Usuario solicitante:', requesterId);
    console.log('Grupo ID:', groupId);
    console.log('Subgrupo ID:', subgroupId);
    console.log('Usuario a eliminar:', userId);

    // Buscar el grupo padre
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Grupo no encontrado.' });
    }

    console.log('Grupo encontrado:', group);

    // Buscar el subgrupo
    const subgroup = await SubGroup.findById(subgroupId);
    if (!subgroup) {
      return res.status(404).json({ message: 'Subgrupo no encontrado.' });
    }

    console.log('Subgrupo encontrado:', subgroup);

    // Verificar si el solicitante es admin del grupo o colaborador del subgrupo
    const isAdmin = group.admins.includes(requesterId);
    const isCollaborator = subgroup.collaborator && subgroup.collaborator.toString() === requesterId;

    if (!isAdmin && !isCollaborator) {
      return res.status(403).json({ message: 'Solo los administradores o colaboradores pueden eliminar usuarios.' });
    }

    // Buscar el usuario en la BD
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    console.log('Usuario encontrado:', user);

    // Verificar que el usuario pertenezca al subgrupo
    const userInSubgroup = user.groupRoles.find(gr => gr.groupId.toString() === subgroupId);
    if (!userInSubgroup) {
      console.log('Error: Usuario no pertenece a este subgrupo.');
      return res.status(400).json({ message: 'El usuario no pertenece a este subgrupo.' });
    }

    // Eliminar al usuario del subgrupo
    user.groupRoles = user.groupRoles.filter(gr => gr.groupId.toString() !== subgroupId);

    // Guardar cambios en la BD
    await user.save();

    console.log('Usuario eliminado correctamente del subgrupo.');
    res.status(200).json({ message: 'Usuario eliminado del subgrupo con éxito.', user });

  } catch (error) {
    console.error('Error en removeUserFromSubgroup:', error);
    res.status(500).json({ message: 'Error al eliminar usuario del subgrupo', error: error.message });
  }
};



module.exports = {
  createSubgroup,
  getSubgroupsByGroup,
  updateSubgroup,
  deleteSubgroup,
  addUserToSubgroup,
  removeUserFromSubgroup,
};
