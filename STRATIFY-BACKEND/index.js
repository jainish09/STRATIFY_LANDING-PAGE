const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Import your background cron jobs so they start when the server starts
require('./fetch-newsletters.js');

app.get('/', (req, res) => {
    res.send('Stratify Backend is running successfully!');
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running and listening on port ${PORT}`);
});
