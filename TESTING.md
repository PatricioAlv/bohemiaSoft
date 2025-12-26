# 🧪 Scripts de Prueba y Datos de Ejemplo

Scripts útiles para probar el sistema con datos iniciales.

## 📦 Cargar Datos Iniciales

### Script para Node.js

Crea `backend/scripts/seed.js`:

```javascript
const { initializeFirebase, getFirestore } = require('../src/config/firebase');
const COLLECTIONS = require('../src/config/collections');

initializeFirebase();
const db = getFirestore();

async function seedDatabase() {
  console.log('🌱 Iniciando carga de datos...\n');

  try {
    // 1. PROPIETARIOS
    console.log('👥 Creando propietarios...');
    
    const propA = await db.collection(COLLECTIONS.USUARIOS).add({
      nombre: 'Propietario A - Ropa Hombre',
      rol: 'propietario',
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const propB = await db.collection(COLLECTIONS.USUARIOS).add({
      nombre: 'Propietario B - Ropa Mujer',
      rol: 'propietario',
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const propC = await db.collection(COLLECTIONS.USUARIOS).add({
      nombre: 'Propietario C - Accesorios',
      rol: 'propietario',
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Propietarios creados');

    // 2. MEDIOS DE PAGO
    console.log('\n💳 Creando medios de pago...');
    
    const mpEfectivo = await db.collection(COLLECTIONS.MEDIOS_PAGO).add({
      tipo: 'efectivo',
      tarjeta: null,
      plan_cuotas: 1,
      dias_acreditacion: 0,
      comision_porcentaje: 0,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const mpDebito = await db.collection(COLLECTIONS.MEDIOS_PAGO).add({
      tipo: 'debito',
      tarjeta: 'Visa',
      plan_cuotas: 1,
      dias_acreditacion: 2,
      comision_porcentaje: 1.5,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const mpCredito = await db.collection(COLLECTIONS.MEDIOS_PAGO).add({
      tipo: 'credito',
      tarjeta: 'Visa',
      plan_cuotas: 3,
      dias_acreditacion: 15,
      comision_porcentaje: 5.5,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Medios de pago creados');

    // 3. PRODUCTOS
    console.log('\n👕 Creando productos...');
    
    // Productos Hombre (Propietario A)
    await db.collection(COLLECTIONS.PRODUCTOS).add({
      nombre: 'Camisa Azul Manga Larga',
      categoria: 'hombre',
      propietario_id: propA.id,
      precio_venta: 15000,
      precio_costo: 8000,
      stock_actual: 10,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.collection(COLLECTIONS.PRODUCTOS).add({
      nombre: 'Pantalón Jean Negro',
      categoria: 'hombre',
      propietario_id: propA.id,
      precio_venta: 20000,
      precio_costo: 12000,
      stock_actual: 8,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Productos Mujer (Propietario B)
    await db.collection(COLLECTIONS.PRODUCTOS).add({
      nombre: 'Vestido Floreado',
      categoria: 'mujer',
      propietario_id: propB.id,
      precio_venta: 25000,
      precio_costo: 15000,
      stock_actual: 6,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.collection(COLLECTIONS.PRODUCTOS).add({
      nombre: 'Blusa Blanca',
      categoria: 'mujer',
      propietario_id: propB.id,
      precio_venta: 12000,
      precio_costo: 7000,
      stock_actual: 12,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Accesorios (Propietario C)
    await db.collection(COLLECTIONS.PRODUCTOS).add({
      nombre: 'Collar Plateado',
      categoria: 'accesorio',
      propietario_id: propC.id,
      precio_venta: 7000,
      precio_costo: 3500,
      stock_actual: 15,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.collection(COLLECTIONS.PRODUCTOS).add({
      nombre: 'Cartera Negra',
      categoria: 'accesorio',
      propietario_id: propC.id,
      precio_venta: 18000,
      precio_costo: 10000,
      stock_actual: 5,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Productos creados');

    // 4. CLIENTES
    console.log('\n🧑‍💼 Creando clientes...');
    
    await db.collection(COLLECTIONS.CLIENTES).add({
      nombre: 'María García',
      telefono: '3511234567',
      email: 'maria@email.com',
      saldo_total: 0,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.collection(COLLECTIONS.CLIENTES).add({
      nombre: 'Juan Pérez',
      telefono: '3519876543',
      email: 'juan@email.com',
      saldo_total: 0,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Clientes creados');

    console.log('\n🎉 ¡Datos cargados exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - 3 Propietarios`);
    console.log(`   - 3 Medios de pago`);
    console.log(`   - 6 Productos`);
    console.log(`   - 2 Clientes`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

seedDatabase();
```

**Uso:**
```bash
cd backend
node scripts/seed.js
```

---

## 🧪 Pruebas con cURL

### Crear Producto

```bash
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Camisa Roja",
    "categoria": "hombre",
    "propietario_id": "TU_PROPIETARIO_ID",
    "precio_venta": 15000,
    "precio_costo": 8000,
    "stock_actual": 10
  }'
