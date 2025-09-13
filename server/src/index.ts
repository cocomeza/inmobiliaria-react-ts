import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'

// Configurar dotenv con la ruta correcta
const envPath = path.resolve(__dirname, '../../../.env')
console.log('🔧 Cargando variables de entorno desde:', envPath)
const result = dotenv.config({ path: envPath })

// Fallback: también intentar desde la raíz del workspace
if (result.error) {
  const workspaceEnvPath = path.resolve(process.cwd(), '.env')
  console.log('🔧 Intentando cargar desde workspace:', workspaceEnvPath)
  dotenv.config({ path: workspaceEnvPath })
}

console.log('✅ Variables disponibles:', {
  MONGO_URI: !!process.env.MONGO_URI,
  JWT_SECRET: !!process.env.JWT_SECRET
})
import connectDB from './config/database.js'
import { authenticateToken, requireAdmin, AuthRequest } from './middleware/auth.js'
import { authService } from './services/authService.js'
import { seedService } from './services/seedService.js'
import { Property } from './models/Property.js'
import { User } from './models/User.js'

const app = express()
const PORT = process.env.PORT || 4000
const isProduction = process.env.NODE_ENV === 'production'

// Configuración CORS
const corsOptions = {
  origin: isProduction 
    ? [
        /\.railway\.app$/, 
        /\.onrender\.com$/, 
        /\.replit\.dev$/, 
        /\.replit\.app$/,
      ]
    : [
        'http://localhost:5000', 
        'http://localhost:5001', 
        'http://127.0.0.1:5000', 
        /\.replit\.dev$/, 
        /\.replit\.app$/, 
        /\.railway\.app$/
      ],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}))

// Rate limiting for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Conectar a MongoDB
connectDB().then(() => {
  // Seed de la base de datos después de conectar
  seedService.seedDatabase()
}).catch((error) => {
  console.error('Error conectando a la base de datos:', error)
  process.exit(1)
})

// ========================
// RUTAS DE AUTENTICACIÓN
// ========================

app.post('/api/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Usuario y contraseña son requeridos' 
      })
    }

    const result = await authService.login(username.trim(), password)
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(401).json({ message: result.message })
    }
  } catch (error) {
    console.error('Error en /api/login:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

app.get('/api/auth-check', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ 
    success: true, 
    user: {
      id: (req.user!._id as any).toString(),
      username: req.user!.username,
      email: req.user!.email,
      role: req.user!.role
    }
  })
})

// ========================
// RUTAS DE PROPIEDADES
// ========================

