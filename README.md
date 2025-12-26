# 🛍️ BohemiaSoft - Sistema de Gestión Comercial Multi-Propietario

Sistema completo de gestión comercial para negocios con múltiples propietarios. Permite gestionar ventas, pagos, stock, cuentas corrientes y liquidaciones de tarjetas con separación clara del dinero por propietario.

## 📋 Características Principales

### ✨ Funcionalidades Clave

- **Gestión de productos** con propietario fijo y control de stock
- **Ventas con múltiples propietarios** en una misma transacción
- **Múltiples medios de pago**: efectivo, débito, crédito
- **Cuentas corrientes** con pagos parciales o totales
- **Liquidaciones automáticas** para tarjetas con comisiones
- **Dashboards completos** por propietario y general
- **Trazabilidad total** de cada peso vendido y cobrado

### 🎯 Reglas de Negocio

1. ✅ Todo producto tiene UN propietario fijo
2. ✅ Una venta puede incluir productos de múltiples propietarios
3. ✅ Todo pago DEBE imputarse (manual o automático)
4. ✅ No existe "dinero sin dueño"
5. ✅ Venta ≠ Pago ≠ Liquidación (son entidades independientes)
6. ✅ Ninguna división se hace manualmente
7. ✅ Todo es auditable

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

**Backend:**
- Node.js + Express
- Firebase Admin SDK
- Firestore (NoSQL)

**Frontend:**
- React 18
- React Router
- Axios
- Recharts (gráficos)

### Estructura del Proyecto

```
bohemiaSoft/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración de Firebase
│   │   ├── models/          # Modelos de datos
│   │   ├── repositories/    # Capa de acceso a datos
│   │   ├── services/        # Lógica de negocio
│   │   ├── controllers/     # Controladores HTTP
│   │   ├── routes/          # Definición de rutas
│   │   ├── middleware/      # Middlewares
│   │   └── index.js         # Punto de entrada
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/      # Componentes reutilizables
    │   ├── pages/           # Páginas/vistas
    │   ├── services/        # Servicios API
    │   ├── utils/           # Utilidades
    │   ├── App.js
    │   └── index.js
    ├── public/
    └── package.json
```

## 📊 Modelo de Datos (Firestore)

### Colecciones Principales

