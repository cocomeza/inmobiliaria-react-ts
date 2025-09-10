import { useState } from 'react'
import { Button, Col, Container, Form, Row, Alert } from 'react-bootstrap'
import { useLocation } from 'wouter'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [, setLocation] = useLocation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!username.trim() || !password.trim()) {
      setError('Por favor completá todos los campos')
      setLoading(false)
      return
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
      const res = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Error de autenticación' }))
        throw new Error(errorData.message || 'Usuario o contraseña incorrectos')
      }

      const data = await res.json()
      
      // Guardar token de autenticación
      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('adminUser', JSON.stringify(data.user))
      
      // Redirigir al admin
      setLocation('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="py-4 py-md-5">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col xs={11} sm={8} md={6} lg={4}>
          <div className="card shadow-lg border-0">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4 mb-md-5">
                <h2 className="mb-2 fs-3">🏠 Admin Login</h2>
                <p className="text-muted mb-0 small">Panel de Administración</p>
              </div>
              
              {error && (
                <Alert variant="danger" className="mb-4">
                  <small>{error}</small>
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Usuario</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingresá tu usuario"
                    required
                    disabled={loading}
                    className="form-control-lg"
                    autoComplete="username"
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold small">Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresá tu contraseña"
                    required
                    disabled={loading}
                    className="form-control-lg"
                    autoComplete="current-password"
                  />
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 btn-lg py-3" 
                  disabled={loading}
                >
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </Button>
              </Form>
            </div>
          </div>
          
          <div className="text-center mt-3">
            <small className="text-muted">
              Solo para administradores autorizados
            </small>
          </div>
        </Col>
      </Row>
    </Container>
  )
}