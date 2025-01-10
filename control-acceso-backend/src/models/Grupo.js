const mongoose = require('mongoose');

// Subgrupo embebido dentro del grupo
const SubgrupoSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true 
  },
  descripcion: { 
    type: String 
  },
  creadoPor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  usuarios: [{
    usuarioId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    rol: { 
      type: String, 
      enum: ['usuario'], 
      required: true 
    }
  }],
  creadoEn: { 
    type: Date, 
    default: Date.now 
  }
});

const GrupoSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true, 
    trim: true 
  },
  descripcion: { 
    type: String 
  },
  direccion: { 
    type: String 
  },
  coordenadas: {
    latitud: { type: Number },
    longitud: { type: Number }
  },
  tipo: {
    type: String,
    enum: ['evento', 'establecimiento', 'barrio/consorcio'],
    required: true
  },
  fechaInicio: { 
    type: Date 
  },
  fechaFin: { 
    type: Date 
  },
  acceso: {
    ilimitado: { 
      type: Boolean, 
      default: true 
    },
    desde: { 
      type: Date 
    },
    hasta: { 
      type: Date 
    }
  },
  creadoPor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  usuariosConRoles: [{
    usuarioId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    rol: {
      type: String,
      enum: ['admin', 'colaborador', 'usuario', 'inspector'], // Agregado inspector
      required: true
    }
  }],
  subgrupos: [SubgrupoSchema], // Subgrupos embebidos dentro del grupo
  creadoEn: { 
    type: Date, 
    default: Date.now 
  }
});

// Índice geoespacial
GrupoSchema.index({ 'coordenadas.latitud': 1, 'coordenadas.longitud': 1 });

module.exports = mongoose.model('Grupo', GrupoSchema);
