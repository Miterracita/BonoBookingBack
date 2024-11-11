const mongoose = require('mongoose');
const { preSave, preUpdate, generateCode } = require('../../middlewares/bonoMiddlewares');

const bonoSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true, default: 'Bono' },
    type: { 
      type: String, 
      required: true, 
      enum: ['5', '10', '20'] // añadir más tipos
    },
    active: { type: Boolean, required: true, default: true },
    code: { type: String, trim: true, required: true, default: generateCode },
    totalUses: { type: Number, required: true, default: 10 },    // Número total de usos que ofrece el bono
    availableUses: {  type: Number,  required: true, default: 10  },   // Número de usos que quedan disponibles
    expirationDate: { type: Date, required: false },// Opcional: una fecha de expiración para el bono
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    // Relación de las reservas hechas con este bono
    reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }]
  },
  {
    timestamps: true,
    collection: "bonos"
  }
);

// aplicar los middlewares
bonoSchema.pre('save', preSave);
bonoSchema.pre('findOneAndUpdate', preUpdate);

const Bono = mongoose.model('Bono', bonoSchema);
module.exports = Bono;