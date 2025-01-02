const mongoose = require('mongoose');

const GrupoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String },  // Ejemplo: Fiesta de Fin de Año, Gimnasio Aries
  direccion: { type: String },
  coordenadas: {
    latitud: { type: Number },
    longitud: { type: Number }
  },
  tipo: {
    type: String,
    enum: ['evento', 'establecimiento', 'barrio/consorcio'],
    required: true
  },
  fechaInicio: { type: Date },  // Para eventos con fecha
  fechaFin: { type: Date },     
  acceso: {
    ilimitado: { type: Boolean, default: true },  
    desde: { type: Date },  
    hasta: { type: Date }
  },
  creadoPor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },  // Admin que creó el grupo
  miembros: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],  // Lista de usuarios con acceso
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Grupo', GrupoSchema);
