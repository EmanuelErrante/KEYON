const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const groupRoutes = require('./routes/group');

const app = express();

// ✅ Mover arriba
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ Para permitir formularios codificados en URL

// Logging de solicitudes
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Configuración de CORS
app.use(cors({
  origin: '*'
}));

app.use(cors({
  origin: ['http://localhost:8081', 'https://mi-dominio.com'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// ------------------------
//  Rutas
// ------------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', groupRoutes);

app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

// ------------------------
//  Manejo de Errores
// ------------------------
app.use((req, res, next) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// ------------------------
//  Conexión a MongoDB
// ------------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB conectado'))
.catch(err => console.error('❌ Error al conectar MongoDB:', err));

// ------------------------
//  Servidor
// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
