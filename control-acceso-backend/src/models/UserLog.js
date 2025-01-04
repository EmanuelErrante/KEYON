const mongoose = require('mongoose');

const UserLogSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accion: {
    type: String,
    enum: ['creado', 'actualizado', 'eliminado', 'rol_actualizado'],
    required: true
  },
  realizadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
