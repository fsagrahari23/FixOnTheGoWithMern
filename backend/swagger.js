const fs = require("fs");
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const openApiPath = path.join(__dirname, "openapi.json");
let swaggerSpec;

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
        title: "Fixonthego API",
        version: "1.0.0",
        description: "API documentation for fixonthego",
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 3005}`,
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ["./routes/*.js"], // scan routes
  };

  swaggerSpec = swaggerJsdoc(options);
}

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;

