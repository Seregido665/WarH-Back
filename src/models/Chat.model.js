const mongoose = require("mongoose");
const Message = require("../models/Message.model");
const UserModel = require("../models/User.model");

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true, // importante
      transform: (doc, ret) => {
        ret.id = ret._id; // copiar _id en id
        delete ret._id; // eliminar _id
      },
    },
    toObject: { virtuals: true },
  },
);

chatSchema.virtual("messages", {
  ref: "Message",
  localField: "_id",
  foreignField: "chat",
  justOne: false,
});

module.exports = mongoose.model("Chat", chatSchema);
