import { useEffect, useMemo, useState } from 'react'
import { Button, Col, Container, Form, Row, Table } from 'react-bootstrap'

type Property = {
  id: string
  title: string
  description?: string
  priceUsd: number
  type?: string
  status?: string
  images: string[]
}

export default function Admin() {
  const [items, setItems] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Property | null>(null)
  const [file, setFile] = useState<File | null>(null)

  async function fetchItems() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:4000'}/api/properties`)
      const data = (await res.json()) as Property[]
      setItems(data)
    } catch (e) {
      setError('No se pudieron cargar las propiedades')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  function startNew() {
    setEditing({ id: '', title: '', priceUsd: 0, images: [] })
  }

  async function saveItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editing) return
    setError(null)
    if (!editing.title?.trim()) {
      setError('El título es requerido')
      return
    }
    const priceValue = Number(editing.priceUsd)
    if (Number.isNaN(priceValue) || priceValue < 0) {
      setError('El precio debe ser un número válido')
      return
    }
    try {
      const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
      const method = editing.id ? 'PUT' : 'POST'
      const url = editing.id ? `${baseUrl}/api/properties/${editing.id}` : `${baseUrl}/api/properties`
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editing.title,
          description: editing.description,
          priceUsd: priceValue,
          type: editing.type,
          status: editing.status,
          images: editing.images ?? [],
        }),
      })
      if (!res.ok) {
        try {
          const err = await res.json()
          throw new Error(err?.message || 'Error al guardar')
        } catch {
          throw new Error('Error al guardar')
        }
      }
      setEditing(null)
      await fetchItems()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la propiedad')
    }
  }

  async function deleteItem(id: string) {
    if (!confirm('¿Eliminar propiedad?')) return
    try {
      const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
      const res = await fetch(`${baseUrl}/api/properties/${id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) throw new Error('Error')
      await fetchItems()
    } catch (e) {
      setError('No se pudo eliminar la propiedad')
    }
  }

  async function uploadImage() {
    if (!file) return
    try {
      const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch(`${baseUrl}/api/upload`, { method: 'POST', body: fd })
      const json = (await res.json()) as { url: string }
      if (editing) {
        setEditing({ ...editing, images: [...(editing.images ?? []), json.url] })
        setFile(null)
      }
    } catch (e) {
      setError('No se pudo subir la imagen')
    }
  }

  const baseApi = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

  return (
    <Container className="py-5">
      <Row className="align-items-center mb-3">
        <Col><h1 className="mb-0">Panel de administración</h1></Col>
        <Col xs="auto"><Button onClick={startNew}>Nueva propiedad</Button></Col>
      </Row>

      {error && <div className="alert alert-danger">{error}</div>}

      {!editing && (
        <div className="card">
          <div className="card-body">
            {loading ? (
              <div>Cargando...</div>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Precio USD</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Imágenes</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id}>
                      <td>{p.title}</td>
                      <td>{p.priceUsd}</td>
                      <td>{p.type ?? '-'}</td>
                      <td>{p.status ?? '-'}</td>
                      <td>{p.images?.length ?? 0}</td>
                      <td className="text-end">
                        <Button size="sm" variant="outline-primary" className="me-2" onClick={() => setEditing(p)}>Editar</Button>
                        <Button size="sm" variant="outline-danger" onClick={() => deleteItem(p.id)}>Eliminar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </div>
      )}

      {editing && (
        <div className="card mt-4">
          <div className="card-body">
            <Form onSubmit={saveItem}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Título</Form.Label>
                    <Form.Control value={editing.title} onChange={(e) => setEditing({ ...(editing as Property), title: e.target.value })} required />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Precio USD</Form.Label>
                    <Form.Control type="number" value={editing.priceUsd} onChange={(e) => setEditing({ ...(editing as Property), priceUsd: Number(e.target.value) })} required />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Tipo</Form.Label>
                    <Form.Control value={editing.type ?? ''} onChange={(e) => setEditing({ ...(editing as Property), type: e.target.value })} />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control as="textarea" rows={3} value={editing.description ?? ''} onChange={(e) => setEditing({ ...(editing as Property), description: e.target.value })} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Estado</Form.Label>
                    <Form.Select value={editing.status ?? ''} onChange={(e) => setEditing({ ...(editing as Property), status: e.target.value })}>
                      <option value="">-</option>
                      <option value="En venta">En venta</option>
                      <option value="En alquiler">En alquiler</option>
                      <option value="Reservado">Reservado</option>
                      <option value="Vendido">Vendido</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>Subir imagen</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                      <Button variant="secondary" onClick={uploadImage} disabled={!file}>Subir</Button>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <div className="d-flex flex-wrap gap-2">
                    {(editing.images ?? []).map((url, i) => (
                      <div key={i} className="border rounded p-2 d-flex align-items-center gap-2">
                        <img src={`${url.startsWith('http') ? url : baseApi + url}`} alt="img" style={{ width: 80, height: 60, objectFit: 'cover' }} />
                        <Button size="sm" variant="outline-danger" onClick={() => setEditing({ ...(editing as Property), images: (editing.images ?? []).filter((u) => u !== url) })}>Quitar</Button>
                      </div>
                    ))}
                  </div>
                </Col>
                <Col md={12} className="d-flex gap-2 justify-content-end">
                  <Button variant="outline-secondary" onClick={() => setEditing(null)}>Cancelar</Button>
                  <Button type="submit">Guardar</Button>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      )}
    </Container>
  )
}


