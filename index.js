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
app.post("/webhook", async (req, res) => {
    try {
        console.log("Full request body:", JSON.stringify(req.body, null, 2));

        const messages = req.body.entry?.[0]?.changes?.[0]?.value?.messages;

        if (!messages || messages.length === 0) {
            console.log("No messages array found in request.");
            return res.status(400).send("No message data received.");
        }

        const fullMessage = messages.map(msg => msg.text?.body).join("\n");
        const sender = messages[0].from;
        const messageId = messages[0].id;

        console.log(`Received message from ${sender}: ${fullMessage}`);

        // Process task response
        const updates = extractTaskUpdates(fullMessage);

        if (Object.keys(updates).length > 0) {
            // Send structured updates to Google Apps Script
            try {
                const response = await axios.post(googleScriptUrl, {
                    sender: sender,
                    updates: updates,
                });

                console.log("Google Apps Script Response:", response.data); // Log Google Apps Script response
                res.status(200).send("Task update processed and forwarded to Google Sheets!");
            } catch (error) {
                console.error("Error sending data to Google Apps Script:", error.response?.data || error.message);
                res.status(500).send("Failed to forward message to Google Sheets.");
            }

            res.status(200).send("Task update processed and forwarded to Google Sheets!");
        } else {
            res.status(200).send("No valid task update found.");
        }
    } catch (error) {
        console.error("Error forwarding message:", error);
        res.status(500).send("Failed to forward message.");
    }
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
