require("dotenv").config();
const express = require("express");
const http = require("http");
const https = require("https");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const projectUid = process.env.PROJECT_UID;
const apiToken = process.env.API_TOKEN;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// Broadcast to all connected WebSocket clients
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Webhook endpoint for normal dataset
app.post("/webhook/normal", (req, res) => {
  const message = {
    type: "normal",
    data: req.body,
    timestamp: new Date().toISOString(),
  };
  console.log("Normal webhook received:", message);
  broadcast(message);
  res.status(200).json({ status: "received" });
});

// Webhook endpoint for anomalous dataset
app.post("/webhook/anomalous", (req, res) => {
  const message = {
    type: "anomalous",
    data: req.body,
    timestamp: new Date().toISOString(),
  };
  console.log("Anomalous webhook received:", message);
  broadcast(message);
  res.status(200).json({ status: "received" });
});

// Device-specific view
app.get("/claim/:devID", (req, res) => {
  const devID = req.params.devID;

  // Avoid serving this route for static files
  if (devID.includes(".")) {
    return res.status(404).send("Not found");
  }

  res.sendFile(path.join(__dirname, "device.html"));
});

// API endpoint to fetch device data
app.get("/api/device/:devID", (req, res) => {
  const devID = req.params.devID;
  const apiUrl = `https://api.notehub.io/v1/projects/${projectUid}/devices/${devID}`;
  //const apiUrl = `https://api.notefile.net/v1/projects/${devID}/devices`;

  const options = {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
  };

  https
    .get(apiUrl, options, (apiRes) => {
      let data = "";

      apiRes.on("data", (chunk) => {
        data += chunk;
      });

      apiRes.on("end", () => {
        console.log("Received: ", data);
        res.status(apiRes.statusCode).send(data);
      });
    })
    .on("error", (error) => {
      console.error("Error fetching device data:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch device data", message: error.message });
    });
});

// API endpoint to claim device (update fleet)
app.post("/api/device/:devID/claim", (req, res) => {
  const devID = req.params.devID;
  const { fleetUID } = req.body;

  if (!fleetUID) {
    return res.status(400).json({ error: "fleetUID is required" });
  }

  const apiUrl = `https://api.notehub.io/v1/projects/${projectUid}/fleets/${fleetUID}`;
  const requestBody = JSON.stringify({
    addDevices: [devID],
  });

  const options = {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
  };

  const apiReq = https.request(apiUrl, options, (apiRes) => {
    let data = "";

    apiRes.on("data", (chunk) => {
      data += chunk;
    });

    apiRes.on("end", () => {
      console.log("Claim device response: ", data);
      res.status(apiRes.statusCode).send(data);
    });
  });

  apiReq.on("error", (error) => {
    console.error("Error claiming device:", error);
    res
      .status(500)
      .json({ error: "Failed to claim device", message: error.message });
  });

  apiReq.write(requestBody);
  apiReq.end();
});

// WebSocket connection handler
wss.on("connection", (ws) => {
  console.log("New WebSocket client connected");
  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Normal webhook: http://localhost:${PORT}/webhook/normal`);
  console.log(`Anomalous webhook: http://localhost:${PORT}/webhook/anomalous`);
});