// Obtener todas las propiedades (público)
app.get('/api/properties', async (req: Request, res: Response) => {
  try {
    const { type, status, featured, minPrice, maxPrice } = req.query

    // Construir filtros
    const filters: any = {}
    
    if (type && type !== '') {
      filters.type = type
    }
    
    if (status && status !== '') {
      filters.status = status
    }
    
    if (featured !== undefined && featured !== '') {
      filters.featured = featured === 'true'
    }
    
    if (minPrice || maxPrice) {
      filters.price = {}
      if (minPrice) filters.price.$gte = Number(minPrice)
      if (maxPrice) filters.price.$lte = Number(maxPrice)
    }

    const properties = await Property.find(filters).sort({ createdAt: -1 })
    res.json(properties)
  } catch (error) {
    console.error('Error obteniendo propiedades:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Obtener propiedad por ID (público)
app.get('/api/properties/:id', async (req: Request, res: Response) => {
  try {
    const property = await Property.findById(req.params.id)
    
    if (!property) {
      return res.status(404).json({ message: 'Propiedad no encontrada' })
    }
    
    res.json(property)
  } catch (error) {
    console.error('Error obteniendo propiedad:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Crear propiedad (solo admin)
app.post('/api/properties', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      priceUsd, // Mapear desde el frontend
      address,
      bedrooms,
      bathrooms,
      images,
      featured,
      type,
      status,
      lat,
      lng
    } = req.body

    if (!title || typeof priceUsd !== 'number') {
      return res.status(400).json({ 
        message: 'Título y precio son requeridos' 
      })
    }

    const newProperty = new Property({
      title,
      description,
      price: priceUsd, // Guardar como price en la BD
      address,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      images: Array.isArray(images) ? images : [],
      featured: Boolean(featured),
      type,
      status,
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined
    })

    const savedProperty = await newProperty.save()
    res.status(201).json(savedProperty)
  } catch (error) {
    console.error('Error creando propiedad:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Actualizar propiedad (solo admin)
app.put('/api/properties/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      priceUsd,
      address,
      bedrooms,
      bathrooms,
      images,
      featured,
      type,
      status,
      lat,
      lng
    } = req.body

    const updateData: any = {}
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (priceUsd !== undefined) updateData.price = Number(priceUsd)
    if (address !== undefined) updateData.address = address
    if (bedrooms !== undefined) updateData.bedrooms = Number(bedrooms)
    if (bathrooms !== undefined) updateData.bathrooms = Number(bathrooms)
    if (images !== undefined) updateData.images = Array.isArray(images) ? images : []
    if (featured !== undefined) updateData.featured = Boolean(featured)
    if (type !== undefined) updateData.type = type
    if (status !== undefined) updateData.status = status
    if (lat !== undefined) updateData.lat = Number(lat)
    if (lng !== undefined) updateData.lng = Number(lng)

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedProperty) {
      return res.status(404).json({ message: 'Propiedad no encontrada' })
    }

    res.json(updatedProperty)
  } catch (error) {
    console.error('Error actualizando propiedad:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Eliminar propiedad (solo admin)
app.delete('/api/properties/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const deletedProperty = await Property.findByIdAndDelete(req.params.id)
    
    if (!deletedProperty) {
      return res.status(404).json({ message: 'Propiedad no encontrada' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error eliminando propiedad:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// ========================
// RUTAS ADICIONALES
// ========================

// Contacto (público)
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body
    
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Datos incompletos' })
    }
    
    // Aquí podrías guardar el mensaje en la BD o enviar email
    console.log('Mensaje de contacto recibido:', { name, email, message })
    
    res.json({ ok: true, message: 'Mensaje enviado correctamente' })
  } catch (error) {
    console.error('Error en contacto:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Health check
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // Verificar conexión a la BD
    const propertiesCount = await Property.countDocuments()
    const usersCount = await User.countDocuments()
    
    res.status(200).json({ 
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: true,
        properties: propertiesCount,
        users: usersCount
      }
    })
  } catch (error) {
    console.error('Error en health check:', error)
    res.status(500).json({ 
      status: 'ERROR',
      message: 'Error de conexión a la base de datos'
    })
  }
})

// Endpoint de debug solo en desarrollo
if (!isProduction) {
  app.get('/api/debug-auth', async (req: Request, res: Response) => {
    try {
      const users = await User.find({}, 'username email role createdAt')
      const properties = await Property.countDocuments()
      
      res.json({
        isProduction,
        environment: process.env.NODE_ENV,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasMongoUri: !!process.env.MONGO_URI,
        users: users.length,
        properties,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo información de debug' })
    }
  })
}

// Ruta principal
if (isProduction) {
  app.get('/', (req: Request, res: Response) => {
    res.json({ 
      message: 'API Inmobiliaria funcionando ✅ - MongoDB', 
      health: '/api/health',
      endpoints: ['/api/properties', '/api/login', '/api/contact'],
      database: 'MongoDB Atlas'
    })
  })
} else {
  app.get('/', (req: Request, res: Response) => {
    res.redirect('http://localhost:5000/')
  })
}

// Iniciar servidor
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 API escuchando en http://0.0.0.0:${PORT}`)
  console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`)
  console.log(`💾 Base de datos: MongoDB Atlas`)
  
  if (!isProduction) {
    console.log(`🔄 Redirigiendo rutas no-API a http://localhost:5000`)
  }
}).on('error', (err) => {
  console.error('❌ Error starting server:', err)
  process.exit(1)
})