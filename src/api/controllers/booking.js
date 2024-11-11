const Booking = require("../models/booking");

const newReserva = async (req, res) => {
  try {
    const { fecha, bono } = req.body;

    // Validación de datos
    if (!fecha || !bono) {
      return res.status(400).json({ message: "Faltan datos requeridos." });
    }

    const nuevaReserva = new Booking({
      fecha,
      bono,
    });

    const reservaGuardada = await nuevaReserva.save();
    return res.status(201).json(reservaGuardada);
  } catch (error) {
    return res.status(500).json({ message: "Error al crear la reserva", error: error.message });
  }
};

const getReservas = async (req, res) => {
    try {
      const reservas = await Booking.find().populate('bono'); // Poblar información del bono
      return res.status(200).json(reservas);
    } catch (error) {
      return res.status(500).json({ message: "Error al obtener las reservas", error: error.message });
    }
  };
  
  const updateReserva = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;
  
      // Validación de datos
      if (!updatedData.fecha && !updatedData.bono) {
        return res.status(400).json({ message: "Al menos un campo debe ser proporcionado para actualizar." });
      }
  
      const reservaActualizada = await Booking.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
  
      if (!reservaActualizada) {
        return res.status(404).json({ message: "Reserva no encontrada." });
      }
  
      return res.status(200).json(reservaActualizada);
    } catch (error) {
      return res.status(500).json({ message: "Error al actualizar la reserva", error: error.message });
    }
  };
  
  const deleteReserva = async (req, res) => {
    try {
      const { id } = req.params;
      const reservaEliminada = await Booking.findByIdAndDelete(id);
  
      if (!reservaEliminada) {
        return res.status(404).json({ message: "Reserva no encontrada." });
      }
  
      return res.status(200).json({ message: `La reserva se ha eliminado correctamente.` });
    } catch (error) {
      return res.status(500).json({ message: "Error al eliminar la reserva", error: error.message });
    }
  };


  // se debe crear correctamente ya que cada vez que se confirme una reserva debe lanzarse, de esta forma
  // restará un uso al bono y comprobará si el bono sigue teniendo availableUses, si este es igual a 0 lo pasará a inactivo
  
  const addReservationToBono = async (bonoId, reservationId) => {
    const bono = await Bono.findById(bonoId);
  
    if (!bono || bono.availableUses <= 0) {
      throw new Error('Bono no disponible o sin usos restantes');
    }
  
    bono.reservations.push(reservationId);
    bono.availableUses -= 1;  // Descontar 1 uso disponible
  
    // Si ya no quedan usos disponibles, desactivar el bono
    if (bono.availableUses === 0) {
      bono.active = false;
    }
  
    await bono.save();
  };
  
  module.exports = {
    newReserva,
    getReservas,
    updateReserva,
    deleteReserva,
  };
  