const express = require('express');
const router = express.Router();
const UsuarioRepository = require('../repositories/UsuarioRepository');

const usuarioRepo = new UsuarioRepository();

// GET /api/usuarios - Listar todos los usuarios
router.get('/', async (req, res, next) => {
  try {
    const usuarios = await usuarioRepo.findAll();
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
});

// GET /api/usuarios/propietarios - Listar propietarios activos
router.get('/propietarios', async (req, res, next) => {
  try {
    const propietarios = await usuarioRepo.findPropietariosActivos();
    res.json(propietarios);
  } catch (error) {
    next(error);
  }
});

// GET /api/usuarios/:id - Obtener un usuario
router.get('/:id', async (req, res, next) => {
  try {
    const usuario = await usuarioRepo.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    next(error);
  }
});

// POST /api/usuarios - Crear usuario
router.post('/', async (req, res, next) => {
  try {
    const { nombre, rol } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }

    const nuevoUsuario = {
      nombre,
      rol: rol || 'propietario',
      activo: true,
      fecha_creacion: new Date()
    };

    const usuario = await usuarioRepo.create(nuevoUsuario);
    res.status(201).json(usuario);
  } catch (error) {
    next(error);
  }
});

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', async (req, res, next) => {
  try {
    const { nombre, activo } = req.body;
    
    const updates = {};
    if (nombre !== undefined) updates.nombre = nombre;
    if (activo !== undefined) updates.activo = activo;

    const usuario = await usuarioRepo.update(req.params.id, updates);
    res.json(usuario);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/usuarios/:id - Eliminar (desactivar) usuario
router.delete('/:id', async (req, res, next) => {
  try {
    await usuarioRepo.update(req.params.id, { activo: false });
    res.json({ message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
