const Booking = require("../models/booking");
const Bono = require("../models/bono");

const newReserva = async (req, res) => {
  try {
    const { event, bono } = req.body;

    // Validación de datos
    if (!event || !bono) {
      return res.status(400).json({ message: "Faltan datos requeridos." });
    }

    // Verificar que event y bono son objetos completos
    if (typeof event !== 'object' || typeof bono !== 'object') {
      return res.status(400).json({ message: "Datos de evento o bono incorrectos." });
    }

    const nuevaReserva = new Booking({
      evento: event,
      bono: bono     
    });

    const reservaGuardada = await nuevaReserva.save();  // Crear la reserva y guardarla en la base de datos

    // Populate evento y bono
    const reservaCompleta = await Booking.findById(reservaGuardada._id).populate('evento').populate('bono');

    return res.status(201).json(reservaCompleta);
  } catch (error) {
    console.error("Error en newReserva:", error); // Log para depuración
    return res.status(500).json({ message: "Error al crear la reserva", error: error.message });
  }
};

const getReservas = async (req, res) => {
  try {
    const reservas = await Booking.find().populate('bono').populate('evento');;
    return res.status(200).json(reservas);
  } catch (error) {
    console.error("Error en getReservas:", error);
    return res.status(500).json({ message: "Error al obtener las reservas", error: error.message });
  }
};
  
  const updateReserva = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;
  
      // Validación de datos
      if (!updatedData.eventId && !updatedData.bonoId) {
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
      const { bonoId } = req.body; //obtiene el bono del cuerpo de la solicitud
      
      const reservaEliminada = await Booking.findByIdAndDelete(id);
  
      if (!reservaEliminada) {
        return res.status(404).json({ message: "Reserva no encontrada." });
      }

      // Intentar actualizar el bono asociado
      if (bonoId) {
          const bonoActualizado = await Bono.findByIdAndUpdate(
              bonoId,
              { $inc: { availableUses: 1 } }, // Incrementa el campo 'cantidad' en 1
              { new: true } // Retorna el bono actualizado
          );
          console.log("bonoId actualizado:", bonoActualizado); // Verifica el bonoId

          if (!bonoActualizado) {
              console.log(`No se pudo actualizar el bono con ID: ${bonoId}`);
          }
      }

      return res.status(200).json({ message: `La reserva se ha eliminado correctamente.` });
    } catch (error) {
      console.error("Error en deleteReserva:", error);
      return res.status(500).json({ message: "Error al eliminar la reserva o actualizar el bono", error: error.message });
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
  