const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  date: { type: Date, required: false },
  hour: { type: String, required: false }, // Hora del evento (formato 'HH:mm' o similar)
  // duration: { type: Number, required: false }, // Duración en minutos
  capacity: { type: Number, required: false }, // Número máximo de participantes
  bookins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }] // Reservas asociadas a este evento
}, {
  timestamps: true,
  collection: 'eventos'
});

const Evento = mongoose.model('Evento', eventoSchema);
module.exports = Evento;
