const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Import background cron jobs — starts automatically when server starts
require('./fetch-newsletters.js');

// Root health check
app.get('/', (req, res) => {
    res.send('INSOVANT Backend is running successfully!');
});

// /health — UptimeRobot / external ping hits this to keep server awake
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`[INSOVANT] Server running on port ${PORT}`);
});
