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
    trim: true
  },
  password: { 
    type: String, 
    required: true
  },
  identificacion: { 
    type: String, 
    required: true, 
    unique: true
  },  // DNI, RUT, etc.


  
  // Rol global (ej. super_admin)
  rolGlobal: {
    type: String,
    enum: ['super_admin', 'usuario', 'inspector'],
    default: 'usuario'
  },

  // Roles por grupo (permite subgrupos y diferentes permisos)
  rolesPorGrupo: [{
    grupoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grupo',
      default: null
    },
    rol: {
      type: String,
      enum: ['admin', 'colaborador', 'usuario'],
      required: true
    }
  }],

  // Accesos y eventos del usuario
  accesos: [{
    evento: String,
    expira: Date
  }],

  creadoEn: { 
    type: Date, 
    default: Date.now 
  }
});

// Método para verificar si el usuario tiene un rol específico en un grupo
UserSchema.methods.tieneRolEnGrupo = function (grupoId, rolRequerido) {
  return this.rolesPorGrupo.some(
    r => r.grupoId.toString() === grupoId && r.rol === rolRequerido
  );
};

module.exports = mongoose.model('User', UserSchema);
