const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const googleScriptUrl =
    "https://script.google.com/macros/s/AKfycbwopFWk0voUZvae-MoObp2jRkKL4iVPQnbwUX3UD5Ch_y3nL566U7v8oTC5VfymrqleBg/exec";

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
                value.messages.forEach(message => {
                    if (message.type === "text") {
                        const sender = message.from;
                        const textBody = message.text.body;
                        const messageId = message.id; // Get message ID

                        console.log(`Received message from ${sender}: ${textBody}`);

                        // Store response in taskResponses
                        taskResponses[messageId] = {
                            sender: sender,
                            message: textBody,
                            timestamp: Date.now()
                        };

                        // Extract task updates from the message
                        const updates = extractTaskUpdates(textBody);

                        // Send data to Google Apps Script
                        sendToGoogleScript(sender, updates, messageId);
                    }
                });
            } else if (value.statuses) {
                console.log("Message status update received:", JSON.stringify(value.statuses, null, 2));
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

// Function to send extracted data to Google Apps Script
function sendToGoogleScript(sender, updates, messageId) {
    const response = {
        sender: sender,
        taskUpdates: updates,
        messageId: messageId
    };

    axios.post(googleScriptUrl, response)
        .then(res => {
            console.log("Successfully sent to Google Script:", res.data);
            handleTaskResponse(response); // Call handleTaskResponse here
        })
        .catch(error => {
            console.error("Error sending to Google Script:", error.message);
        });
}

// Function to process task responses (placeholder, implement actual logic)
function handleTaskResponse(response) {
    console.log(`Processing task response for ${response.sender}:`, response.taskUpdates);

    // Example: Check if response is within 10-minute window
    const messageId = response.messageId;
    if (taskResponses[messageId] && (Date.now() - taskResponses[messageId].timestamp) <= RESPONSE_WINDOW) {
        console.log(`Task response within valid window:`, response.taskUpdates);
    } else {
        console.log(`Task response outside valid window or missing.`);
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
