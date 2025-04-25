const express = require('express'); // Import the Express.js framework
const bodyParser = require('body-parser'); // Import the body-parser middleware

const sqlite3 = require('sqlite3').verbose(); // Import the SQLite3 and enabling verbose mode for better debugging

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
    // Extract program details from the request body
    const newProgram = {
      id: req.body.id,
      name: req.body.name
    };
  
    // Insert the new program into the 'programs' table
    db.run(`INSERT INTO programs (id, name) VALUES (?, ?)`, [newProgram.id, newProgram.name], function(err) {
      if (err) {
        console.error(err.message); // Log the actual DB error
        return res.status(500).send('Error creating program'); // Send a generic error response
      }
  
      // Log the insertion and return the created program in the response
      console.log(`A row has been inserted with rowid ${this.lastID}`);
      res.status(201).send(newProgram);
    });
  });
  
  app.post('/clients', (req, res) => {
    const newClient = {
      id: req.body.id,
      name: req.body.name,
      dob: req.body.dob
    };
  
    db.run(`INSERT INTO clients (id, name, dob) VALUES (?, ?, ?)`, [newClient.id, newClient.name, newClient.dob], function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Error creating client');
      }
      console.log(`A row has been inserted with rowid ${this.lastID}`);
      res.status(201).send(newClient);
    });
  });
  
  app.post('/clients/:clientId/enroll', (req, res) => {
    const clientId = req.params.clientId;
    const programId = req.body.programId;
  
    // Insert into client_programs table
    db.run(`INSERT INTO client_programs (clientId, programId) VALUES (?, ?)`, [clientId, programId], function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Error enrolling client in program');
      }
      console.log(`A row has been inserted with rowid ${this.lastID}`);
      res.status(201).send({ clientId, programId });
    });
  });
  
  app.get('/clients', (req, res) => {
    const query = req.query.query;
    let sql = `SELECT * FROM clients`;
    let params = [];
  
    if (query) {
      sql += ` WHERE name LIKE ?`;
      params.push(`%${query}%`);
    }
  
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Error fetching clients');
      }
      res.send(rows);
    });
  });
  