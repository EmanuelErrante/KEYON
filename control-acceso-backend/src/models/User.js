const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Validación básica de email
  },
  password: { 
    type: String, 
    required: true
  },
  identificacion: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },  // DNI, RUT, etc.

  rolGlobal: {
    type: String,
    enum: ['super_admin', 'usuario', 'inspector'],
    default: 'usuario'
  },

  rolesPorGrupo: [{
    grupoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grupo',
      default: null
    },
    rol: {
      type: String,
      enum: ['admin', 'colaborador', 'usuario', 'inspector'], // Agregado inspector
      required: true
    }
  }],

  accesos: [{
    evento: String,
    expira: Date,
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Referencia al creador del acceso
    }
  }],

  creadoEn: { 
    type: Date, 
    default: Date.now 
  }
});

UserSchema.methods.tieneRolEnGrupo = function (grupoId, rolRequerido) {
  return this.rolesPorGrupo.some(
    r => r.grupoId.toString() === grupoId && r.rol === rolRequerido
  );
};

module.exports = mongoose.model('User', UserSchema);
