const express = require('express');
const cors = require('cors');

const parkingRoute = require('./routes/parkingRoute');

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api",parkingRoute);

module.exports = app;