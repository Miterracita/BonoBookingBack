const Evento = require("../models/evento");

// Crear un nuevo evento
const newEvent = async (req, res, next) => {
  try {
    const nuevoEvento = new Evento(req.body);
    const eventoGuardado = await nuevoEvento.save();
    return res.status(201).json(eventoGuardado);
  } catch (error) {
    return res.status(400).json({ message: "Error al crear el evento", error: error.message });
  }
};

// Obtener todos los eventos
const getEvents = async (req, res, next) => {
  try {
    const eventos = await Evento.find();
    return res.status(200).json(eventos);
  } catch (error) {
    return res.status(400).json({ message: "Error al obtener los eventos", error: error.message });
  }
};


// Actualizar un evento (por ID)
const updateEvents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const eventoActualizado = await Evento.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

    if (!eventoActualizado) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    return res.status(200).json(eventoActualizado);
  } catch (error) {
    return res.status(400).json({ message: "Error al actualizar el evento", error: error.message });
  }
};

// Eliminar un evento (por ID)
const deleteEvents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eventoEliminado = await Evento.findByIdAndDelete(id);

    if (!eventoEliminado) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    return res.status(200).json({ message: `El evento ${eventoEliminado.name} se ha eliminado correctamente` });
  } catch (error) {
    return res.status(400).json({ message: "Error al eliminar el evento", error: error.message });
  }
};

// CONTROLADOR PARA FILTROS DEL FRONT - REALIZAR BÚSQUEDA POR nombre
const searchBonos = async (req, res, next) => {
	const { name } = req.query;

	if (!name) {
        return res.status(400).json({ message: 'El parámetro "name" es requerido' });
    }

	try {
		// Dividir la cadena de búsqueda en palabras individuales
		const words = name.split(' ').filter(word => word);
		// Buscar todas las palabras en cualquier orden
		const todas = new RegExp(words.map(word => `(?=.*${word})`).join(''), 'i');
		// Buscar eventos que coincidan con todas las palabras
		const eventsByName = await Evento.find({ name: todas });        

        // Si no se encuentra ningún evento
        if (eventsByName.length === 0) {
            return res.status(404).json({ message: 'No se encontraron eventos que coincidan con la búsqueda' });
        }

        // Si se encuentra el evento, devolverlo
        return res.status(200).json(eventsByName);
    } catch (err) {
		console.error('Error al obtener el evento:', err);
        return res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
}

module.exports = {
  newEvent,
  getEvents,
  updateEvents,
  deleteEvents,
  searchBonos,
};
