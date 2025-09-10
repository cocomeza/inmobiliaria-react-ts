import { Card, Badge } from 'react-bootstrap'
import { Link } from 'wouter'

export interface PropertyItem {
  id: string
  title: string
  description: string
  priceUsd: number
  images: string[]
  type: string
  status: 'En venta' | 'En alquiler'
}

export default function PropertyCard({ item }: { item: PropertyItem }) {
  const price = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(item.priceUsd)
  const cover = item.images?.[0] ?? 'https://placehold.co/800x600/png'
  return (
    <Link href={`/propiedad/${item.id}`}>
      <Card className="h-100 shadow-sm" data-aos="fade-up" as="div" role="button">
        <div style={{ position: 'relative' }}>
          <Card.Img variant="top" src={cover} alt={item.title} style={{ objectFit: 'cover', height: 200 }} />
          <Badge bg="light" text="dark" className="position-absolute m-2 badge-status" style={{ top: 0, right: 0 }}>
            {item.status}
          </Badge>
        </div>
        <Card.Body>
          <Card.Title className="mb-1">{item.title}</Card.Title>
          <div className="text-muted small mb-2">{item.type}</div>
          <div className="fw-semibold text-armadillo">{price}</div>
          <Card.Text className="mt-2 text-secondary" style={{ minHeight: 48 }}>
            {item.description}
          </Card.Text>
        </Card.Body>
      </Card>
    </Link>
  )
}


