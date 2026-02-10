const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    email: {
      type: String,
      required: [true, "El email es requerido!"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Por favor ingresa un email valido!",
      ],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "La contraseña es requerida!"],
      minLength: [8, "Almenos 8 caracteres!"],
    },
  },
  {
    toJSON: {
      virtuals: true, // importante
      transform: (doc, ret) => {
        ret.id = ret._id; // copiar _id en id
        delete ret.password;
        delete ret._id; // eliminar _id
      },
    },
    toObject: { virtuals: true },
  },
);

userSchema.virtual("books", {
  ref: "Book",
  localField: "_id",
  foreignField: "user",
  justOne: false,
});

userSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(user.password, salt);
  user.password = hashedPassword;
});

module.exports = mongoose.model("User", userSchema);
