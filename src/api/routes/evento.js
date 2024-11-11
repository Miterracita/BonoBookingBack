const express = require('express');
const eventoRoutes = express.Router();
const {
  newEvent,
  getEvents,
  updateEvents,
  deleteEvents,
  searchBonos,
} = require('../controllers/evento');

// Rutas para eventos
eventoRoutes.post('/new-event', newEvent);
eventoRoutes.get('/events-list', getEvents);
eventoRoutes.put('/:id', updateEvents);
eventoRoutes.delete('/:id', deleteEvents);
eventoRoutes.get('/', searchBonos);

module.exports = eventoRoutes;
