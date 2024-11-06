const sequelize = require('./src/config/database'); // Sequelize instance
const app = require('./src/app'); // Express app
const http = require('http'); // To create an HTTPS server
const { initializeWebSocketServer } = require('./src/utils/websocket'); // WebSocket utils
const { PORT } = require('./src/config/env');
// Create an HTTP server from the Express app
const server = http.createServer(app);

const port = PORT;

// Establish database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');

    // Initialize WebSocket server
    initializeWebSocketServer(server);

    // Start the HTTPS server with WebSocket support
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
