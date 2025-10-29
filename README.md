# Charlotte Demo - Webhook Message Display

A real-time webhook message display website with device-specific views and fleet management capabilities.

## Features

- **Dual Webhook Dashboard**: Displays messages from two separate webhooks in real-time
  - Normal dataset webhook
  - Anomalous dataset webhook
- **Device-Specific Views**: View individual device data from Notehub API
- **Device Claiming**: Claim devices to a fleet with a single click

## Prerequisites

- Node.js (v14 or higher)
- npm

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

The server will display the webhook endpoints in the console:
- Normal webhook: `http://localhost:3000/webhook/normal`
- Anomalous webhook: `http://localhost:3000/webhook/anomalous`

## Usage

### Webhook Dashboard

The main dashboard (`http://localhost:3000`) displays two sections:
- **Normal dataset**: Displays messages received on `/webhook/normal`
- **Anomalous dataset**: Displays messages received on `/webhook/anomalous`

Messages appear automatically in real-time using WebSockets.

### Sending Messages to Webhooks

You can send messages to the webhooks using curl or any HTTP client:

```bash
# Send to normal dataset webhook
curl -X POST http://localhost:3000/webhook/normal \
  -H "Content-Type: application/json" \
  -d '{"message": "Normal data point", "value": 42}'

# Send to anomalous dataset webhook
curl -X POST http://localhost:3000/webhook/anomalous \
  -H "Content-Type: application/json" \
  -d '{"message": "Anomaly detected", "severity": "high"}'
```

### Device Views

Access device-specific information at `http://localhost:3000/:devID`

Example: `http://localhost:3000/dev:my-device-123`

The device view:
- Fetches device data from Notehub API
- Displays the data in a formatted view
- Provides a "Claim Device" button to add the device to a fleet

### Claiming Devices

On any device view page:
1. Click the "Claim Device" button at the bottom
2. The device will be added to the configured fleet
3. Device data will automatically refresh after successful claiming

## Configuration

The application uses hard-coded configuration values in `server.js`:
- `projectUid`: The Notehub project UID
- `apiToken`: The Notehub API token
- Fleet UID in `device.html`: The target fleet for device claiming

To modify these values, edit the respective files before starting the server.

## Project Structure

```
charlotte-demo/
├── server.js          # Express server with webhook and API endpoints
├── index.html         # Main dashboard with dual webhook display
├── device.html        # Device-specific view with claiming capability
├── package.json       # Node.js dependencies and scripts
└── README.md          # This file
```

## API Endpoints

- `GET /` - Main webhook dashboard
- `POST /webhook/normal` - Normal dataset webhook endpoint
- `POST /webhook/anomalous` - Anomalous dataset webhook endpoint
- `GET /:devID` - Device-specific view page
- `GET /api/device/:devID` - Fetch device data from Notehub
- `POST /api/device/:devID/claim` - Claim device to fleet
