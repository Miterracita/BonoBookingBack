const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    email: { 
      type: String, 
      trim: true, 
      required: true, 
      unique: true,
      validate: {
        validator: function(v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);  // Validación básica de email
        },
        message: props => `${props.value} no es un correo válido.`
      }
    },

    userName: { type: String, trim: true, required: true },
    password: { type: String, trim: true, required: true },
    rol: { type: String, enum: ["admin", "user"], required: true, default: "user" },

    imagenPerfil: { 
      type: String, 
      trim: true, 
      required: false ,
      default: 'https://res.cloudinary.com/dq2daoeex/image/upload/c_thumb,w_200,g_face/v1723660717/Proyecto10/oy1tksyz1ycc1edxcfqb.jpg'
    },

    // Un usuario puede tener varios bonos
    bonos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bono' }],
  },
  {
    timestamps: true,
    collection: "users"
  }
);

// Encriptamos la contraseña si ha sido modificada
userSchema.pre("save", function(next) {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
  next();
});

// Método para verificar la contraseña en futuras autenticaciones
userSchema.methods.comparePassword = function(plainPassword, callback) {
  bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

const User = mongoose.model('User', userSchema);
module.exports = User;
