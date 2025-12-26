# 🔥 Configuración de Firebase para BohemiaSoft

Este documento explica cómo configurar Firebase y Firestore para el sistema.

## 📋 Pasos para Configuración

### 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Nombre: `bohemiasoft` (o el que prefieras)
4. Deshabilita Google Analytics si no lo necesitas
5. Crea el proyecto

### 2. Habilitar Firestore

1. En el menú lateral, ve a **Build > Firestore Database**
2. Haz clic en "Crear base de datos"
3. Selecciona modo **Producción**
4. Elige la ubicación más cercana (ej: `southamerica-east1` para Argentina)

### 3. Configurar Reglas de Seguridad (Temporal)

En la pestaña "Reglas", usa esto para desarrollo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ⚠️ SOLO PARA DESARROLLO
    }
  }
}
```

⚠️ **IMPORTANTE**: Estas reglas permiten acceso total. En producción, debes implementar autenticación.

### 4. Obtener Credenciales de Admin

1. Ve a **Configuración del proyecto** (ícono de engranaje)
2. Pestaña **Cuentas de servicio**
3. Selecciona **Node.js**
4. Haz clic en "Generar nueva clave privada"
5. Se descargará un archivo JSON

### 5. Configurar Variables de Entorno

Del archivo JSON descargado, extrae estos valores:

```json
{
  "project_id": "tu-proyecto-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@tu-proyecto-id.iam.gserviceaccount.com"
}
```

Crea el archivo `.env` en `backend/`:

```env
PORT=3000
NODE_ENV=development

FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto-id.iam.gserviceaccount.com
```

### 6. Crear Colecciones Iniciales

Puedes crear las colecciones manualmente o dejar que el sistema las cree automáticamente al insertar el primer documento.

**Colecciones necesarias:**
- `usuarios`
- `productos`
- `clientes`
- `ventas`
- `medios_pago`
- `pagos`
- `liquidaciones`

### 7. Datos de Prueba (Opcional)

Puedes insertar datos de prueba manualmente:

#### Crear Propietarios

```javascript
// Colección: usuarios
{
  nombre: "Propietario A - Ropa Hombre",
  rol: "propietario",
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

{
  nombre: "Propietario B - Ropa Mujer",
  rol: "propietario",
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

{
  nombre: "Propietario C - Accesorios",
  rol: "propietario",
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

#### Crear Medios de Pago

```javascript
// Efectivo
{
  tipo: "efectivo",
  tarjeta: null,
  plan_cuotas: 1,
  dias_acreditacion: 0,
  comision_porcentaje: 0,
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

// Débito Visa
{
  tipo: "debito",
  tarjeta: "Visa",
  plan_cuotas: 1,
  dias_acreditacion: 2,
  comision_porcentaje: 1.5,
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

// Crédito Visa 3 cuotas
{
  tipo: "credito",
  tarjeta: "Visa",
  plan_cuotas: 3,
  dias_acreditacion: 15,
  comision_porcentaje: 5.5,
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## 🔍 Índices Recomendados

Para optimizar consultas, crea estos índices compuestos:

### ventas
- `cliente_id` (ASC) + `fecha` (DESC)
- `estado` (ASC) + `fecha` (DESC)

### pagos
- `cliente_id` (ASC) + `fecha` (DESC)

### liquidaciones
- `estado` (ASC) + `fecha_estimada_acreditacion` (ASC)

### productos
- `categoria` (ASC) + `activo` (ASC)
- `propietario_id` (ASC) + `activo` (ASC)

Firebase te pedirá crear estos índices automáticamente la primera vez que ejecutes las consultas.

## ⚠️ Límites de Firestore (Plan Gratuito)

- **Lecturas**: 50,000/día
- **Escrituras**: 20,000/día
- **Almacenamiento**: 1 GB
- **Conexiones simultáneas**: 100

Para un negocio pequeño-mediano, esto es suficiente. Si necesitas más, considera el plan Blaze (pago por uso).

## 🔒 Seguridad en Producción

Cuando pases a producción, implementa reglas de seguridad:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Solo usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Reglas más específicas por colección
    match /productos/{producto} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.rol == 'admin';
    }
    
    match /ventas/{venta} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.token.rol == 'admin';
    }
  }
}
```

## 📊 Backup Automático

Configura backups automáticos:

1. Ve a **Firestore > Importación/Exportación**
2. Configura exportaciones programadas
3. Guárdalas en Google Cloud Storage

## 🚀 Próximos Pasos

1. Implementar Firebase Authentication
2. Crear funciones Cloud Functions para tareas automáticas
3. Configurar Firebase Hosting para el frontend
4. Implementar notificaciones con Firebase Cloud Messaging

---

¿Dudas? Consulta la [documentación oficial de Firebase](https://firebase.google.com/docs).
