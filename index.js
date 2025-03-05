const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const googleScriptUrl =
    "https://script.google.com/macros/s/AKfycbz3c_WWgkaanEpplVwV3G54JRoOa6v3BCyEM-jY6Vt6kV3jPBffqafXsuFkT9jSMdIF/exec";

const RESPONSE_WINDOW = 10 * 60 * 1000; // 10 minutes in milliseconds
const taskResponses = {}; // Temporary storage for tracking messages

// Webhook to receive messages
app.post('/webhook', (req, res) => {
    const body = req.body;

    if (!body || !body.entry || body.entry.length === 0) {
        console.log("Invalid request format.");
        return res.sendStatus(400);
    }

    body.entry.forEach(entry => {
        entry.changes.forEach(change => {
            const value = change.value;

            if (value.messages) {
                console.log("Incoming message received:", JSON.stringify(value.messages, null, 2));
                // Handle incoming messages
            } else if (value.statuses) {
                console.log("Message status update received:", JSON.stringify(value.statuses, null, 2));
                // Handle message delivery status updates
            } else {
                console.log("Unknown event type:", JSON.stringify(value, null, 2));
            }
        });
    });

    res.sendStatus(200);
});

// Function to extract task numbers and statuses (✅/❌) from a message
function extractTaskUpdates(userResponse) {
    const updates = {};
    const regex = /(\d+)(✅|❌)/g;
    let match;

    while ((match = regex.exec(userResponse)) !== null) {
        const taskNumber = parseInt(match[1], 10);
        const status = match[2];
        updates[taskNumber] = status;
    }

    console.log(`Extracted task updates: ${JSON.stringify(updates)}`);
    return updates;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
