const express = require("express");
const app = express();
require("dotenv").config();

app.get("/webhook", (req, res) => {
    console.log("Received request:", req.query);

    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
        console.log("WEBHOOK VERIFIED!");
        res.status(200).send(challenge);
    } else {
        console.log("Forbidden - Invalid token");
        res.sendStatus(403);
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running");
});
