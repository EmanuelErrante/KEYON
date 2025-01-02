const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const grupoRoutes = require('./routes/grupo');


// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);  // Ruta protegida con roles
app.use('/api/grupos', grupoRoutes);





// Ruta de prueba

app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});


// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB conectado'))
.catch(err => console.error('❌ Error al conectar MongoDB:', err));


// Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
