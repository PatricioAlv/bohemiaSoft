/**
 * Formatear número como moneda
 */
export const formatearMoneda = (valor) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(valor);
};

/**
 * Formatear fecha
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return '';
  
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

/**
 * Formatear fecha y hora
 */
export const formatearFechaHora = (fecha) => {
  if (!fecha) return '';
  
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Obtener inicio del día
 */
export const inicioDelDia = (fecha = new Date()) => {
  const date = new Date(fecha);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Obtener fin del día
 */
export const finDelDia = (fecha = new Date()) => {
  const date = new Date(fecha);
  date.setHours(23, 59, 59, 999);
  return date;
};

/**
 * Obtener inicio del mes
 */
export const inicioDelMes = (fecha = new Date()) => {
  const date = new Date(fecha);
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Obtener fin del mes
 */
export const finDelMes = (fecha = new Date()) => {
  const date = new Date(fecha);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

/**
 * Calcular días entre fechas
 */
export const diasEntre = (fecha1, fecha2) => {
  const diff = Math.abs(new Date(fecha2) - new Date(fecha1));
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
