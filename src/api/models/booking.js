const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // fecha: { type: Date, required: true },
  localizador: { type: String, required: true },
  evento: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  bono: { type: mongoose.Schema.Types.ObjectId, ref: 'Bono', required: true },
  // Puedes agregar más campos relevantes como duración, tipo de entreno, etc.
  }, {
    timestamps: true,
    collection: "reservas"
  });

 
  // Antes de guardar la reserva, descontar un uso del bono
  bookingSchema.pre('save', async function(next) {
    try {
      const bono = await mongoose.model('Bono').findById(this.bono);
  
      if (!bono || bono.availableUses <= 0) {
        return next(new Error('No hay usos disponibles en el bono.'));
      }
  
      // Descontar un uso disponible
      bono.availableUses -= 1;
      await bono.save();
      next();
    } catch (error) {
      next(error); // Pasar el error al siguiente middleware
    }
  });
  
const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;