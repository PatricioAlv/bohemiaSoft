# Despliegue en Firebase Cloud Functions

## 📋 Requisitos Previos

1. **Instalar Firebase CLI globalmente:**
```bash
npm install -g firebase-tools
```

2. **Autenticarse con Firebase:**
```bash
firebase login
```

## 🚀 Despliegue

### 1. Instalar Dependencias

```bash
cd functions
npm install
```

### 2. Probar Localmente con Emuladores (Opcional)

```bash
# Desde la raíz del proyecto
firebase emulators:start
```

Esto iniciará:
- Cloud Functions en `http://localhost:5001/bohemiasoft-457d0/us-central1/api`
- Firebase Emulator UI en `http://localhost:4000`

### 3. Desplegar a Producción

```bash
# Desde la raíz del proyecto
firebase deploy --only functions
```

O desde la carpeta functions:
```bash
cd functions
npm run deploy
```

## 🌐 URL de tu API

Después del despliegue, tu API estará disponible en:
```
https://us-central1-bohemiasoft-457d0.cloudfunctions.net/api
```

### Endpoints Disponibles:

- **Productos:** `https://us-central1-bohemiasoft-457d0.cloudfunctions.net/api/api/productos`
- **Clientes:** `https://us-central1-bohemiasoft-457d0.cloudfunctions.net/api/api/clientes`
- **Ventas:** `https://us-central1-bohemiasoft-457d0.cloudfunctions.net/api/api/ventas`
- **Pagos:** `https://us-central1-bohemiasoft-457d0.cloudfunctions.net/api/api/pagos`
- **Dashboard:** `https://us-central1-bohemiasoft-457d0.cloudfunctions.net/api/api/dashboard`

## ⚙️ Configuración del Frontend

Actualiza la URL de la API en tu frontend:

**Para desarrollo local con emuladores:**
```env
REACT_APP_API_URL=http://localhost:5001/bohemiasoft-457d0/us-central1/api/api
```

**Para producción:**
```env
REACT_APP_API_URL=https://us-central1-bohemiasoft-457d0.cloudfunctions.net/api/api
```

## 📊 Monitoreo y Logs

### Ver logs en tiempo real:
```bash
firebase functions:log
```

### Ver logs específicos de una función:
```bash
firebase functions:log --only api
```

### Monitoreo en la consola:
Visita [Firebase Console](https://console.firebase.google.com/project/bohemiasoft-457d0/functions) para ver:
- Métricas de uso
- Logs detallados
- Costos
- Rendimiento

## 🔄 Actualizar la Función

Cada vez que hagas cambios en el código:

1. Asegúrate de estar en la raíz del proyecto
2. Ejecuta:
```bash
firebase deploy --only functions
```

## 🐛 Solución de Problemas

### Error: "Missing permissions"
Asegúrate de que tu cuenta de Firebase tenga permisos de Editor o Propietario.

### Error: "Billing account not configured"
Cloud Functions requiere un plan Blaze (pago por uso). Configura la facturación en:
https://console.firebase.google.com/project/bohemiasoft-457d0/usage/details

### Error en dependencias:
```bash
cd functions
rm -rf node_modules package-lock.json
npm install
```

### Ver errores detallados:
```bash
firebase functions:log --only api
```

## 💰 Costos

Firebase Cloud Functions tiene un nivel gratuito generoso:
- 2M invocaciones/mes
- 400,000 GB-segundos
- 200,000 GHz-segundos

Después del nivel gratuito, se cobra por uso. Para una aplicación pequeña-mediana, los costos suelen ser mínimos (< $5/mes).

## 🔐 Variables de Entorno

⚠️ **Importante:** En Cloud Functions no se usan archivos `.env`. Firebase Admin SDK se autentica automáticamente en el entorno de Cloud Functions.

Si necesitas variables de entorno personalizadas:

```bash
firebase functions:config:set custom.key="valor"
```

Y acceder en el código:
```javascript
const config = functions.config();
const myValue = config.custom.key;
```

## 📝 Notas Importantes

1. **Cold Start:** La primera invocación después de un periodo de inactividad puede ser lenta (~2-5 segundos). Esto es normal.

2. **Timeout:** Por defecto, las funciones tienen un timeout de 60 segundos. Si necesitas más, actualiza en `firebase.json`.

3. **Región:** Las funciones se despliegan en `us-central1` por defecto. Puedes cambiar la región en el código:
   ```javascript
   exports.api = functions.region('southamerica-east1').https.onRequest(app);
   ```

4. **CORS:** Ya está configurado para aceptar todas las origins (`cors({ origin: true })`). Para producción, considera restringir a dominios específicos.

## 📱 Despliegue del Frontend

### Opción 1: Netlify

1. Sube tu código a GitHub/GitLab
2. Conecta el repositorio en [Netlify](https://netlify.com)
3. Configura las variables de entorno:
   - `REACT_APP_API_URL=https://us-central1-bohemiasoft-457d0.cloudfunctions.net/api/api`
4. Deploy automático con cada push

### Opción 2: Firebase Hosting

```bash
# Construir el frontend
cd frontend
npm run build

# Configurar Firebase Hosting
firebase init hosting

# Desplegar
firebase deploy --only hosting
```

## 🎯 Checklist de Despliegue

- [ ] Firebase CLI instalado (`npm install -g firebase-tools`)
- [ ] Autenticado en Firebase (`firebase login`)
- [ ] Dependencias instaladas en functions (`cd functions && npm install`)
- [ ] Plan Blaze activado en Firebase (para Cloud Functions)
- [ ] Funciones desplegadas (`firebase deploy --only functions`)
- [ ] URL de producción obtenida
- [ ] Frontend configurado con URL de producción
- [ ] Frontend desplegado en Netlify/Vercel/Firebase Hosting
- [ ] Pruebas en producción realizadas
