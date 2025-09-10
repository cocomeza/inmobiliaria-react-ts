import { useEffect, useMemo, useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Filters from '../components/Filters'
import type { FiltersState } from '../components/Filters'
import PropertyCard from '../components/PropertyCard'
import type { PropertyItem } from '../components/PropertyCard'
import data from '../data/properties.json'

export default function Properties() {
  const [filters, setFilters] = useState<FiltersState>({ type: 'Todos', order: 'MasNuevo' })
  const [items, setItems] = useState<PropertyItem[]>([])

  useEffect(() => {
    setItems(data as PropertyItem[])
  }, [])

  const filtered = useMemo(() => {
    let list = [...items]
    if (filters.type !== 'Todos') list = list.filter((i) => i.type === filters.type)
    if (filters.order === 'PrecioAsc') list.sort((a, b) => a.priceUsd - b.priceUsd)
    if (filters.order === 'PrecioDesc') list.sort((a, b) => b.priceUsd - a.priceUsd)
    return list
  }, [items, filters])

  return (
    <Container className="py-5">
      <h1 className="mb-4">Propiedades</h1>
      <div className="mb-4">
        <Filters value={filters} onChange={setFilters} />
      </div>

      <Row className="g-4">
        {filtered.map((p) => (
          <Col key={p.id} md={6} lg={4}>
            <PropertyCard item={p} />
          </Col>
        ))}
      </Row>
    </Container>
  )
}


