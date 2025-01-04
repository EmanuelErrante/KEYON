const Grupo = require('../models/Grupo');
const GrupoLog = require('../models/GrupoLog');

// Crear un nuevo subgrupo
exports.crearSubgrupo = async (req, res) => {
  const { grupoId } = req.params;
  const { nombre, descripcion, usuarios } = req.body;

  try {
    const grupo = await Grupo.findById(grupoId);
    if (!grupo) {
      return res.status(404).json({ mensaje: 'Grupo no encontrado' });
    }

    // Verificar si el usuario tiene permiso para crear subgrupos (colaborador o admin)
    const permiso = grupo.usuariosConRoles.some(u =>
      u.usuarioId.toString() === req.usuario.id &&
      (u.rol === 'admin' || u.rol === 'colaborador')
    );

    if (!permiso) {
      return res.status(403).json({ mensaje: 'Acceso denegado. No tienes permisos para crear subgrupos.' });
    }

    // Crear subgrupo
    const nuevoSubgrupo = {
      nombre,
      descripcion,
      creadoPor: req.usuario.id,
      usuarios: usuarios || []  // Opción de agregar usuarios en el subgrupo desde el inicio
    };

    grupo.subgrupos.push(nuevoSubgrupo);
    await grupo.save();

    const subgrupoCreado = grupo.subgrupos[grupo.subgrupos.length - 1];

    // Log de creación
    await GrupoLog.create({
      grupoId: grupo._id,
      subgrupoId: subgrupoCreado._id,
      accion: 'subgrupo_creado',
      realizadoPor: req.usuario.id
    });

    res.status(201).json({ mensaje: 'Subgrupo creado con éxito', subgrupo: subgrupoCreado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear subgrupo', error });
  }
};

// Eliminar un subgrupo
exports.eliminarSubgrupo = async (req, res) => {
  const { grupoId, subgrupoId } = req.params;

  try {
    const grupo = await Grupo.findById(grupoId);
    if (!grupo) {
      return res.status(404).json({ mensaje: 'Grupo no encontrado' });
    }

    const subgrupo = grupo.subgrupos.id(subgrupoId);
    if (!subgrupo) {
      return res.status(404).json({ mensaje: 'Subgrupo no encontrado' });
    }

    // Verificar permisos (admin o creador del subgrupo)
    const permiso = grupo.usuariosConRoles.some(u =>
      u.usuarioId.toString() === req.usuario.id &&
      (u.rol === 'admin' || subgrupo.creadoPor.toString() === req.usuario.id)
    );

    if (!permiso) {
      return res.status(403).json({ mensaje: 'No tienes permisos para eliminar este subgrupo.' });
    }

    subgrupo.deleteOne();
    await grupo.save();

    // Log de eliminación
    await GrupoLog.create({
      grupoId: grupo._id,
      subgrupoId: subgrupoId,
      accion: 'subgrupo_eliminado',
      realizadoPor: req.usuario.id
    });

    res.json({ mensaje: 'Subgrupo eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar subgrupo', error });
  }
};

// Agregar usuario a subgrupo
exports.agregarUsuarioASubgrupo = async (req, res) => {
  const { grupoId, subgrupoId } = req.params;
  const { usuarioId } = req.body;

  try {
    const grupo = await Grupo.findById(grupoId);
    if (!grupo) {
      return res.status(404).json({ mensaje: 'Grupo no encontrado' });
    }

    const subgrupo = grupo.subgrupos.id(subgrupoId);
    if (!subgrupo) {
      return res.status(404).json({ mensaje: 'Subgrupo no encontrado' });
    }

    const permiso = grupo.usuariosConRoles.some(u =>
      u.usuarioId.toString() === req.usuario.id &&
      (u.rol === 'admin' || subgrupo.creadoPor.toString() === req.usuario.id)
    );

    if (!permiso) {
      return res.status(403).json({ mensaje: 'No tienes permisos para agregar usuarios a este subgrupo.' });
    }

    subgrupo.usuarios.push({ usuarioId, rol: 'usuario' });
    await grupo.save();

    // Log de usuario agregado
    await GrupoLog.create({
      grupoId: grupo._id,
      subgrupoId,
      accion: 'usuario_agregado_subgrupo',
      realizadoPor: req.usuario.id
    });

    res.json({ mensaje: 'Usuario agregado al subgrupo', subgrupo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al agregar usuario al subgrupo', error });
  }
};
