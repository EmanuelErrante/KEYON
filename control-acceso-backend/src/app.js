const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const grupoRoutes = require('./routes/grupo');
const cors = require('cors');




const app = express();
app.use(express.json());



// ------------------------
//  Rutas
// ------------------------


/*app.use(cors({
  origin: 'http://localhost:8081'  // Origen específico que quieres permitir
}));*/

app.use(cors({
  origin: '*'
}));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', grupoRoutes);

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




