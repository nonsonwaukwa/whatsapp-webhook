const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json()); // Middleware to parse JSON

const googleScriptUrl =
    "https://script.google.com/macros/s/AKfycbz3c_WWgkaanEpplVwV3G54JRoOa6v3BCyEM-jY6Vt6kV3jPBffqafXsuFkT9jSMdIF/exec";

app.post("/webhook", async (req, res) => {
    try {
        console.log("Received webhook event:", JSON.stringify(req.body, null, 2)); // Log full request body

        const messageData = req.body.messages?.[0];
        if (!messageData) {
            console.log("No message data found in request.");
            return res.status(400).send("No message data received.");
        }

        const text = messageData.text?.body;
        const sender = messageData.from;

        console.log(`Received message from: ${sender}`);
        console.log(`Message content: ${text}`);

        // Send data to Google Apps Script
        const response = await axios.post(googleScriptUrl, {
            sender: sender,
            message: text,
        });

        console.log("Message successfully forwarded to Google Sheets!");

        res.status(200).send("Message forwarded to Google Sheets!");
    } catch (error) {
        console.error("Error forwarding message:", error);
        res.status(500).send("Failed to forward message.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
