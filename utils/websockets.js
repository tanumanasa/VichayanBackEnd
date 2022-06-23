let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

class WebSockets {
    users = [];
    
    connection(client) {
       //when ceonnect
  console.log("a user connected.", client.id);

  //take userId and socketId from user
  client.on("addUser", (userId) => {
    addUser(userId, client.id);
    io.emit("getUsers", users);
  });

  //send and get message
  client.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  //when disconnect
  client.on("disconnect", () => {
    console.log("a user disconnected!", client.id);
    removeUser(client.id);
    io.emit("getUsers", users);
  });
    }
  
  }
  
const webSockets = new WebSockets();

module.exports = {
    webSockets
}
  