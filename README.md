# Saezu
School project<br />
A Twitter-like website build with NodeJS, VueJS and PostgreSQL

![Cover image](screenshots/Saezu1.png?raw=true "Saezu")

## Technologies used

### Front-end 
[VueJS](https://vuejs.org/)
 + Vuetify
 + vuex
 + vue-router
 + axios

[Webpack](https://webpack.js.org/) <br />
[Vue CLI](https://cli.vuejs.org/) for the projet generation <br />

### Back-end
[NodeJS](https://nodejs.org/en/) <br />
[Express](https://expressjs.com/fr/) <br />
[PostgreSQL](https://www.postgresql.org/) <br />
[JSON Web Tokens](https://jwt.io/) for authentification. <br />
[bcrypt](https://www.npmjs.com/package/bcrypt) <br />

## Requirements

NodeJS >= v11.0.0<br />
NPM >= v6.4.1<br />
PostgreSQL >= v10.3<br />
(Project was done originally with NodeJS 9, NPM 5 and PSQL 9)<br />

## Installation

### Build Setup

```bash
# Initialize the database
psql -f ./database.sql --set dbname=saezu
psql -f ./database.sql --set dbname=saezutest
```

```bash
# Go to the server directory and install all dependencies
cd server
npm install
```
```json
// Change the server/config/index.json file according to your configuration
{
  "secretJwt": "YourJwtSecretHere",
  "databaseUrl": "postgres://postgres:yourpasswordhere@localhost:5432/saezu",
  "databaseUrlTest": "postgres://postgres:yourpasswordhere@localhost:5432/saezutest",
  "audience": "You",
  "issuer": "http://localhost:3000/"
}
```
```bash
# Go to client directory and install dependencies
cd client
npm install
```

### Server
```bash
cd server

# Launch the API server
npm start

# Run all tests
npm test
```

### Client
```bash
cd client

# Launch the client
npm start

# Open your browser on http://localhost:8080/, a page should show up.
```
