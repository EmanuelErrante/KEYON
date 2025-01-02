const Grupo = require('../models/Grupo');
const GrupoLog = require('../models/GrupoLog');

// Crear un nuevo grupo
exports.crearGrupo = async (req, res) => {
  const { nombre, descripcion, direccion, coordenadas, tipo, fechaInicio, fechaFin, acceso } = req.body;

  try {
    // Verificar si ya existe un grupo con el mismo nombre y tipo creado por el mismo usuario
    const grupoExistente = await Grupo.findOne({ nombre, tipo, creadoPor: req.usuario.id });
    if (grupoExistente) {
      return res.status(409).json({ 
        mensaje: 'El grupo ya existe. No se puede duplicar.' 
      });
    }

    // Crear el nuevo grupo
    const nuevoGrupo = new Grupo({
      nombre,
      descripcion,
      direccion,
      coordenadas,
      tipo,
      fechaInicio,
      fechaFin,
      acceso,
      creadoPor: req.usuario.id
    });
    
    await nuevoGrupo.save();

    // Log de creación
    await GrupoLog.create({
      grupoId: nuevoGrupo._id,
      accion: 'creado',
      realizadoPor: req.usuario.id
    });

    res.status(201).json({ mensaje: 'Grupo creado con éxito', grupo: nuevoGrupo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear grupo', error });
  }
};

// Obtener grupos (solo admin o super_admin pueden ver sus propios grupos)
exports.obtenerGrupos = async (req, res) => {
  try {
    let grupos;
    if (req.usuario.rol === 'super_admin') {
      grupos = await Grupo.find();
    } else {
      grupos = await Grupo.find({ creadoPor: req.usuario.id });
    }
    res.json(grupos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener grupos' });
  }
};

// Obtener grupo por ID
exports.obtenerGrupoPorId = async (req, res) => {
  try {
    const grupo = await Grupo.findById(req.params.id).populate('miembros');
    if (!grupo) return res.status(404).json({ mensaje: 'Grupo no encontrado' });
    res.json(grupo);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener grupo' });
  }
};

// Eliminar grupo (solo super_admin)
exports.eliminarGrupo = async (req, res) => {
  try {
    const grupo = await Grupo.findById(req.params.id);
    if (!grupo) return res.status(404).json({ mensaje: 'Grupo no encontrado' });

    await Grupo.deleteOne({ _id: req.params.id });

    // Log de eliminación
    await GrupoLog.create({
      grupoId: grupo._id,
      accion: 'eliminado',
      realizadoPor: req.usuario.id
    });

    res.json({ mensaje: 'Grupo eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar grupo' });
  }
};

// Actualizar grupo (solo admin o super_admin que creó el grupo)
exports.actualizarGrupo = async (req, res) => {
    const { nombre, descripcion, direccion, coordenadas, tipo, fechaInicio, fechaFin, acceso } = req.body;
  
    try {
      const grupo = await Grupo.findById(req.params.id);
      if (!grupo) {
        return res.status(404).json({ mensaje: 'Grupo no encontrado' });
      }
  
      // Verificar si el usuario es el creador o super_admin
      if (grupo.creadoPor.toString() !== req.usuario.id && req.usuario.rol !== 'super_admin') {
        return res.status(403).json({ mensaje: 'No tienes permiso para actualizar este grupo' });
      }
  
      // Actualizar campos del grupo
      grupo.nombre = nombre || grupo.nombre;
      grupo.descripcion = descripcion || grupo.descripcion;
      grupo.direccion = direccion || grupo.direccion;
      grupo.coordenadas = coordenadas || grupo.coordenadas;
      grupo.tipo = tipo || grupo.tipo;
      grupo.fechaInicio = fechaInicio || grupo.fechaInicio;
      grupo.fechaFin = fechaFin || grupo.fechaFin;
      grupo.acceso = acceso || grupo.acceso;
  
      await grupo.save();
  
      // Log de actualización
      await GrupoLog.create({
        grupoId: grupo._id,
        accion: 'actualizado',
        realizadoPor: req.usuario.id
      });
  
      res.json({ mensaje: 'Grupo actualizado con éxito', grupo });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al actualizar grupo', error });
    }
  };
  