# 📖 Guía de Uso - BohemiaSoft

Esta guía explica cómo usar el sistema paso a paso para las operaciones diarias.

## 🎯 Casos de Uso Principales

### 1. Configuración Inicial

#### 1.1 Crear Propietarios

```bash
POST /api/usuarios
{
  "nombre": "Propietario A - Ropa Hombre",
  "rol": "propietario"
}
```

#### 1.2 Crear Medios de Pago

```bash
# Efectivo
POST /api/medios_pago
{
  "tipo": "efectivo",
  "dias_acreditacion": 0,
  "comision_porcentaje": 0
}

# Tarjeta de crédito
POST /api/medios_pago
{
  "tipo": "credito",
  "tarjeta": "Visa",
  "plan_cuotas": 3,
  "dias_acreditacion": 15,
  "comision_porcentaje": 5.5
}
```

#### 1.3 Cargar Productos

```bash
POST /api/productos
{
  "nombre": "Camisa Azul Manga Larga",
  "categoria": "hombre",
  "propietario_id": "ID_PROPIETARIO_A",
  "precio_venta": 15000,
  "precio_costo": 8000,
  "stock_actual": 10
}
```

---

### 2. Operación Diaria

#### 2.1 Registrar Venta al Contado (Efectivo)

**Escenario**: Cliente compra 2 camisas de Propietario A y 1 accesorio de Propietario C.

```javascript
POST /api/ventas
{
  "productos": [
    {
      "producto_id": "prod_camisa_azul",
      "cantidad": 2
    },
    {
      "producto_id": "prod_collar",
      "cantidad": 1
    }
  ],
  "medio_pago_id": "mp_efectivo"
}

// Respuesta:
{
  "success": true,
  "data": {
    "venta": {
      "id": "venta_001",
      "total_bruto": 37000,
      "estado": "pagada",
      "detalles": [...]
    },
    "resumen": {
      "total": 37000,
      "propietarios": [
        {
          "propietario_id": "prop_A",
          "monto": 30000  // 2 camisas x $15,000
        },
        {
          "propietario_id": "prop_C",
          "monto": 7000   // 1 collar x $7,000
        }
      ]
    }
  }
}
```

**Resultado:**
- ✅ Stock descontado automáticamente
- ✅ Venta marcada como "pagada"
- ✅ Dinero separado por propietario

---

#### 2.2 Venta con Tarjeta de Crédito

**Escenario**: Venta con Visa 3 cuotas, comisión 5.5%, acreditación en 15 días.

```javascript
POST /api/ventas
{
  "productos": [
    {
      "producto_id": "prod_vestido",
      "cantidad": 1
    }
  ],
  "medio_pago_id": "mp_visa_3_cuotas"
}

// El sistema automáticamente:
// 1. Crea la venta
// 2. Descuenta stock
// 3. Crea liquidación pendiente con:
//    - Monto bruto: $25,000
//    - Comisión (5.5%): $1,375
//    - Monto neto: $23,625
//    - Fecha acreditación: Hoy + 15 días
```

---

#### 2.3 Venta en Cuenta Corriente

**Escenario**: Cliente habitual lleva productos sin pagar.

```javascript
POST /api/ventas
{
  "productos": [
    {
      "producto_id": "prod_pantalon",
      "cantidad": 2
    }
  ],
  "medio_pago_id": "mp_efectivo",
  "cliente_id": "cli_maria_garcia"
}

// El sistema:
// 1. Crea venta con estado "pendiente"
// 2. Suma $40,000 al saldo del cliente
// 3. Descuenta stock
```

---

#### 2.4 Registrar Pago de Cuenta Corriente (Automático)

**Escenario**: Cliente María paga $25,000. El sistema distribuye proporcionalmente.

```javascript
POST /api/pagos
{
  "cliente_id": "cli_maria_garcia",
  "monto": 25000,
  "medio_pago_id": "mp_efectivo"
}

// El sistema:
// 1. Obtiene todas las ventas pendientes de María:
//    - Venta 1: $40,000 (Propietario A)
//    - Venta 2: $20,000 (Propietario B)
//    Total pendiente: $60,000
//
// 2. Distribuye los $25,000 proporcionalmente:
//    - Venta 1 (66.67%): $16,667 para Propietario A
//    - Venta 2 (33.33%): $8,333 para Propietario B
//
// 3. Actualiza saldo:
//    Saldo anterior: $60,000
//    Pago: $25,000
//    Nuevo saldo: $35,000
```

---

#### 2.5 Registrar Pago Manual (Específico)

**Escenario**: Cliente paga $30,000 y quiere saldar primero Venta 1 completa.

```javascript
POST /api/pagos
{
  "cliente_id": "cli_maria_garcia",
  "monto": 30000,
  "medio_pago_id": "mp_efectivo",
  "imputaciones": [
    {
      "detalle_venta_id": "det_venta1_001",
      "venta_id": "venta_001",
      "monto_imputado": 30000,
      "propietario_id": "prop_A"
    }
  ]
}

// Paga exactamente lo que el usuario indica
```

---

### 3. Consultas y Reportes

