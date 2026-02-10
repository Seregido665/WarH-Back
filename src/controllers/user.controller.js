const UserModel = require("../models/User.model");
const bcrypt = require("bcryptjs");

module.exports.registerUser = (req, res, next) => {
  const newUser = req.body;
  const userEmail = newUser.email;

  UserModel.findOne({ email: userEmail })
    .then((user) => {
      if (!user) {
        UserModel.create(newUser)
          .then((user) => {
            res.status(201).json("Usuario creado correctamente");
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      } else {
        res.status(422).json({ message: "El usuario ya existe" });
      }
    })
    .catch((err) => {
      return res.status(400).json(err);
    });
};

module.exports.loginUser = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email y contraseña son requeridos" });
  }

  UserModel.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Credenciales incorrectas" });
      } else {
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
          return res.status(401).json({ message: "Credenciales incorrectas" });
        } else {
          return res.status(200).json(user);
        }
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Error del servidor" });
    });
};

module.exports.getUsers = (req, res, next) => {
  const userSession = req.user;

  UserModel.find({ _id: { $ne: userSession.id } })
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      res.json(err);
    });
};

module.exports.getUserById = (req, res, next) => {
  const id = req.params.id;

  UserModel.findById(id)
    .populate("books")
    .then((user) => {
      console.log(user);
      res.json(user);
    })
    .catch((err) => {
      res.json(err);
    });
};
