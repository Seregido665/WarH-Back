const Chat = require("../models/Chat.model");

module.exports.createChat = (req, res, next) => {
  const targetUserId = req.body.userId;
  const userSessionId = req.user.id;

  console.log("Target User ID:", targetUserId);
  console.log("User Session ID:", userSessionId);

  /* first lookup if chat already exists */
  Chat.findOne({
    participants: { $all: [userSessionId, targetUserId] },
  })
    .then((existingChat) => {
      if (existingChat) {
        console.log("Chat already exists:", existingChat);
        return res.status(200).json(existingChat);
      } else {
        const newChat = new Chat({
          participants: [userSessionId, targetUserId],
        });

        return newChat.save().then((createdChat) => {
          console.log("New chat created:", createdChat);
          return res.status(201).json(createdChat);
        });
      }
    })
    .catch((err) => {
      console.error("Error finding chat:", err);
      return res
        .status(500)
        .json({ message: "Error finding chat", error: err });
    });
};

module.exports.getChatById = (req, res, next) => {
  Chat.findById(req.params.id)
    .populate("messages")
    .populate("participants")
    .then((chat) => {
      console.log("todo bien", chat);
      return res.status(200).json(chat);
    })
    .catch((err) => {
      console.log("entrooo", err);
      return res.status(400).json(err);
    });
};
