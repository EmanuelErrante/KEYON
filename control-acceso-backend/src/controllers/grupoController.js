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


// Obtener detalles de un grupo o subgrupo
exports.obtenerDetalleGrupo = async (req, res) => {
    const { id } = req.params; // ID del grupo
    const usuarioId = req.usuario.id; // Usuario autenticado
    const { subgrupoId } = req.query; // Opcional: ID de subgrupo

    try {
        // Buscar grupo y usuarios relacionados
        const grupo = await Grupo.findById(id)
            .populate('usuariosConRoles.usuarioId', 'nombre email rolGlobal')
            .populate('subgrupos.usuarios.usuarioId', 'nombre email');

        if (!grupo) {
            return res.status(404).json({ mensaje: 'Grupo no encontrado' });
        }

        // Verificar el rol del usuario dentro del grupo
        const usuarioActual = grupo.usuariosConRoles.find(user => user.usuarioId._id.toString() === usuarioId);
        if (!usuarioActual) {
            return res.status(403).json({ mensaje: 'No tienes acceso a este grupo' });
        }

        // Si se especifica un subgrupo, devolver solo ese subgrupo
        if (subgrupoId) {
            const subgrupo = grupo.subgrupos.find(sub => sub._id.toString() === subgrupoId);
            if (!subgrupo) {
                return res.status(404).json({ mensaje: 'Subgrupo no encontrado' });
            }

            // Verificar permisos (solo el creador del subgrupo o admin puede ver)
            const permiso = usuarioActual.rol === 'admin' || subgrupo.creadoPor.toString() === usuarioId;
            if (!permiso) {
                return res.status(403).json({ mensaje: 'No tienes permiso para ver este subgrupo' });
            }

            return res.json({
                subgrupo: {
                    id: subgrupo._id,
                    nombre: subgrupo.nombre,
                    descripcion: subgrupo.descripcion,
                    usuarios: subgrupo.usuarios.map(u => ({
                        id: u.usuarioId._id,
                        nombre: u.usuarioId.nombre,
                        email: u.usuarioId.email,
                        rol: u.rol
                    }))
                }
            });
        }

        // Filtrar usuarios y subgrupos visibles según rol
        let usuariosGrupoPrincipal = [];
        let subgruposVisibles = [];

        if (usuarioActual.rol === 'admin') {
            // Admin ve todos los usuarios del grupo principal y todos los subgrupos
            usuariosGrupoPrincipal = grupo.usuariosConRoles;
            subgruposVisibles = grupo.subgrupos;
        } else if (usuarioActual.rol === 'colaborador') {
            // Colaborador solo ve su subgrupo
            subgruposVisibles = grupo.subgrupos.filter(sub => sub.creadoPor.toString() === usuarioId);
        }

        // Respuesta final estructurada
        res.json({
            grupoId: grupo._id,
            nombre: grupo.nombre,
            descripcion: grupo.descripcion,
            direccion: grupo.direccion,
            tipo: grupo.tipo,
            fechaInicio: grupo.fechaInicio,
            fechaFin: grupo.fechaFin,
            acceso: grupo.acceso,
            coordenadas: grupo.coordenadas,
            usuariosGrupoPrincipal: usuariosGrupoPrincipal.map(u => ({
                id: u.usuarioId._id,
                nombre: u.usuarioId.nombre,
                email: u.usuarioId.email,
                rol: u.rol
            })),
            subgrupos: subgruposVisibles.map(sub => ({
                id: sub._id,
                nombre: sub.nombre,
                descripcion: sub.descripcion,
                usuarios: sub.usuarios.map(u => ({
                    id: u.usuarioId._id,
                    nombre: u.usuarioId.nombre,
                    email: u.usuarioId.email,
                    rol: u.rol
                }))
            }))
        });
    } catch (error) {
        console.error('Error al obtener detalle del grupo:', error);
        res.status(500).json({ mensaje: 'Error al obtener detalle del grupo', error });
    }
};
