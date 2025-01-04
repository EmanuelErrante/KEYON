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
    default: null  // Puede ser null si la acción es sobre un grupo principal
  },
  accion: { 
    type: String, 
    enum: ['creado', 'actualizado', 'eliminado', 'miembro_agregado', 'miembro_eliminado', 'subgrupo_creado', 'subgrupo_eliminado'],
    required: true
  },
  realizadoPor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  fecha: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('GrupoLog', GrupoLogSchema);
