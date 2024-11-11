const { deleteFile } = require("../../utils/deleteFiles");
const { generateSing } = require("../../utils/jwt");
const User = require("../models/User");
const Bono = require("../models/bono");
const bcrypt = require("bcrypt");

//postUser - create
const registro = async (req, res, next) => {
  try {
    console.log('Request Body:', req.body);
    console.log('Request File:', req.file);
    
    const newUser = new User({
      email: req.body.email,
      userName: req.body.userName,
      password: req.body.password,
      rol: req.body.rol,
      // imagenPerfil: req.body.imagenPerfil
      imagenPerfil: req.file ? req.file.path : '',
    });

    // if (req.file) {
    //   newUser.imagenPerfil = req.file.path
    // }

    // Comprobar si el usuario ya existe por email o nombre de usuario
    const userDuplicated = await User.findOne({ 
      $or: [{ email: req.body.email }, { userName: req.body.userName }] 
    });

    //si un usuario ya existe nos salta un mensaje de aviso y no crea el nuevo usuario
    if (userDuplicated) {
      return res.status(400).json("Ese nombre de usuario ya existe");
    }
    
    // Guardar el nuevo usuario
    const userSaved = await newUser.save();
    return res.status(200).json(userSaved);

  } catch (error) {
    return res.status(400).json(error);
  }
}

// LOGIN
const login = async (req, res, next) => {

  try {
    
    const user = await User.findOne({ userName: req.body.userName });
    
    if (!user){
      return res.status(400).json("Este nombre de usuario no existe");   
    }

    // Comparar la contraseña
    const isMatch = bcrypt.compareSync(req.body.password, user.password);
    
    if (!isMatch) {
      return res.status(400).json("La contraseña es incorrecta");
    }

    // Generar el token JWT
    const token = generateSing(user._id, user.rol);
    
    // Enviar el token y datos del usuario (sin la contraseña)
    return res.status(200).json({
      token,
      user: {
        userName: user.userName,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (error) {
    return res.status(400).json(error);
  }
}

// borrar user
const deleteUser = async (req, res, next) => {
  try {    
    const { id } = req.params;
    const userDeleted = await User.findByIdAndDelete(id);
    
    if (!userDeleted) {
      return res.status(404).json("Usuario no encontrado");
    }

    // Eliminar imagen si existe
    if (userDeleted.imagenPerfil) {
      deleteFile(userDeleted.imagenPerfil);
    }

    // Actualizar bonos asociados para desasignarlos del usuario
    await Bono.updateMany({ user: id }, { $unset: { user: "" } });

    return res.status(200).json(`El usuario ${userDeleted.userName} se ha eliminado correctamente`);

  } catch (error){
    return res.status(400).json({message: "Error al eliminar el usuario", error: error.message });
  }
}

//ver todos los usuarios
const getUsers = async (req, res, next) => {

  try {
    // Obtener usuarios y poblar sus bonos
    const users = await User.find().populate('bonos');
    return res.status(200).json(users);

  } catch (error){
    console.error('Error fetching users:', error.message);
    return res.status(400).json({ message: "Error al obtener los usuarios", error: error.message });
  }
}

//actualizar un usuario (por ID)
const updateUser = async (req, res, next) => {
  try {
      const { id } = req.params;
      const updatedData = req.body;

    // Validación de datos
    if (!updatedData.userName && !updatedData.email && !updatedData.bonos && !req.file) {
      return res.status(400).json({ message: "Al menos un campo debe ser proporcionado para actualizar." });
    }

      // Si se envía una nueva imagen, actualizar y eliminar la vieja
      if (req.file) {
        updatedData.imagenPerfil = req.file.path;
        const oldUsuario = await User.findById(id);
        if (oldUsuario.imagenPerfil) {
          deleteFile(oldUsuario.imagenPerfil);
        }
      }

      if (updatedData.password) {
        delete updatedData.password;  // Evitar la actualización de la contraseña desde aquí
      }

      // Verificar y actualizar los bonos
      if (updatedData.bonos && Array.isArray(updatedData.bonos)) {
        // Usar `$set` para reemplazar el arreglo completo o `$addToSet` para agregar bonos sin duplicados
        await User.findByIdAndUpdate(id, { $set: { bonos: updatedData.bonos } }, { new: true, runValidators: true });
      }
      if (updatedData.bonos) {
        if (updatedData.bonos.add) {
          // Añadir bonos sin duplicados
          await User.findByIdAndUpdate(id, { $addToSet: { bonos: { $each: updatedData.bonos.add } } });
        }
        if (updatedData.bonos.remove) {
          // Eliminar bonos específicos
          await User.findByIdAndUpdate(id, { $pull: { bonos: { $in: updatedData.bonos.remove } } });
        }
      }
      

      const userActualizado = await User.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
      if (!userActualizado) {
        return res.status(404).json("Usuario no encontrado");
      }

      return res.status(201).json(userActualizado);

  } catch (error){
    console.error("Error al actualizar el usuario:", error.message);
    return res.status(400).json({ message: "Error al actualizar el usuario", error: error.message });
  }
}

// CONTROLADOR PARA FILTROS DEL FRONT - REALIZAR BÚSQUEDA POR USERNAME O EMAIL
const searchUsers = async (req, res, next) => {
  const { username, email } = req.query;

    //primero comprobamos que no envien ambos campos, sólo uno
    if (username && email) {
      return res.status(400).json({
        message: "Solo se puede realizar la búsqueda por 'username' o 'email', no ambos.",
      });
    }

 // Inicia el objeto de filtro vacío
  const filter = {};

  if (username) {
    // Si el usuario escribió algo en el campo de 'username', añadimos esa condición al filtro
      filter.userName = { $regex: username, $options: 'i' }; // Búsqueda insensible a mayúsculas
  }
  if (email) {
    // Si el usuario escribió algo en el campo de 'email', añadimos esa condición al filtro
      filter.email = { $regex: email, $options: 'i' }; // Búsqueda insensible a mayúsculas
  }

  try {
      const users = await User.find(filter);
      res.status(200).json(users);
  } catch (error) {
      res.status(500).json({ message: "Error en la búsqueda", error: error.message });
  }
};


module.exports = { 
  registro,
  login,
  deleteUser,
  getUsers,
  updateUser,
  searchUsers,
};