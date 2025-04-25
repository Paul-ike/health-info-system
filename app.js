const express = require('express'); // Import the Express.js framework
const bodyParser = require('body-parser'); // Import the body-parser middleware

const app = express(); // Create an Express application instance
const port = 3000; // Define the port the server will listen on

app.use(bodyParser.json()); // Use body-parser middleware to parse JSON request bodies

// Define a route for the root path ("/")
app.get('/', (req, res) => {
  res.send('Health Information System API'); // Send a response to the client
});

// Start the server and listen for incoming requests on the specified port
app.listen(port, () => {
  console.log(`Server listening on port ${port}`); // Log a message to the console when the server starts
});
