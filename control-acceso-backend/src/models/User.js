const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  groupRoles: [
    {
      groupId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'groupRoles.type' }, 
      role: { type: String, enum: ['admin', 'colaborador', 'usuario', 'inspector'], required: true },
      type: { type: String, enum: ['Group', 'SubGroup'], required: true }, // 🔥 Ahora en mayúscula, debe coincidir con el nombre del modelo
    },
  ],
}, { timestamps: true });

userSchema.index({ "groupRoles.groupId": 1 });

module.exports = mongoose.model('User', userSchema);
