const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
const http = require('http');
const socketIO = require('socket.io');
const pool = require('./dataBase');
const AppError = require('./utils/appError');

// createDatabaseTables();

const server = http.createServer(app);
const io = socketIO(server);

// Define an array to store active chat sessions
const activeSessions = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle joining a chat session
  socket.on('join', (user) => {
    const { id, src } = user;

    // Store the user information in the socket's data
    socket.data.user = user;

    // Check if the user is a moderator
    const isModerator = src === 'personal';

    if (isModerator) {
      // If the user is a moderator, create an empty array for their assigned users
      activeSessions[id] = [];
    } else {
      // Find a moderator with the fewest assigned users
      const moderator = Object.entries(activeSessions).reduce(
        (minModerator, [moderatorId, users]) => {
          if (!minModerator || users.length < minModerator.users.length) {
            return { id: moderatorId, users };
          }
          return minModerator;
        },
        null
      );

      if (moderator) {
        // Assign the user to the moderator with the fewest assigned users
        activeSessions[moderator.id].push(socket);
      } else {
        // If no moderators are online, notify the user that there are no available moderators
        socket.emit('noModeratorsAvailable');
      }
    }

    // Notify the user that they have joined the chat session
    socket.emit('chatJoined');
  });

  // Handle incoming messages
  socket.on('chatMessage', (message) => {
    const { id } = socket.data.user;

    // Find the moderator's socket for the user
    const moderatorSocket = Object.values(io.sockets.sockets).find(
      (s) => s.data.user.id === id
    );

    if (moderatorSocket) {
      // Emit the message only to the moderator's socket
      moderatorSocket.emit('chatMessage', message);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');

    // Find the corresponding chat session for the user
    const { id } = socket.data.user;

    if (activeSessions[id]) {
      // Remove the socket from the moderator's assigned users array
      activeSessions[id] = activeSessions[id].filter(
        (userSocket) => userSocket !== socket
      );

      // If there are no more assigned users for the moderator, remove the session
      if (activeSessions[id].length === 0) {
        delete activeSessions[id];
      }
    }
  });
});

// const wss = new WebSocket.Server({ port: 8080 });

// wss.on('connection', (ws) => {
//   console.log('WebSocket connection established.');

//   ws.on('message', (message) => {
//     console.log(`Received message: ${message}`);
//     ws.send('Message received on the server.');
//   });
//   ws.on('close', () => {
//     console.log('WebSocket connection closed.');
//   });
// });

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
