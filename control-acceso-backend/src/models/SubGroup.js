const mongoose = require('mongoose');

const subgroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String }, // Campo opcional agregado
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  collaborator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Opcional
}, { timestamps: true });

module.exports = mongoose.model('SubGroup', subgroupSchema);
