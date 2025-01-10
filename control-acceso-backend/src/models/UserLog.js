const mongoose = require('mongoose');

const UserLogSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accion: {
    type: String,
    enum: [
      'creado', 
      'actualizado', 
      'eliminado', 
      'rol_actualizado', 
      'acceso_creado', 
      'acceso_revocado'
    ],
    required: true
  },
  realizadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  detalles: { // Campo opcional para agregar comentarios
    type: String,
    trim: true
  },
  ip: { 
    type: String 
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UserLog', UserLogSchema);
