const express = require('express');
const router = express.Router();
const MedioPagoRepository = require('../repositories/MedioPagoRepository');

const medioPagoRepo = new MedioPagoRepository();

// GET /api/medios-pago - Listar todos los medios de pago
router.get('/', async (req, res, next) => {
  try {
    const mediosPago = await medioPagoRepo.findAll();
    res.json(mediosPago);
  } catch (error) {
    next(error);
  }
});

// GET /api/medios-pago/activos - Listar medios de pago activos
router.get('/activos', async (req, res, next) => {
  try {
    const mediosPago = await medioPagoRepo.findActivos();
    res.json(mediosPago);
  } catch (error) {
    next(error);
  }
});

// GET /api/medios-pago/:id - Obtener un medio de pago
router.get('/:id', async (req, res, next) => {
  try {
    const medioPago = await medioPagoRepo.findById(req.params.id);
    if (!medioPago) {
      return res.status(404).json({ message: 'Medio de pago no encontrado' });
    }
    res.json(medioPago);
  } catch (error) {
    next(error);
  }
});

// POST /api/medios-pago - Crear medio de pago
router.post('/', async (req, res, next) => {
  try {
    const { tipo, tarjeta, plan_cuotas, dias_acreditacion, comision_porcentaje } = req.body;

    if (!tipo) {
      return res.status(400).json({ message: 'El tipo es requerido' });
    }

    const nuevoMedioPago = {
      tipo,
      tarjeta: tarjeta || null,
      plan_cuotas: parseInt(plan_cuotas) || 1,
      dias_acreditacion: parseInt(dias_acreditacion) || 0,
      comision_porcentaje: parseFloat(comision_porcentaje) || 0,
      activo: true,
      fecha_creacion: new Date()
    };

    const medioPago = await medioPagoRepo.create(nuevoMedioPago);
    res.status(201).json(medioPago);
  } catch (error) {
    next(error);
  }
});

// PUT /api/medios-pago/:id - Actualizar medio de pago
router.put('/:id', async (req, res, next) => {
  try {
    const { tipo, tarjeta, plan_cuotas, dias_acreditacion, comision_porcentaje, activo } = req.body;
    
    const updates = {};
    if (tipo !== undefined) updates.tipo = tipo;
    if (tarjeta !== undefined) updates.tarjeta = tarjeta;
    if (plan_cuotas !== undefined) updates.plan_cuotas = parseInt(plan_cuotas);
    if (dias_acreditacion !== undefined) updates.dias_acreditacion = parseInt(dias_acreditacion);
    if (comision_porcentaje !== undefined) updates.comision_porcentaje = parseFloat(comision_porcentaje);
    if (activo !== undefined) updates.activo = activo;

    const medioPago = await medioPagoRepo.update(req.params.id, updates);
    res.json(medioPago);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/medios-pago/:id - Eliminar (desactivar) medio de pago
router.delete('/:id', async (req, res, next) => {
  try {
    await medioPagoRepo.update(req.params.id, { activo: false });
    res.json({ message: 'Medio de pago desactivado exitosamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
