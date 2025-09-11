import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import multer from 'multer'
import jwt from 'jsonwebtoken'

// Extend Express Request type to include file property
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File
    }
  }
}

const app = express()
const PORT = process.env.PORT || 4000
const isProduction = process.env.NODE_ENV === 'production'
const ROOT_DIR = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT_DIR, 'data')
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads')

// Configuración de autenticación
const JWT_SECRET = process.env.JWT_SECRET
const ADMIN_USERNAME = process.env.ADMIN_USERNAME
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

// Validate required environment variables in production
if (isProduction && (!JWT_SECRET || !ADMIN_USERNAME || !ADMIN_PASSWORD)) {
  console.error('ERROR: JWT_SECRET, ADMIN_USERNAME, and ADMIN_PASSWORD must be set in production')
  process.exit(1)
}

// Development fallbacks (only for development)
const devJwtSecret = JWT_SECRET || 'dev_secret_change_in_production'
const devAdminUsername = ADMIN_USERNAME || 'admin'
const devAdminPassword = ADMIN_PASSWORD || 'inmobiliaria2024'

// Ensure directories exist
fs.mkdirSync(DATA_DIR, { recursive: true })
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

// Configuración CORS para producción y Replit
const corsOptions = {
  origin: isProduction 
    ? ['https://inmobiliaria-frontend.onrender.com', /\.onrender\.com$/, /\.replit\.dev$/, /\.replit\.app$/]
    : ['http://localhost:5000', 'http://localhost:5001', 'http://127.0.0.1:5000', /\.replit\.dev$/, /\.replit\.app$/],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())
app.use('/uploads', express.static(UPLOADS_DIR))

// Simple file persistence helpers
const dataFilePath = path.join(DATA_DIR, 'properties.json')

type Property = {
  id: string
  title: string
  description?: string
  priceUsd: number
  address?: string
  bedrooms?: number
  bathrooms?: number
  lat?: number
  lng?: number
  images: string[]
  featured?: boolean
  type?: string
  status?: string
}

function readProperties(): Property[] {
  try {
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf-8')
    }
    const raw = fs.readFileSync(dataFilePath, 'utf-8')
    return JSON.parse(raw) as Property[]
  } catch {
    return []
  }
}

function writeProperties(list: Property[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(list, null, 2), 'utf-8')
}

// Initialize data file with a sample if empty
if (!fs.existsSync(dataFilePath)) {
  writeProperties([
    {
      id: '1',
      title: 'Casa en Villa Ramallo',
      description: 'Propiedad en excelente ubicación en el centro de Villa Ramallo.',
      priceUsd: 150000,
      address: 'Belgrano 938, Villa Ramallo, Buenos Aires',
      bedrooms: 2,
      bathrooms: 1,
      lat: -33.499088773370275,
      lng: -60.06567572545429,
      images: [],
      featured: true,
      type: 'Departamento',
      status: 'En venta',
    },
  ])
}

// Middleware de autenticación
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, isProduction ? JWT_SECRET! : devJwtSecret, (err: any, user: any) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

// Ruta de login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña requeridos' })
  }

  // Verificar credenciales
  const currentAdminUsername = isProduction ? ADMIN_USERNAME! : devAdminUsername
  const currentAdminPassword = isProduction ? ADMIN_PASSWORD! : devAdminPassword
  const currentJwtSecret = isProduction ? JWT_SECRET! : devJwtSecret
  
  if (username === currentAdminUsername && password === currentAdminPassword) {
    const user = { username: currentAdminUsername, role: 'admin' }
    const token = jwt.sign(user, currentJwtSecret, { expiresIn: '24h' })
    
    res.json({ 
      success: true, 
      token, 
      user 
    })
  } else {
    res.status(401).json({ message: 'Usuario o contraseña incorrectos' })
  }
})

// Verificar estado de autenticación
app.get('/api/auth-check', authenticateToken, (req: any, res) => {
  res.json({ 
    success: true, 
    user: req.user 
  })
})

app.get('/api/properties', (_req, res) => {
  const list = readProperties()
  res.json(list)
})

app.get('/api/properties/:id', (req, res) => {
  const list = readProperties()
  const found = list.find((p) => p.id === req.params.id)
  if (!found) return res.status(404).json({ message: 'No encontrada' })
  res.json(found)
})

