const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json())
app.use(cors())

app.use('/algorithm', require('./routes/alogrithms'));

app.listen(80, () => {
    console.log('Server listening on port 3000');
});
