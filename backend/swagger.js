const fs = require("fs");
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const dotenv = require("dotenv");
dotenv.config();

const openApiPath = path.join(__dirname, "openapi.json");
let swaggerSpec = null;

if (fs.existsSync(openApiPath) && fs.statSync(openApiPath).size > 0) {
  try {
    swaggerSpec = JSON.parse(fs.readFileSync(openApiPath, "utf8"));
    console.log("Loaded OpenAPI spec from openapi.json");
  } catch (err) {
    console.error("Failed to parse openapi.json, falling back to swagger-jsdoc", err);
  }
}

if (!swaggerSpec) {
  const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "FixOnTheGo API",
            version: "1.0.0",
            description: "Complete API documentation for FixOnTheGo - On-demand mechanic service platform",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                sessionAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "connect.sid",
                    description: "Session-based authentication via cookie",
                },
            },
        },
        security: [
            {
                sessionAuth: [],
            },
        ],
    },
    apis: ["./routes/*.js", "./swagger-definitions.js"], // scan routes + definitions
};

  swaggerSpec = swaggerJsdoc(options);
}

function setupSwagger(app) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "FixOnTheGo API Docs",
    }));
}

module.exports = setupSwagger;