import { Row, Col, Form, Button } from 'react-bootstrap'

export type PropertyType = 'Casa' | 'Campo' | 'Departamento' | 'Desarrollo' | 'Local' | 'Terreno'

export interface FiltersState {
  type: PropertyType | 'Todos'
  order: 'MasNuevo' | 'PrecioAsc' | 'PrecioDesc'
}

export default function Filters({ value, onChange }: { value: FiltersState; onChange: (v: FiltersState) => void }) {
  return (
    <Form className="bg-chino p-3 rounded">
      <Row className="g-3 align-items-end">
        <Col md={6} lg={4}>
          <Form.Label className="fw-semibold">Tipo de propiedad</Form.Label>
          <Form.Select
            value={value.type}
            onChange={(e) => onChange({ ...value, type: e.target.value as FiltersState['type'] })}
          >
            <option>Todos</option>
            <option>Casa</option>
            <option>Campo</option>
            <option>Departamento</option>
            <option>Desarrollo</option>
            <option>Local</option>
            <option>Terreno</option>
          </Form.Select>
        </Col>
        <Col md={6} lg={4}>
          <Form.Label className="fw-semibold">Ordenar por</Form.Label>
          <Form.Select
            value={value.order}
            onChange={(e) => onChange({ ...value, order: e.target.value as FiltersState['order'] })}
          >
            <option value="MasNuevo">Más nuevo</option>
            <option value="PrecioAsc">Precio ascendente</option>
            <option value="PrecioDesc">Precio descendente</option>
          </Form.Select>
        </Col>
        <Col md={12} lg={4} className="text-lg-end">
          <Button className="btn-glacier mt-3 mt-lg-0">Aplicar filtros</Button>
        </Col>
      </Row>
    </Form>
  )
}


