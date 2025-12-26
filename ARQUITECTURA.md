# 🏛️ Arquitectura del Sistema BohemiaSoft

## 📐 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Dashboard │  │   Ventas   │  │   Pagos    │            │
│  │   General  │  │            │  │            │            │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘            │
│        │               │               │                    │
│  ┌─────▼───────────────▼───────────────▼──────┐            │
│  │         Services (API Calls)                │            │
│  │  - productoService                          │            │
│  │  - ventaService                             │            │
│  │  - pagoService                              │            │
│  │  - dashboardService                         │            │
│  └─────────────────┬───────────────────────────┘            │
└────────────────────┼────────────────────────────────────────┘
                     │ HTTP/REST
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    ROUTES                             │  │
│  │  /api/productos  /api/ventas  /api/pagos             │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│  ┌───────────────────▼──────────────────────────────────┐  │
│  │                 CONTROLLERS                           │  │
│  │  - productoController                                 │  │
│  │  - ventaController                                    │  │
│  │  - pagoController                                     │  │
│  │  - dashboardController                                │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│  ┌───────────────────▼──────────────────────────────────┐  │
│  │                  SERVICES                             │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │ VentaService                                  │    │  │
│  │  │ - registrarVenta()                            │    │  │
│  │  │ - calcularTotalesPorPropietario()            │    │  │
│  │  │ - crearLiquidacion()                          │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │ PagoService                                   │    │  │
│  │  │ - registrarPago()                             │    │  │
│  │  │ - calcularImputacionAutomatica()             │    │  │
│  │  │ - actualizarEstadoVentas()                    │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│  ┌───────────────────▼──────────────────────────────────┐  │
│  │                REPOSITORIES                           │  │
│  │  - VentaRepository                                    │  │
│  │  - PagoRepository                                     │  │
│  │  - ProductoRepository                                 │  │
│  │  - ClienteRepository                                  │  │
│  │  - LiquidacionRepository                              │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│  ┌───────────────────▼──────────────────────────────────┐  │
│  │                  MODELS                               │  │
│  │  - Venta, DetalleVenta                                │  │
│  │  - Pago, ImputacionPago                               │  │
│  │  - Liquidacion, LiquidacionPropietario                │  │
│  └───────────────────┬──────────────────────────────────┘  │
└────────────────────┼─────────────────────────────────────┘
                     │ Firebase Admin SDK
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   FIREBASE FIRESTORE                         │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ usuarios │ │productos │ │ clientes │ │  ventas  │      │
│  └──────────┘ └──────────┘ └──────────┘ └────┬─────┘      │
│                                               │             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐     │             │
│  │  pagos   │ │liquidac. │ │medios_pago    │             │
│  └────┬─────┘ └────┬─────┘ └──────────┘  ┌──▼─────────┐  │
│       │            │                      │ detalles   │  │
│  ┌────▼──────┐ ┌──▼────────┐            │(subcolec.) │  │
│  │imputac.   │ │propietar. │            └────────────┘  │
│  │(subcolec.)│ │(subcolec.)│                            │
│  └───────────┘ └───────────┘                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos: Registrar Venta

```
┌──────────┐
│ Usuario  │
└────┬─────┘
     │ 1. POST /api/ventas
     │    { productos, medio_pago_id }
     ▼
┌────────────────┐
│ ventaController│
└────┬───────────┘
     │ 2. ventaService.registrarVenta()
     ▼
┌────────────────┐
│  VentaService  │
│                │
│ 3. Validaciones:
│    - Verificar stock
│    - Validar medio de pago
│    - Calcular totales
│
│ 4. Transacción:
│    ├─ crear venta
│    ├─ crear detalles
│    ├─ descontar stock
│    └─ crear liquidación (si tarjeta)
│
└────┬───────────┘
     │ 5. Llama repositorios
     ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ VentaRepository│  │ProductoRepo    │  │LiquidacionRepo │
└────┬───────────┘  └────┬───────────┘  └────┬───────────┘
     │                   │                   │
     │ 6. Escrituras en Firestore            │
     ▼                   ▼                   ▼
┌──────────────────────────────────────────────────┐
│               FIRESTORE                          │
│  ventas/{id}                                     │
│    ├─ detalles/{id}                              │
│  productos/{id} (stock actualizado)              │
│  liquidaciones/{id}                              │
│    ├─ propietarios/{id}                          │
└──────────────────────────────────────────────────┘
     │
     │ 7. Respuesta
     ▼
┌──────────┐
│ Frontend │
│ Muestra  │
│ resumen  │
└──────────┘
```

---

## 🧩 Separación de Responsabilidades

### **Controllers** (Capa HTTP)
- ✅ Reciben requests
- ✅ Validan parámetros de entrada
- ✅ Llaman a Services
- ✅ Formatean respuestas
- ❌ NO contienen lógica de negocio
- ❌ NO acceden directamente a la base de datos

