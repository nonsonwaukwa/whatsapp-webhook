const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json()); // Middleware to parse JSON requests

// Webhook verification
app.get("/webhook", (req, res) => {
    console.log("Received GET request:", req.query);

    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
        console.log("Webhook verified successfully!");
        res.status(200).send(challenge);
    } else {
        console.log("Forbidden - Invalid verify token");
        res.sendStatus(403);
    }
});

// Webhook for handling incoming messages
app.post("/webhook", (req, res) => {
    console.log("Received POST request:", JSON.stringify(req.body, null, 2));

    if (req.body.object === "whatsapp_business_account") {
        res.sendStatus(200); // Acknowledge receipt
    } else {
        res.sendStatus(404);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
