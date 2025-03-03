const express = require("express");
const app = express();

app.use(express.json());

// Step 1: Meta (Facebook) Webhook Verification
app.get("/webhook", (req, res) => {
    const VERIFY_TOKEN = "your_verify_token";
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Step 2: Receive WhatsApp Messages
app.post("/webhook", (req, res) => {
    console.log("Received a message:", JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Webhook server running on port ${PORT}`));