### **Services** (Lógica de Negocio)
- ✅ Implementan reglas de negocio
- ✅ Coordinan múltiples repositorios
- ✅ Ejecutan cálculos complejos
- ✅ Manejan transacciones
- ❌ NO conocen HTTP (req, res)
- ❌ NO acceden directamente a Firestore

### **Repositories** (Acceso a Datos)
- ✅ CRUD básico
- ✅ Consultas específicas
- ✅ Interacción directa con Firestore
- ✅ Conversión de datos (Firestore ↔ Modelos)
- ❌ NO contienen lógica de negocio
- ❌ NO conocen otros repositorios

### **Models** (Estructura de Datos)
- ✅ Definición de estructura
- ✅ Validación de datos
- ✅ Métodos de conversión
- ✅ Reglas de formato
- ❌ NO contienen lógica de negocio compleja
- ❌ NO acceden a la base de datos

---

## 🔐 Principios Aplicados

### 1. **Separation of Concerns**
Cada capa tiene una responsabilidad clara y única.

### 2. **Single Responsibility Principle**
Cada clase/función tiene un solo motivo para cambiar.

### 3. **Dependency Injection**
Los servicios reciben repositorios, facilitando testing.

### 4. **DRY (Don't Repeat Yourself)**
BaseRepository evita duplicación de código CRUD.

### 5. **Transaction Management**
Operaciones críticas usan transacciones de Firestore.

---

## 📊 Modelo de Datos: Decisiones de Diseño

### ✅ Denormalización Estratégica

```javascript
// En DetalleVenta guardamos:
{
  producto_id: "ref",
  producto_nombre: "Camisa Azul",  // ← DENORMALIZADO
  propietario_id: "ref"
}
```

**¿Por qué?**
- Evita JOINs (Firestore no los soporta)
- Mejora performance en consultas
- Mantiene historial aunque el producto cambie

### ✅ Subcolecciones

```
ventas/{id}
  └─ detalles/{id}    // ← Subcolección

pagos/{id}
  └─ imputaciones/{id}  // ← Subcolección
```

**¿Por qué?**
- Agrupación lógica
- Escalabilidad (cada venta puede tener N detalles)
- Consultas eficientes

### ✅ Timestamps

Todas las entidades tienen:
- `createdAt`: Timestamp de creación
- `updatedAt`: Timestamp de última modificación

**¿Por qué?**
- Auditoría
- Ordenamiento temporal
- Trazabilidad

---

## 🔄 Patrones de Diseño Utilizados

### 1. **Repository Pattern**
Abstrae el acceso a datos.

```javascript
// Uso:
const producto = await productoRepo.findById(id);
// No importa si es Firestore, MySQL, etc.
```

### 2. **Service Layer Pattern**
Encapsula lógica de negocio.

```javascript
// Coordinación de múltiples repositorios:
ventaService.registrarVenta()
  ├─ productoRepo.descontarStock()
  ├─ ventaRepo.create()
  └─ liquidacionRepo.create()
```

### 3. **Factory Pattern** (en Modelos)
```javascript
Venta.fromFirestore(doc)  // Crea instancia desde Firestore
venta.toFirestore()       // Convierte a formato Firestore
```

### 4. **Singleton** (Firebase)
```javascript
// Una sola instancia de Firebase Admin
initializeFirebase()
```

---

## 📈 Escalabilidad

### Cuándo el sistema crece:

#### **Más Propietarios**
✅ No requiere cambios en código
✅ Solo crear más documentos en `usuarios`

#### **Más Productos**
✅ Firestore escala automáticamente
✅ Usar paginación en consultas

#### **Más Ventas**
✅ Índices compuestos en Firestore
✅ Cachear dashboards con Redis (futuro)

#### **Reportes Complejos**
✅ Cloud Functions para agregaciones
✅ BigQuery para analytics (futuro)

---

## 🛡️ Seguridad

### Backend
- ✅ Validación de entrada en Modelos
- ✅ Manejo de errores centralizado
- ✅ Variables de entorno para credenciales
- 🔜 Autenticación con Firebase Auth
- 🔜 Autorización por roles

### Firestore
- ✅ Reglas de seguridad
- 🔜 Validación de esquema
- 🔜 Backup automático

### Frontend
- ✅ Validación de formularios
- 🔜 Sanitización de inputs
- 🔜 HTTPS en producción

---

## 🚀 Mejoras Futuras

### Corto Plazo
- [ ] Autenticación de usuarios
- [ ] Búsqueda avanzada de productos
- [ ] Gráficos de evolución temporal
- [ ] Exportación a PDF

### Mediano Plazo
- [ ] Notificaciones push
- [ ] Aplicación móvil (React Native)
- [ ] Integración con POS
- [ ] Reportes automáticos por email

### Largo Plazo
- [ ] Machine Learning para predicción de ventas
- [ ] Integración con contabilidad
- [ ] Multi-tienda
- [ ] Inventario automático

---

## 📚 Recursos Adicionales

- [Firebase Documentation](https://firebase.google.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://react.dev/)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

**Arquitectura diseñada para crecer** 🚀
