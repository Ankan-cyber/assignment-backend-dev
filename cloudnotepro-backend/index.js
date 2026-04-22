require('dotenv').config();
const MongoConnect = require('./db')
const express = require('express')
const cors = require('cors')

const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'RESET_JWT_SECRET',
  'BREVO_API_KEY',
  'CLIENT_RESET_URL'
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

MongoConnect();

const app = express()
const port = process.env.PORT || 5000;


app.use(express.json())
app.use(cors())

// Available Routes
app.use('/api/v1/auth', require('./routes/auth'))
app.use('/api/v1/notes', require('./routes/notes'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))


app.listen(port, () => {
  console.log(`CloudNotePro listening on port ${port}`)
})
