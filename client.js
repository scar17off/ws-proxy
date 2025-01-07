class WSProxy {
    constructor(urlOrProjectName) {
        this.ws = null;
        
        // Check if it's a full URL or just a project name
        if (urlOrProjectName.includes('://')) {
            // It's a full URL
            this.wsUrl = urlOrProjectName.replace('http://', 'ws://').replace('https://', 'wss://');
            this.httpUrl = urlOrProjectName.replace('ws://', 'http://').replace('wss://', 'https://');
            
            // Ensure URLs end with /
            this.wsUrl = this.wsUrl.endsWith('/') ? this.wsUrl : this.wsUrl + '/';
            this.httpUrl = this.httpUrl.endsWith('/') ? this.httpUrl : this.httpUrl + '/';
        } else {
            // It's a Glitch project name
            this.wsUrl = `wss://${urlOrProjectName}.glitch.me/`;
            this.httpUrl = `https://${urlOrProjectName}.glitch.me/`;
        }
    }

    async checkStatus() {
        try {
            const response = await fetch(`${this.httpUrl}/status`);
            if (response.ok) {
                const data = await response.json();
                return {
                    online: true,
                    connections: data.connections,
                    uptime: data.uptime,
                    data
                };
            }
            return {
                online: false,
                error: `Server responded with status ${response.status}`
            };
        } catch (error) {
            return {
                online: false,
                error: error.message
            };
        }
    }

    connect(targetUrl, options = {}) {
        // Build the connection URL with parameters
        const params = new URLSearchParams();
        params.append('url', targetUrl);

        // Add headers if provided
        if (options.headers) {
            params.append('headers', JSON.stringify(options.headers));
        }

        // Add protocols if provided
        if (options.protocols) {
            params.append('protocols', options.protocols.join(','));
        }

        // Create the full proxy URL
        const fullUrl = `${this.wsUrl}?${params.toString()}`;

        // Create WebSocket connection
        this.ws = new WebSocket(fullUrl);

        // Set up basic event handlers
        this.ws.onopen = () => {
            console.log('Connected to proxy server');
            if (options.onopen) options.onopen();
        };

        this.ws.onclose = (event) => {
            console.log('Disconnected from proxy server:', event.code, event.reason);
            if (options.onclose) options.onclose(event);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            if (options.onerror) options.onerror(error);
        };

        this.ws.onmessage = (event) => {
            if (options.onmessage) options.onmessage(event);
        };

        return this.ws;
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        } else {
            console.error('WebSocket is not connected');
        }
    }

    close() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Example usage:
async function connectToWebSocket() {
    const proxy = new WSProxy('your-glitch-project');

    // Check server status before attempting connection
    const status = await proxy.checkStatus();
    if (!status.online) {
        console.error('Proxy server is offline:', status.error);
        return;
    }

    console.log(`Proxy server is online:
    - Active connections: ${status.connections}
    - Uptime: ${status.uptime}`);

    const options = {
        headers: {
            'User-Agent': 'Custom User Agent',
            'Authorization': 'Bearer your-token-here'
        },
        protocols: ['protocol1', 'protocol2'],
        onopen: () => {
            console.log('Connection established!');
            proxy.send('Hello through proxy!');
        },
        onmessage: (event) => {
            console.log('Received message:', event.data);
        },
        onclose: (event) => {
            console.log('Connection closed:', event.code, event.reason);
        },
        onerror: (error) => {
            console.error('Connection error:', error);
        }
    };

    proxy.connect('wss://target-websocket-server.com', options);
}

// You can call connectToWebSocket() when needed
// For example, when a specific button is clicked or when certain conditions are met
// connectToWebSocket();