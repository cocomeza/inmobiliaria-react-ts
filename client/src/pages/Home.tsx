import { Container, Row, Col } from 'react-bootstrap'
import Hero from '../components/Hero'
import Services from '../components/Services'
import About from '../components/About'
import PropertyCard from '../components/PropertyCard'
import type { PropertyItem } from '../components/PropertyCard'
import data from '../data/properties.json'

export default function Home() {
  const featured = (data as PropertyItem[]).slice(0, 3)
  return (
    <>
      <Hero />
      <Container className="py-4 py-md-5">
        <h2 className="mb-3 mb-md-4 text-center text-md-start">Propiedades destacadas</h2>
        <Row className="g-3 g-md-4">
          {featured.map((p) => (
            <Col key={p.id} xs={12} sm={6} lg={4}>
              <PropertyCard item={p} />
            </Col>
          ))}
        </Row>
      </Container>
      <Services />
      <About />
    </>
  )
}


