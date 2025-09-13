import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MONGO_URI no está definida en las variables de entorno');
    }

    console.log('Conectando a MongoDB...');
    
    await mongoose.connect(mongoUri, {
      // Opciones para optimizar la conexión
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Conexión a MongoDB establecida correctamente');
    
    // Log de información de la conexión
    console.log(`📊 Base de datos: ${mongoose.connection.db?.databaseName || 'desconocida'}`);
    
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    
    // En desarrollo, mostrar más detalles del error
    if (process.env.NODE_ENV !== 'production') {
      console.error('Detalles del error:', {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : 'Error desconocido',
        mongoUri: process.env.MONGO_URI ? '***URI_OCULTA***' : 'NO DEFINIDA'
      });
    }
    
    // Salir del proceso si no se puede conectar a la BD
    process.exit(1);
  }
};

// Manejo de eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('🔌 Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Error de conexión MongoDB:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose desconectado de MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 Conexión MongoDB cerrada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cerrando conexión MongoDB:', error);
    process.exit(1);
  }
});

export default connectDB;