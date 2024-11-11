const Bono = require("../models/bono");
const User = require("../models/User");

//Crear Bono
const newBono = async (req, res, next) => {
  try {

    const newBono = new Bono({
      name: req.body.name,
      type: req.body.type,
      active: req.body.active,
      code: req.body.code || undefined,
      user: req.body.user || undefined
    });

    const bonoSaved = await newBono.save();
    return res.status(200).json(bonoSaved);

  } catch (error) {
    console.error("Error en el backend al crear el bono:", error);
    return res.status(400).json({ message: "Error al crear el bono", error: error.message });
  }
}

//Borrar bono
const deleteBono = async (req, res, next) => {
  try {    
    const { id } = req.params;
    const bonoDeleted = await Bono.findByIdAndDelete(id);

    if (!bonoDeleted) {
      return res.status(404).json("Bono no encontrado");
    }

    return res.status(200).json(`El bono ${bonoDeleted.name} se ha eliminado correctamente`);

  } catch (error){
    return res.status(400).json({ message: "Error al eliminar el bono", error: error.message });
  }
}

//ver todos los bonos
const getBonos = async (req, res, next) => {

  try {
    // const bonos = await Bono.find();
    const bonos = await Bono.find().populate('user');

    return res.status(200).json(bonos);

  } catch (error){
    return res.status(400).json({ message: "Error al obtener los bonos", error: error.message });
  }
}

const updateBono = async (req, res, next) => {
  try {
    const bonoId = req.params.id;
    const updateData = req.body;
    const userId = updateData.user;

    // actualizamos el bono
    const updatedBono = await Bono.findByIdAndUpdate(bonoId, updateData, { new: true });

    if (updatedBono) {
      // Si estamos asignando un usuario, actualizamos el usuario con el bono que le hemos asignado
      if (userId) {
        await User.findByIdAndUpdate(userId, { $addToSet: { bonos: bonoId } });
      }
      res.json({ success: true, bono: updatedBono });
    } else {
      res.status(404).json({ success: false, message: 'Bono no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar el bono:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el bono' });
  }
}

// CONTROLADOR PARA FILTROS DEL FRONT - REALIZAR BÚSQUEDA POR codigo o usuario asignado
// const searchBonos = async (req, res, next) => {
//   const { code, user } = req.query;

//   //primero comprobamos que no envien ambos campos, sólo uno
//   if (code && user) {
//     return res.status(400).json({
//       message: "Solo se puede realizar la búsqueda por 'code' o 'user', no ambos.",
//     });
//   }

//  // Inicia el objeto de filtro vacío
//   const filter = {};

//   if (code) {
//     // Si el usuario escribió algo en el campo de 'code', añadimos esa condición al filtro
//       filter.code = { $regex: code, $options: 'i' }; // Búsqueda insensible a mayúsculas
//   }
//   if (user) {
//     // Si el usuario escribió algo en el campo de 'user', añadimos esa condición al filtro
//       filter.user = user; // Búsqueda directa por ObjectId
//   }

//   try {
//       const bonos = await Bono.find(filter);
//       res.status(200).json(bonos);
//   } catch (error) {
//       res.status(500).json({ message: "Error en la búsqueda", error: error.message });
//   }
// };

const searchBonos = async (req, res, next) => {
  const { code, user } = req.query;

  // Primero comprobamos que no envíen ambos campos, solo uno
  if (code && user) {
    return res.status(400).json({
      message: "Solo se puede realizar la búsqueda por 'code' o 'user', no ambos.",
    });
  }

  // Inicia el objeto de filtro vacío
  const filter = {};

  if (code) {
    // Si el usuario escribió algo en el campo de 'code', añadimos esa condición al filtro
    filter.code = { $regex: code, $options: 'i' }; // Búsqueda insensible a mayúsculas
  }

  if (user) {
    try {
      // Buscar el usuario por nombre de usuario
      const foundUser = await User.findOne({ userName: { $regex: user, $options: 'i'} });
      console.log(foundUser);

      if (!foundUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      // Añadir el ObjectId del usuario al filtro
      filter.user = foundUser._id;

    } catch (error) {
      return res.status(500).json({ message: "Error al buscar el usuario", error: error.message });
    }
  }

  try {
    // const bonos = await Bono.find(filter); //aplicamos el filtro
    const bonos = await Bono.find(filter).populate('user');
    res.status(200).json(bonos);

  } catch (error) {
    res.status(500).json({ message: "Error en la búsqueda", error: error.message });
  }
};


module.exports = { 
  newBono,
  deleteBono,
  getBonos,
  updateBono,
  searchBonos,
};