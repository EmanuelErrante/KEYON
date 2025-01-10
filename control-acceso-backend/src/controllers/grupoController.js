const Grupo = require('../models/Grupo');
const GrupoLog = require('../models/GrupoLog');

// Crear un nuevo grupo
exports.crearGrupo = async (req, res) => {
  const { nombre, descripcion, direccion, coordenadas, tipo, fechaInicio, fechaFin, acceso, usuariosConRoles } = req.body;

  try {
    const nuevoGrupo = new Grupo({
      nombre,
      descripcion,
      direccion,
      coordenadas,
      tipo,
      fechaInicio,
      fechaFin,
      acceso,
      creadoPor: req.usuario.id,
      usuariosConRoles: usuariosConRoles || [{ usuarioId: req.usuario.id, rol: 'admin' }]
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

// Agregar usuario a un grupo
exports.agregarUsuarioAGrupo = async (req, res) => {
  const { usuarioId, rol } = req.body;
  const grupoId = req.params.id;

  try {
    const grupo = await Grupo.findById(grupoId);
    if (!grupo) {
      return res.status(404).json({ mensaje: 'Grupo no encontrado' });
    }

    // Verificar si el usuario ya está en el grupo
    const usuarioExistente = grupo.usuariosConRoles.find(u => u.usuarioId.toString() === usuarioId);
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El usuario ya pertenece a este grupo' });
    }

    grupo.usuariosConRoles.push({ usuarioId, rol });
    await grupo.save();

    // Log de miembro agregado
    await GrupoLog.create({
      grupoId,
      accion: 'miembro_agregado',
      realizadoPor: req.usuario.id
    });

    res.json({ mensaje: 'Usuario agregado al grupo', grupo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al agregar usuario al grupo', error });
  }
};

// Eliminar usuario de un grupo
exports.eliminarUsuarioDeGrupo = async (req, res) => {
  const { usuarioId } = req.body;
  const grupoId = req.params.id;

  try {
    const grupo = await Grupo.findById(grupoId);
    if (!grupo) {
      return res.status(404).json({ mensaje: 'Grupo no encontrado' });
    }

    grupo.usuariosConRoles = grupo.usuariosConRoles.filter(u => u.usuarioId.toString() !== usuarioId);
    await grupo.save();

    // Log de miembro eliminado
    await GrupoLog.create({
      grupoId,
      accion: 'miembro_eliminado',
      realizadoPor: req.usuario.id
    });

    res.json({ mensaje: 'Usuario eliminado del grupo', grupo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario del grupo', error });
  }
};

// Eliminar grupo completo
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


// Obtener todos los grupos del usuario autenticado
exports.obtenerGruposDelUsuario = async (req, res) => {
    try {
      // Buscar grupos donde el usuario tiene algún rol
      const grupos = await Grupo.find({ 'usuariosConRoles.usuarioId': req.usuario.id });
  
      // Añadir el rol del usuario autenticado en cada grupo
      const gruposConRol = grupos.map(grupo => {
        const usuario = grupo.usuariosConRoles.find(u => u.usuarioId.equals(req.usuario.id));
        const rolUsuarioActual = usuario ? usuario.rol : null;
  
        // Convertimos el grupo a objeto para modificarlo antes de enviarlo
        const grupoConRol = grupo.toObject();
        grupoConRol.rolUsuarioActual = rolUsuarioActual;
  
        return grupoConRol;
      });
  
      console.log("xxxxxxxxx", gruposConRol);
      res.json(gruposConRol);
  
    } catch (error) {
      console.error('Error al obtener grupos:', error);
      res.status(500).json({ mensaje: 'Error al obtener grupos', error });
    }
  };
  



// Obtener logs de un grupo
exports.obtenerLogs = async (req, res) => {
  try {
    const logs = await GrupoLog.find({ grupoId: req.params.id })
      .populate('realizadoPor', 'nombre email')
      .sort({ fecha: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener logs', error });
  }
};



// Obtener detalles de un grupo con usuarios visibles según rol
exports.obtenerDetalleGrupo = async (req, res) => {
    const { id } = req.params; // ID del grupo
    const usuarioId = req.usuario.id; // Usuario autenticado

    try {
        // Buscar grupo y usuarios relacionados
        const grupo = await Grupo.findById(id).populate('usuariosConRoles.usuarioId', 'nombre email rolGlobal');

        if (!grupo) {
            return res.status(404).json({ mensaje: 'Grupo no encontrado' });
        }

        // Verificar el rol del usuario dentro del grupo
        const usuarioActual = grupo.usuariosConRoles.find(user => user.usuarioId._id.toString() === usuarioId);
        if (!usuarioActual) {
            return res.status(403).json({ mensaje: 'No tienes acceso a este grupo' });
        }

        // Filtrar usuarios visibles según rol
        let usuariosVisibles = [];
        if (usuarioActual.rol === 'admin') {
            usuariosVisibles = grupo.usuariosConRoles; // Admin ve todos los usuarios
        } else if (usuarioActual.rol === 'colaborador') {
            usuariosVisibles = grupo.subgrupos
                .filter(sub => sub.creadoPor.toString() === usuarioId)
                .flatMap(sub => sub.usuarios);
        }

        res.json({
            ...grupo.toObject(),
            usuariosConRoles: usuariosVisibles
        });
    } catch (error) {
        console.error('Error al obtener detalle del grupo:', error);
        res.status(500).json({ mensaje: 'Error al obtener detalle del grupo', error });
    }
};
