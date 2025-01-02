const mongoose = require('mongoose');

const GrupoLogSchema = new mongoose.Schema({
  grupoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grupo',
    required: true
  },
  accion: { 
    type: String, 
    enum: ['creado', 'actualizado', 'eliminado', 'miembro_agregado', 'miembro_eliminado'],
    required: true
  },
  realizadoPor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },  // Usuario que realizó la acción
  fecha: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('GrupoLog', GrupoLogSchema);
