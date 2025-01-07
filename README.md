# WebSocket Proxy Server

A simple yet powerful WebSocket proxy server that allows you to route WebSocket connections through an intermediate server. This can be useful for bypassing CORS restrictions, adding custom headers, or monitoring WebSocket traffic.

## Features

- WebSocket proxy functionality
- Status endpoint for monitoring
- Connection tracking
- Support for custom headers and protocols
- Easy deployment to platforms like Glitch

## Installation

1. Clone the repository:
```bash
git clone https://github.com/scar17off/ws-proxy
cd ws-proxy
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

## Usage

### Server

The server will start on port 3000 by default. When deployed, it's accessible via:

- WebSocket proxy at `wss://<project-name>.glitch.me` or your custom domain
- Status endpoint at `https://<project-name>.glitch.me/status` or your custom domain

### Client

You can initialize the client in two ways:

```javascript
// 1. Using Glitch project name (recommended for Glitch deployment)
const proxy = new WSProxy('your-project-name');

// 2. Using full URL (for custom deployments)
const proxy = new WSProxy('wss://your-custom-domain.com');
// or
const proxy = new WSProxy('https://your-custom-domain.com');
```

Example usage:
```javascript
// Check server status
const status = await proxy.checkStatus();
if (status.online) {
    console.log(`Server status:
    - Connections: ${status.connections}
    - Uptime: ${status.uptime}`);
}

// Connect to target WebSocket server
const options = {
    headers: {
        'Authorization': 'Bearer your-token'
    },
    protocols: ['protocol1'],
    onmessage: (event) => {
        console.log('Received:', event.data);
    }
};

proxy.connect('wss://target-websocket-server.com', options);
```

### Connection Options

The `connect()` method accepts the following options:

- `headers`: Object containing custom headers to forward
- `protocols`: Array of WebSocket protocols
- `onopen`: Connection opened callback
- `onmessage`: Message received callback
- `onclose`: Connection closed callback
- `onerror`: Error callback

### Status Endpoint

The `/status` endpoint returns:
```json
{
    "status": "ok",
    "connections": 5,
    "uptime": 3600
}
```

## Deployment

### Glitch

1. Create a new Glitch project
2. Import or copy the files
3. Rename the project to your desired name
4. The project will automatically install dependencies and start

Your proxy will be available at `wss://<your-project-name>.glitch.me`

## License

MIT License - feel free to use this project for any purpose.

## Contributing
All contributions are welcome!
