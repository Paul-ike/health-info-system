const express = require('express'); // Import the Express.js framework
const bodyParser = require('body-parser'); // Import the body-parser middleware

const sqlite3 = require('sqlite3').verbose(); // Import the SQLite3 and enabling verbose mode for better debugging

const app = express(); // Create an Express application instance
const port = process.env.PORT || 3000; // Define the port the server will listen on

const Joi = require('joi'); // Import Joi for validation

const validator = require('validator'); // Import the 'validator' library for string validation and sanitization

const basicAuth = require('express-basic-auth'); // Require express-basic-auth

// Basic Authentication
const users = { 'admin': 'secret' }; // Replace with more secure storage in production
app.use(basicAuth({
  users: users,
  challenge: true, // Send WWW-Authenticate header to trigger browser login
  unauthorizedResponse: getUnauthorizedResponse
}));

function getUnauthorizedResponse(req) {
  return req.auth
    ? ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected')
    : 'No credentials provided'
}

// Program validation schema
const programSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required()
});

// Client validation schema
const clientSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  dob: Joi.string().isoDate().required()
});

app.use(bodyParser.json()); // Use body-parser middleware to parse JSON request bodies

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack
    res.status(500).send({ error: 'Something went wrong!' });
});

// Define a route for the root path ("/")
app.get('/', (req, res) => {
  res.send('Health Information System API'); // Send a response to the client
});

// Initialize SQLite database
const db = new sqlite3.Database('health_info.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the health_info database.');

  // A: Creating 'programs' table to store health programs
  db.run(`
    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY,
      name TEXT
    )
  `, (err) => {
    if (err) {
      console.error(err.message);
    }
  });

  // A: Creating 'clients' table to store client info (name + DOB)
  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT,
      dob TEXT
    )
  `, (err) => {
    if (err) {
      console.error(err.message);
    }
  });

  // A: Creating junction table 'client_programs' to handle many-to-many between clients and programs
  db.run(`
    CREATE TABLE IF NOT EXISTS client_programs (
      clientId TEXT,
      programId TEXT,
      FOREIGN KEY (clientId) REFERENCES clients(id),
      FOREIGN KEY (programId) REFERENCES programs(id),
      PRIMARY KEY (clientId, programId)
    )
  `, (err) => {
    if (err) {
      console.error(err.message);
    }
  });
});

// Route to create a new health program
app.post('/programs', (req, res) => {
    // Validate the incoming request body using the program schema
    const { error, value } = programSchema.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message); // Return validation error if any
    }

    const newProgram = {
        id: validator.escape(value.id), // Sanitize input
        name: validator.escape(value.name) // Sanitize input
    };
  
    // Insert the new program into the 'programs' table
    db.run(`INSERT INTO programs (id, name) VALUES (?, ?)`, [newProgram.id, newProgram.name], function(err) {
      if (err) {
        console.error(err.message); // Log the actual DB error
        return res.status(500).send({ error: 'Failed to create program' }); // Send a generic error response
      }
  
      // Log the insertion and return the created program in the response
      console.log(`A row has been inserted with rowid ${this.lastID}`);
      res.status(201).send(newProgram);
    });
  });
  
  // Endpoint to create a new client
  app.post('/clients', (req, res) => {
    // Validate the incoming request body using the client schema
    const { error, value } = clientSchema.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message); // Return validation error if any
    }

    const newClient = {
        id: validator.escape(value.id), // Sanitize input
        name: validator.escape(value.name), // Sanitize input
        dob: validator.escape(value.dob)  // Sanitize input
    };
  
    // Insert the client into the database
    db.run(`INSERT INTO clients (id, name, dob) VALUES (?, ?, ?)`, [newClient.id, newClient.name, newClient.dob], function(err) {
      if (err) {
        console.error(err.message); // Something went wrong during insert
        return res.status(500).send({ error: 'Failed to create client' });
      }

      // Log success and respond with the created client object
      console.log(`A row has been inserted with rowid ${this.lastID}`);
      res.status(201).send(newClient);
    });
  });
  
  // Enroll a client into a specific program
  app.post('/clients/:clientId/enroll', (req, res) => {
    const clientId = req.params.clientId; // Get client ID from the URL
    const programId = req.body.programId; // Get program ID from the request body
  
    // Insert into client_programs table
    db.run(`INSERT INTO client_programs (clientId, programId) VALUES (?, ?)`, [clientId, programId], function(err) {
      if (err) {
        console.error(err.message); // Log DB error if any
        return res.status(500).send({ error: 'Failed to enroll client in program' });
      }

      // Log success and return a confirmation response
      console.log(`A row has been inserted with rowid ${this.lastID}`);
      res.status(201).send({ clientId, programId });
    });
  });
  
  // Fetch all clients, with optional search by name
  app.get('/clients', (req, res) => {
    const query = req.query.query; // Get the search query from URL (if provided)
    let sql = `SELECT * FROM clients`; // Base SQL query to fetch all clients
    let params = [];
  
    // If a search query is present, filter by name using LIKE
    if (query) {
      sql += ` WHERE name LIKE ?`;
      params.push(`%${query}%`);
    }
  
    // Execute the query with optional parameters
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error(err.message); // Execute the query with optional parameters
        return res.status(500).send({ error: 'Failed to enroll client in program' });
      }

      // Return the list of matching clients (or all if no query)
      res.send(rows);
    });
  });
  
  // Get details of a specific client by ID, including their enrolled programs
  app.get('/clients/:clientId', (req, res) => {
    const clientId = req.params.clientId; // Get the client ID from the URL parameter
  
    // Fetch the client details from the 'clients' table
    db.get(`SELECT * FROM clients WHERE id = ?`, [clientId], (err, row) => {
      if (err) {
        console.error(err.message); // Log any error that occurs
        return res.status(500).send({ error: 'Failed to fetch client' });
      }
      if (!row) {
        return res.status(404).send({ error: 'Client not found' }); // Handle the case where the client does not exist
      }
  
      // Fetch enrolled programs
      db.all(`
        SELECT p.id, p.name
        FROM programs p
        JOIN client_programs cp ON p.id = cp.programId
        WHERE cp.clientId = ?
      `, [clientId], (err, programs) => {
        if (err) {
          console.error(err.message); // Log any error that occurs while fetching programs
          return res.status(500).send({ error: 'Failed to fetch enrolled programs' });
        }
  
        // Combine client details with their programs and return as response
        const client = {
          ...row, // client details
          programs: programs || [] // programs the client is enrolled in (empty array if none)
        };
        res.send(client); // Send the combined client data as response
      });
    });
  });
  
// Start the server and listen for incoming requests on the specified port
app.listen(port, () => {
    console.log(`Server listening on port ${port}`); // Log a message to the console when the server starts
});