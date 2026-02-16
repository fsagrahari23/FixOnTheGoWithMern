const client = require("prom-client");

// IMPORTANT: use a custom registry
const register = new client.Registry();

// Collect default metrics into this registry
client.collectDefaultMetrics({
    register,
    prefix: "node_",
});

const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request latency",
    labelNames: ["method", "route", "status_code"],
    registers: [register],
});

module.exports = {
    client,
    register,
    httpRequestDuration,
};
