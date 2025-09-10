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
      <Card className="h-100 shadow-sm card-hover" data-aos="fade-up" as="div" role="button">
        <div style={{ position: 'relative' }}>
          <Card.Img 
            variant="top" 
            src={cover} 
            alt={item.title} 
            className="card-img-responsive"
            style={{ 
              objectFit: 'cover', 
              height: '200px',
              width: '100%'
            }} 
          />
          <Badge bg="light" text="dark" className="position-absolute m-2 badge-status" style={{ top: 0, right: 0 }}>
            {item.status}
          </Badge>
        </div>
        <Card.Body className="d-flex flex-column">
          <Card.Title className="mb-2 fs-5 fs-sm-4">{item.title}</Card.Title>
          <div className="text-muted small mb-2">{item.type}</div>
          <div className="fw-semibold text-armadillo mb-2 fs-6">{price}</div>
          <Card.Text className="mt-auto text-secondary small lh-sm" style={{ 
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '3.6em'
          }}>
            {item.description}
          </Card.Text>
        </Card.Body>
      </Card>
    </Link>
  )
}


