const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['super_admin', 'usuario', 'inspector'], default: 'usuario' },
  grupo: { type: String },
  accesos: [{ evento: String, expira: Date }]
});

module.exports = mongoose.model('User', UserSchema);