#### 👤 usuarios
```javascript
{
  id: "auto-generated",
  nombre: "Juan Pérez",
  rol: "propietario",  // propietario | admin | vendedor
  activo: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 👕 productos
```javascript
{
  id: "auto-generated",
  nombre: "Camisa Azul",
  categoria: "hombre",  // hombre | mujer | accesorio
  propietario_id: "ref_usuario",
  precio_venta: 15000,
  precio_costo: 8000,
  stock_actual: 10,
  activo: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 🧑‍💼 clientes
```javascript
{
  id: "auto-generated",
  nombre: "María García",
  telefono: "3511234567",
  email: "maria@email.com",
  saldo_total: 50000,  // Deuda acumulada
  activo: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 🛒 ventas
```javascript
{
  id: "auto-generated",
  fecha: Timestamp,
  cliente_id: "ref_cliente" | null,
  total_bruto: 45000,
  medio_pago_id: "ref_medio_pago",
  estado: "pagada",  // pagada | parcial | pendiente
  observaciones: "",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Subcolección: detalles**
```javascript
{
  id: "auto-generated",
  venta_id: "ref_venta",
  producto_id: "ref_producto",
  cantidad: 2,
  precio_unitario: 15000,
  subtotal: 30000,
  propietario_id: "ref_propietario",
  producto_nombre: "Camisa Azul",  // Denormalizado
  createdAt: Timestamp
}
```

#### 💳 medios_pago
```javascript
{
  id: "auto-generated",
  tipo: "credito",  // efectivo | debito | credito
  tarjeta: "Visa",
  plan_cuotas: 3,
  dias_acreditacion: 15,
  comision_porcentaje: 5.5,
  activo: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 💰 pagos
```javascript
{
  id: "auto-generated",
  cliente_id: "ref_cliente",
  fecha: Timestamp,
  monto: 20000,
  medio_pago_id: "ref_medio_pago",
  observaciones: "",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Subcolección: imputaciones**
```javascript
{
  id: "auto-generated",
  pago_id: "ref_pago",
  detalle_venta_id: "ref_detalle",
  venta_id: "ref_venta",
  monto_imputado: 15000,
  propietario_id: "ref_propietario",
  createdAt: Timestamp
}
```

#### 📅 liquidaciones
```javascript
{
  id: "auto-generated",
  venta_id: "ref_venta",
  fecha_venta: Timestamp,
  fecha_estimada_acreditacion: Timestamp,
  fecha_acreditacion_real: Timestamp | null,
  monto_bruto: 45000,
  comision: 2475,
  monto_neto: 42525,
  medio_pago_id: "ref_medio_pago",
  estado: "pendiente",  // pendiente | acreditado
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Subcolección: propietarios**
```javascript
{
  id: "auto-generated",
  liquidacion_id: "ref_liquidacion",
  propietario_id: "ref_propietario",
  monto_bruto: 30000,
  comision: 1650,
  monto_neto: 28350,
  createdAt: Timestamp
}
```

## 🔄 Flujos Principales

### 1️⃣ Registro de Venta

```
1. Usuario selecciona productos
2. Sistema valida stock disponible
3. Sistema calcula:
   - Subtotales por producto
   - Total por propietario
   - Total general
4. Usuario selecciona medio de pago
5. Sistema:
   - Crea venta con detalles
   - Descuenta stock
   - Si es tarjeta: crea liquidación
   - Si es cuenta corriente: actualiza saldo cliente
6. Retorna resumen con distribución por propietario
```

### 2️⃣ Registro de Pago

```
1. Usuario ingresa cliente y monto
2. Sistema valida saldo del cliente
3. Usuario elige tipo de imputación:
   
   MANUAL:
   - Especifica venta y monto para cada propietario
   
   AUTOMÁTICA:
   - Sistema obtiene ventas pendientes
   - Distribuye monto proporcionalmente
   
4. Sistema:
   - Crea pago con imputaciones
   - Reduce saldo del cliente
   - Actualiza estado de ventas
5. Retorna nuevo saldo y detalle de imputaciones
```

### 3️⃣ Liquidación de Tarjetas

```
1. Al registrar venta con tarjeta:
2. Sistema calcula:
   - Fecha de acreditación (fecha + días)
   - Comisión total
   - Monto neto
3. Distribuye entre propietarios:
   - Por cada propietario en la venta
   - Calcula su comisión proporcional
   - Guarda monto neto por propietario
4. Crea liquidación con estado "pendiente"
5. Al acreditarse (manual):
   - Cambia estado a "acreditado"
   - Registra fecha real
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 16+
- Cuenta de Firebase con Firestore habilitado
- npm o yarn

### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales de Firebase
# FIREBASE_PROJECT_ID=tu-proyecto-id
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...

# Iniciar servidor
npm run dev

# Servidor corriendo en http://localhost:3000
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env
# REACT_APP_API_URL=http://localhost:3000/api

# Iniciar aplicación
npm start

# App corriendo en http://localhost:3001
```

## 📡 API Endpoints

### Productos

```
POST   /api/productos              # Crear producto
GET    /api/productos              # Listar productos
GET    /api/productos/:id          # Obtener producto
PUT    /api/productos/:id          # Actualizar producto
DELETE /api/productos/:id          # Eliminar producto
GET    /api/productos?categoria=hombre
GET    /api/productos?propietario_id=xxx
```

### Clientes

```
POST   /api/clientes               # Crear cliente
GET    /api/clientes               # Listar clientes
GET    /api/clientes/:id           # Obtener cliente
PUT    /api/clientes/:id           # Actualizar cliente
GET    /api/clientes/buscar?nombre=Juan
GET    /api/clientes?conSaldo=true
```

### Ventas

```
POST   /api/ventas                 # Registrar venta
GET    /api/ventas                 # Listar ventas
GET    /api/ventas/:id             # Obtener venta
GET    /api/ventas?fechaInicio=2024-01-01&fechaFin=2024-01-31
GET    /api/ventas/propietario/:id/resumen
```

### Pagos

```
POST   /api/pagos                  # Registrar pago
GET    /api/pagos/cliente/:id      # Pagos de un cliente
GET    /api/pagos/propietario/:id/resumen
```

### Dashboard

```
GET    /api/dashboard/general      # Dashboard general
GET    /api/dashboard/hoy          # Resumen del día
GET    /api/dashboard/mes          # Resumen del mes
GET    /api/dashboard/propietario/:id
GET    /api/dashboard/tarjetas
```

## 💡 Ejemplos de Uso

### Registrar una Venta

```javascript
POST /api/ventas
{
  "productos": [
    {
      "producto_id": "prod_001",
      "cantidad": 2
    },
    {
      "producto_id": "prod_002",
      "cantidad": 1
    }
  ],
  "medio_pago_id": "mp_001",
  "cliente_id": "cli_001",  // Opcional
  "observaciones": "Venta al mostrador"
}
```

### Registrar un Pago (Imputación Automática)

```javascript
POST /api/pagos
{
  "cliente_id": "cli_001",
  "monto": 25000,
  "medio_pago_id": "mp_efectivo",
  "observaciones": "Pago parcial"
}
```

### Registrar un Pago (Imputación Manual)

```javascript
POST /api/pagos
{
  "cliente_id": "cli_001",
  "monto": 25000,
  "medio_pago_id": "mp_efectivo",
  "imputaciones": [
    {
      "detalle_venta_id": "det_001",
      "venta_id": "venta_001",
      "monto_imputado": 15000,
      "propietario_id": "prop_A"
    },
    {
      "detalle_venta_id": "det_002",
      "venta_id": "venta_001",
      "monto_imputado": 10000,
      "propietario_id": "prop_B"
    }
  ]
}
```

## 📈 Cálculos Clave

### Liquidación con Comisión

```javascript
Monto Bruto: $45,000
Comisión 5.5%: $2,475
Monto Neto: $42,525

Propietario A vendió $30,000:
  Comisión: $1,650
  Neto: $28,350

Propietario B vendió $15,000:
  Comisión: $825
  Neto: $14,175
```

### Imputación Proporcional

```javascript
Cliente debe: $100,000
Pago recibido: $40,000

Venta 1: $60,000 (60%) → Recibe $24,000
Venta 2: $40,000 (40%) → Recibe $16,000
```

## 🔐 Seguridad y Buenas Prácticas

- ✅ Validación de datos en modelos
- ✅ Manejo de errores centralizado
- ✅ Transacciones atómicas en Firestore
- ✅ Soft delete (no eliminación física)
- ✅ Timestamps automáticos
- ✅ Denormalización estratégica
- ✅ Índices en Firestore para consultas frecuentes

## 📝 Tareas Futuras (Escalabilidad)

- [ ] Autenticación y autorización (Firebase Auth)
- [ ] Roles y permisos granulares
- [ ] Más propietarios y categorías
- [ ] Reportes mensuales en PDF
- [ ] Exportación a Excel
- [ ] Notificaciones de acreditaciones
- [ ] Gráficos de evolución temporal
- [ ] Aplicación móvil
- [ ] Sincronización offline
- [ ] Backup automático

## 🤝 Contribución

Este es un proyecto funcional y productivo. Para contribuir:

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Proyecto privado para uso comercial.

## 👨‍💻 Autor

Desarrollado para BohemiaSoft - Sistema de gestión comercial familiar.

---

**¿Preguntas?** Revisa la documentación de cada módulo o crea un issue en el repositorio.
