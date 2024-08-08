
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const prRouter = require('./routes/pr.js')
const gitRouter = require('./routes/github.js')

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.use("/api",prRouter)
app.use("/api",gitRouter)


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
