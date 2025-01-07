const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const url = require('url');

// Create Express app
const app = express();

// Track active connections
let activeConnections = 0;

// Add status endpoint
app.get('/status', (req, res) => {
    res.status(200).json({
        status: 'ok',
        connections: activeConnections,
        uptime: process.uptime()
    });
});

// Create HTTP server from Express app
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Handle incoming WebSocket connections
wss.on('connection', (clientWs, req) => {
    activeConnections++;
    console.log(`New connection. Total connections: ${activeConnections}`);

    // Parse the URL parameters
    const params = url.parse(req.url, true).query;
    const targetUrl = params.url;

    if (!targetUrl) {
        clientWs.close(1008, 'Target URL is required');
        activeConnections--;
        return;
    }

    try {
        // Create connection to target WebSocket server
        const targetWs = new WebSocket(targetUrl, {
            headers: {
                ...(params.headers ? JSON.parse(params.headers) : {})
            },
            protocols: params.protocols ? params.protocols.split(',') : []
        });

        targetWs.on('open', () => {
            console.log(`Connected to target: ${targetUrl}`);
        });

        targetWs.on('error', (error) => {
            console.error('Target connection error:', error);
            clientWs.close(1011, 'Target connection error');
        });

        clientWs.on('message', (data) => {
            if (targetWs.readyState === WebSocket.OPEN) {
                targetWs.send(data);
            }
        });

        targetWs.on('message', (data) => {
            if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(data);
            }
        });

        clientWs.on('close', () => {
            console.log('Client disconnected');
            activeConnections--;
            console.log(`Connection closed. Total connections: ${activeConnections}`);
            if (targetWs.readyState === WebSocket.OPEN) {
                targetWs.close();
            }
        });

        targetWs.on('close', () => {
            console.log('Target disconnected');
            if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.close();
            }
        });

    } catch (error) {
        console.error('Failed to create target connection:', error);
        clientWs.close(1011, 'Failed to create target connection');
        activeConnections--;
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Status endpoint: http://localhost:${PORT}/status`);
});