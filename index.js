const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json()); // Middleware to parse JSON

const googleScriptUrl =
    "https://script.google.com/macros/s/AKfycbz3c_WWgkaanEpplVwV3G54JRoOa6v3BCyEM-jY6Vt6kV3jPBffqafXsuFkT9jSMdIF/exec";

app.post("/webhook", async (req, res) => {
    try {
        console.log("Full request body:", JSON.stringify(req.body, null, 2));

        const messages = req.body.entry?.[0]?.changes?.[0]?.value?.messages;

        if (!messages || messages.length === 0) {
            console.log("No messages array found in request.");
            return res.status(400).send("No message data received.");
        }

        // Combine multiple messages if they exist
        const fullMessage = messages.map(msg => msg.text?.body).join("\n");

        const sender = messages[0].from;

        console.log(`Received message from ${sender}: ${fullMessage}`);

        // Send data to Google Apps Script
        const response = await axios.post(googleScriptUrl, {
            sender: sender,
            message: fullMessage,
        });

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
