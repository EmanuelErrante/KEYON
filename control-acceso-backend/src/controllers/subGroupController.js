
const mongoose = require('mongoose');
const SubGroup = require('../models/SubGroup');
const Group = require('../models/Group'); // Falta esta importación
const User = require('../models/User'); // Falta esta importación



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

module.exports = {
  createSubgroup,
  getSubgroupsByGroup,
  updateSubgroup,
  deleteSubgroup,
};
