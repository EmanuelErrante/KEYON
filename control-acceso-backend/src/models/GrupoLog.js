const mongoose = require('mongoose');

const GrupoLogSchema = new mongoose.Schema({
  grupoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grupo',
    required: true
  },
  subgrupoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grupo.subgrupos',
    default: null
  },
  accion: { 
    type: String, 
    enum: [
      'creado', 
      'actualizado', 
      'eliminado', 
      'miembro_agregado', 
      'miembro_eliminado', 
      'subgrupo_creado', 
      'subgrupo_eliminado',
      'acceso_creado',
      'acceso_revocado',
      'usuario_agregado_subgrupo'
    ],
      required: true
  },
  realizadoPor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  detalles: { 
    type: String, 
    trim: true 
  }, // Comentario adicional sobre la acción
  fecha: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('GrupoLog', GrupoLogSchema);
