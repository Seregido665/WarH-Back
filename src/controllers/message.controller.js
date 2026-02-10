const Message = require("../models/Message.model");

module.exports.createMessage = (req, res, next) => {
  const text = req.body.text;
  const chatId = req.body.chatId;
  const senderId = req.user.id;

  console.log("Creating message:", { text, chatId, senderId });

  const newMessage = new Message({
    sender: senderId,
    chat: chatId,
    text: text,
  });

  newMessage
    .save()
    .then((createdMessage) => {
      console.log("Message created successfully:", createdMessage);
      return res.status(201).json(createdMessage);
    })
    .catch((err) => {
      console.error("Error creating message:", err);
      return res
        .status(500)
        .json({ message: "Error creating message", error: err });
    });
};
