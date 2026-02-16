const { httpRequestDuration } = require("../metrics/prometheus");

module.exports = (req, res, next) => {
    const start = process.hrtime();

    res.on("finish", () => {
        const diff = process.hrtime(start);
        const duration = diff[0] + diff[1] / 1e9;

        const route =
            req.route && req.route.path
                ? req.baseUrl + req.route.path
                : "unmatched";

        httpRequestDuration
            .labels(req.method, route, res.statusCode)
            .observe(duration);
    });

    next();
};
