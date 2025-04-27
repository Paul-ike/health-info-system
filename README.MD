# Health Information System

## Description

A basic health information system for managing clients and health programs/services. This system allows a system user to:

*   Create health programs (e.g., TB, Malaria, HIV, etc.).
*   Register new clients in the system.
*   Enroll a client in one or more programs.
*   Search for a client from a list of registered clients.
*   View a client's profile, including the programs they are enrolled in.
*   Expose the client profile via an API.

## Technologies Used

*   Node.js
*   Express
*   SQLite
*   Joi
*   Validator
*   express-basic-auth

## Installation

1.  Clone the repository:

    ```
    git clone git@github.com:Paul-ike/health-info-system.git
    ```

2.  Navigate to the project directory:

    ```
    cd health-info-system
    ```

3.  Install dependencies:

    ```
    npm install
    ```

## Usage

1.  Start the server:

    ```
    npm start
    ```

2.  Access the API endpoints:

    The API is available at `http://localhost:3000`. Use Thunder Client or a similar tool to test the endpoints.

    **Sample Requests (using curl):**

    *   **Register a new user:**

        ```
        curl -X POST -H "Content-Type: application/json" -d '{"username": "testuser", "password": "password123"}' http://localhost:3000/register
        ```
    *   **Login:**

        ```
        curl -X POST -H "Content-Type: application/json" -d '{"username": "testuser", "password": "password123"}' http://localhost:3000/login
        ```

        (This will return a JWT token. Use this token in the `Authorization` header for subsequent requests.)
    *   **Create a health program:**

        ```
        curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <your_jwt_token>" -d '{"id": "tb1", "name": "Tuberculosis Program"}' http://localhost:3000/programs
        ```
    *   **Register a new client:**

        ```
        curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <your_jwt_token>" -d '{"id": "client1", "name": "John Doe", "dob": "1990-01-01"}' http://localhost:3000/clients
        ```
    *   **Enroll a client in a program:**

        ```
        curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <your_jwt_token>" -d '{"programId": "tb1"}' http://localhost:3000/clients/client1/enroll
        ```
    *   **Search for a client:**

        ```
        curl -X GET -H "Authorization: Bearer <your_jwt_token>" "http://localhost:3000/clients?query=John"
        ```
    *   **View a client's profile:**

        ```
        curl -X GET -H "Authorization: Bearer <your_jwt_token>" http://localhost:3000/clients/client1
        ```

    **Authentication:** All API endpoints are protected with basic authentication. Use the username `admin` and password `secret`.

## Code Structure

*   **`app.js`:** Contains the main application logic, including:
    *   Express server setup and routing
    *   SQLite database initialization and queries
    *   API endpoint definitions
    *   Authentication middleware
    *   Error handling middleware
    *   Validation schemas
*   **Dependencies:** The project uses the following dependencies (defined in `package.json`):
    *   `express`: Web framework for creating the API
    *   `body-parser`: Middleware for parsing request bodies
    *   `sqlite3`: SQLite database client
    *   `joi`: Data validation library
    *   `validator`: Input sanitization library
    *   `express-basic-auth`: Basic authentication middleware

## Security

*   Basic authentication is implemented to protect the API endpoints.
*   Input sanitization is used to prevent SQL injection attacks.

## Possible Improvements

*   Implement JWT-based authentication for enhanced security.
*   Add automated tests to ensure code quality.
*   Deploy the application to a cloud platform.

## Support and Contact Information

For questions or support, please contact:

*   Email: [paulnyoiken@gmail.com](mailto:paulnyoiken@gmail.com)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

[MIT License](LICENSE)