```

### Registrar Venta

```bash
curl -X POST http://localhost:3000/api/ventas \
  -H "Content-Type: application/json" \
  -d '{
    "productos": [
      {
        "producto_id": "TU_PRODUCTO_ID",
        "cantidad": 2
      }
    ],
    "medio_pago_id": "TU_MEDIO_PAGO_ID"
  }'
```

### Obtener Dashboard

```bash
curl http://localhost:3000/api/dashboard/hoy
```

---

## 🔍 Consultas Útiles en Firestore

### Ver todas las ventas de hoy

```javascript
const hoy = new Date();
hoy.setHours(0, 0, 0, 0);

db.collection('ventas')
  .where('fecha', '>=', hoy)
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log(doc.id, doc.data());
    });
  });
```

### Ver liquidaciones pendientes

```javascript
db.collection('liquidaciones')
  .where('estado', '==', 'pendiente')
  .orderBy('fecha_estimada_acreditacion', 'asc')
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log(doc.id, doc.data());
    });
  });
```

---

## 📊 Backup de Datos

### Exportar a JSON

```bash
# Instalar firestore-export
npm install -g firestore-export

# Exportar
firestore-export --accountCredentials ./firebase-credentials.json --backupFile backup.json
```

### Importar desde JSON

```bash
firestore-import --accountCredentials ./firebase-credentials.json --backupFile backup.json
```

---

## 🧹 Limpiar Base de Datos

**⚠️ CUIDADO: Esto elimina todos los datos**

```javascript
// backend/scripts/clean.js
const { initializeFirebase, getFirestore } = require('../src/config/firebase');

initializeFirebase();
const db = getFirestore();

async function cleanDatabase() {
  const collections = [
    'usuarios',
    'productos',
    'clientes',
    'ventas',
    'medios_pago',
    'pagos',
    'liquidaciones'
  ];

  for (const col of collections) {
    const snapshot = await db.collection(col).get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`✅ ${col} limpiada`);
  }
  
  console.log('🧹 Base de datos limpiada');
}

cleanDatabase();
```

---

## 🚀 Scripts NPM Útiles

Agrega estos scripts a `backend/package.json`:

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "seed": "node scripts/seed.js",
    "clean": "node scripts/clean.js",
    "test": "jest"
  }
}
```

Uso:
```bash
npm run seed   # Cargar datos de prueba
npm run clean  # Limpiar base de datos
npm run dev    # Desarrollo con auto-reload
```

---

## 📈 Monitoreo

### Ver logs del servidor

```bash
# Backend
cd backend
npm run dev

# Los logs mostrarán:
# - Peticiones HTTP (morgan)
# - Errores
# - Conexión a Firebase
```

### Métricas de Firestore

Ve a Firebase Console → Firestore → Uso

Verás:
- Lecturas/día
- Escrituras/día
- Almacenamiento usado
- Conexiones activas

---

¡Listo para testing! 🎯
