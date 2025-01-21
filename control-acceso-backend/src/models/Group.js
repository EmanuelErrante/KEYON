const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['establecimiento', 'barrio', 'evento'],
    required: true,
  },
  isUnlimited: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
  admins: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  subgroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubGroup' }],

  // Nuevos campos de ubicación
  direccion: { type: String }, // Dirección en texto opcional
  coordenadas: { 
    type: {
      type: String,
      enum: ['Point'], 
      default: 'Point' 
    },
    coordinates: {
      type: [Number], // [longitud, latitud] (GeoJSON)
      index: '2dsphere', // Habilita búsqueda geoespacial
    }
  }

}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);