#### 3.1 Dashboard General del Día

```javascript
GET /api/dashboard/hoy

// Respuesta:
{
  "periodo": {
    "inicio": "2024-01-15T00:00:00",
    "fin": "2024-01-15T23:59:59"
  },
  "ventas": {
    "total": 150000,
    "cantidad": 8,
    "promedio": 18750
  },
  "cobros": {
    "total": 120000,
    "cantidad": 5
  },
  "pendiente": {
    "total": 30000,
    "cantidad": 3
  },
  "por_acreditar": {
    "total": 45000,
    "cantidad": 2
  }
}
```

---

#### 3.2 Dashboard de un Propietario

```javascript
GET /api/dashboard/propietario/prop_A
  ?fechaInicio=2024-01-01
  &fechaFin=2024-01-31

// Respuesta:
{
  "propietario": {
    "id": "prop_A",
    "nombre": "Propietario A - Ropa Hombre"
  },
  "vendido": 450000,        // Total vendido en enero
  "cobrado": 380000,        // Total cobrado
  "pendiente_cobro": 70000, // Aún no cobrado
  "por_acreditar": {
    "total": 95000,
    "cantidad": 3,
    "detalle": [
      {
        "fecha_estimada": "2024-02-05",
        "monto_neto": 47500
      },
      // ...
    ]
  }
}
```

---

#### 3.3 Dashboard de Tarjetas

```javascript
GET /api/dashboard/tarjetas
  ?fechaInicio=2024-01-01
  &fechaFin=2024-01-31

// Respuesta:
{
  "resumen": {
    "total_bruto": 500000,
    "total_comisiones": 27500,
    "total_neto": 472500,
    "porcentaje_comision": 5.5
  },
  "pendientes": {
    "total": 280000,
    "cantidad": 7
  },
  "acreditadas": {
    "total": 192500,
    "cantidad": 5
  },
  "proximas_acreditaciones": [
    {
      "fecha_estimada": "2024-02-05",
      "monto_neto": 47500,
      "dias_restantes": 5
    }
  ]
}
```

---

### 4. Escenarios Especiales

#### 4.1 Venta Mixta (3 Propietarios)

```javascript
POST /api/ventas
{
  "productos": [
    { "producto_id": "camisa_hombre", "cantidad": 2 },    // Prop A
    { "producto_id": "vestido_mujer", "cantidad": 1 },    // Prop B
    { "producto_id": "collar_accesorio", "cantidad": 3 }  // Prop C
  ],
  "medio_pago_id": "mp_visa_credito"
}

// Sistema calcula automáticamente:
// Total: $60,000
// Comisión 5.5%: $3,300
// Neto: $56,700
//
// Distribución:
// Prop A: vendió $30,000 → cobra $28,350 (neto)
// Prop B: vendió $20,000 → cobra $18,900 (neto)
// Prop C: vendió $10,000 → cobra $9,450 (neto)
```

---

#### 4.2 Cliente con Múltiples Ventas Pendientes

```javascript
// Situación:
Cliente "Juan" tiene 3 ventas pendientes:
- Venta 1: $50,000 (Prop A: $30k, Prop B: $20k)
- Venta 2: $30,000 (Prop B: $30k)
- Venta 3: $20,000 (Prop C: $20k)
Total: $100,000

// Paga $40,000 (automático):
POST /api/pagos
{
  "cliente_id": "cli_juan",
  "monto": 40000,
  "medio_pago_id": "mp_efectivo"
}

// Distribución proporcional:
// Venta 1 (50%): recibe $20,000
//   → Prop A: $12,000
//   → Prop B: $8,000
//
// Venta 2 (30%): recibe $12,000
//   → Prop B: $12,000
//
// Venta 3 (20%): recibe $8,000
//   → Prop C: $8,000
```

---

## 🎓 Buenas Prácticas

### ✅ Hacer

1. **Siempre registrar el cliente** si es cuenta corriente
2. **Verificar stock** antes de vender grandes cantidades
3. **Usar imputación manual** solo cuando sea necesario
4. **Revisar dashboards diariamente**
5. **Confirmar acreditaciones de tarjetas**

### ❌ Evitar

1. No crear productos sin propietario
2. No mezclar medios de pago en una venta
3. No hacer pagos sin imputación
4. No modificar ventas después de creadas
5. No eliminar productos con ventas asociadas

---

## 🚨 Resolución de Problemas

### Error: "Stock insuficiente"

**Causa**: Intentas vender más unidades de las disponibles.

**Solución**: Verifica stock actual o reduce cantidad.

---

### Error: "La suma de imputaciones no coincide"

**Causa**: En imputación manual, la suma no iguala el monto del pago.

**Solución**: Ajusta los montos para que sumen exactamente el total.

---

### Error: "Cliente no encontrado"

**Causa**: El ID del cliente no existe.

**Solución**: Crea el cliente primero o verifica el ID.

---

## 📞 Soporte

Para más ayuda, consulta:
- [README.md](README.md) - Documentación completa
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Configuración
- Código fuente en `backend/src/services/` para entender la lógica

---

**¡Listo para usar!** 🚀