// Create property (protegida)
app.post('/api/properties', authenticateToken, (req, res) => {
  const body = req.body ?? {}
  if (!body.title || typeof body.priceUsd !== 'number') {
    return res.status(400).json({ message: 'Campos requeridos: title, priceUsd' })
  }
  const list = readProperties()
  const newItem: Property = {
    id: Date.now().toString(),
    title: String(body.title),
    description: body.description ? String(body.description) : undefined,
    priceUsd: Number(body.priceUsd),
    address: body.address ? String(body.address) : undefined,
    bedrooms: body.bedrooms != null ? Number(body.bedrooms) : undefined,
    bathrooms: body.bathrooms != null ? Number(body.bathrooms) : undefined,
    lat: body.lat != null ? Number(body.lat) : undefined,
    lng: body.lng != null ? Number(body.lng) : undefined,
    images: Array.isArray(body.images) ? body.images.map(String) : [],
    featured: Boolean(body.featured),
    type: body.type ? String(body.type) : undefined,
    status: body.status ? String(body.status) : undefined,
  }
  list.push(newItem)
  writeProperties(list)
  res.status(201).json(newItem)
})

// Update property (protegida)
app.put('/api/properties/:id', authenticateToken, (req, res) => {
  const id = req.params.id
  const list = readProperties()
  const idx = list.findIndex((p) => p.id === id)
  if (idx === -1) return res.status(404).json({ message: 'No encontrada' })
  const prev = list[idx]
  if (!prev) return res.status(404).json({ message: 'Propiedad no encontrada' })
  
  const body = req.body ?? {}
  const updated: Property = {
    ...prev,
    ...body,
    id: prev.id,
    priceUsd: body.priceUsd != null ? Number(body.priceUsd) : prev.priceUsd,
    bedrooms: body.bedrooms != null ? Number(body.bedrooms) : prev.bedrooms,
    bathrooms: body.bathrooms != null ? Number(body.bathrooms) : prev.bathrooms,
    lat: body.lat != null ? Number(body.lat) : prev.lat,
    lng: body.lng != null ? Number(body.lng) : prev.lng,
    featured: body.featured != null ? Boolean(body.featured) : prev.featured,
    images: Array.isArray(body.images) ? body.images.map(String) : prev.images,
  }
  list[idx] = updated
  writeProperties(list)
  res.json(updated)
})

// Delete property (protegida)
app.delete('/api/properties/:id', authenticateToken, (req, res) => {
  const id = req.params.id
  const list = readProperties()
  const exists = list.some((p) => p.id === id)
  if (!exists) return res.status(404).json({ message: 'No encontrada' })
  const next = list.filter((p) => p.id !== id)
  writeProperties(next)
  res.status(204).send()
})

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body ?? {}
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Datos incompletos' })
  }
  res.json({ ok: true })
})

// File uploads
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, UPLOADS_DIR)
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname)
    const base = path.basename(file.originalname, ext)
    const safeBase = base.replace(/[^a-zA-Z0-9-_]/g, '_')
    cb(null, `${Date.now()}_${safeBase}${ext}`)
  },
})
const upload = multer({ storage })

app.post('/api/upload', authenticateToken, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ message: 'Archivo requerido' })
  const publicUrl = `/uploads/${req.file.filename}`
  res.status(201).json({ url: publicUrl })
})

// Health check endpoint para Railway/Render - DEBE estar ANTES del catch-all
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// 📌 Servir archivos estáticos en producción
if (isProduction) {
  // Ruta al directorio build del cliente - más directa para Render
  let clientBuildPath = path.join(process.cwd(), 'client/dist')
  
  // Verificar si existe el archivo index.html
  const indexHtmlPath = path.join(clientBuildPath, 'index.html')
  if (!fs.existsSync(indexHtmlPath)) {
    // Intentar con otra ruta como fallback
    clientBuildPath = path.join(__dirname, '../../client/dist')
    console.log(`Fallback: usando ruta ${clientBuildPath}`)
  }
  
  console.log(`Sirviendo archivos estáticos desde: ${clientBuildPath}`)
  app.use(express.static(clientBuildPath))
  
  // Catch-all para routing del SPA - DEBE estar al final
  app.get('*', (_req, res) => {
    const indexPath = path.join(clientBuildPath, 'index.html')
    res.sendFile(indexPath)
  })
} else {
  // Solo en desarrollo - redireccionar a Vite dev server
  app.get('/', (_req, res) => {
    res.redirect('http://localhost:5000/')
  })
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`API escuchando en http://0.0.0.0:${PORT}`)
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`)
  if (!isProduction) {
    console.log(`Redirigiendo rutas no-API a http://localhost:5000`)
  }
}).on('error', (err) => {
  console.error('Error starting server:', err)
  process.exit(1)
})

