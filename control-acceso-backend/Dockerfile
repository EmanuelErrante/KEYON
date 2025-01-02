# Usar imagen de Node.js
FROM node:18

# Directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Instalar nodemon globalmente para desarrollo
RUN npm install nodemon -g

# Copiar todo el código
COPY . .

# Exponer el puerto
EXPOSE 5000

# Iniciar el servidor con nodemon (solo desarrollo)
CMD ["nodemon", "src/app.js"]
