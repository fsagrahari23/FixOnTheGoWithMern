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
        title: "Fixonthego API",
        version: "1.0.0",
        description: "API documentation for Fixonthego",
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 3000}`,
          description: "Local development server",
        },
      ],
      components: {
        securitySchemes: {
          sessionAuth: {
            type: "apiKey",
            in: "cookie",
            name: "connect.sid",
            description:
              "Session cookie used by Passport.js with express-session and MongoStore.",
          },
        },
        responses: {
          UnauthorizedError: {
            description: "Authentication is required or session has expired.",
          },
          ForbiddenError: {
            description: "You do not have permission to access this resource.",
          },
        },
      },
      tags: [
        {
          name: "Auth",
          description: "Authentication and registration endpoints",
        },
        {
          name: "Forgot Password",
          description: "Password reset flow",
        },
        {
          name: "Protected",
          description: "Authenticated routes protected by session",
        },
      ],
    },
    apis: ["./routes/*.js"],
  };

  swaggerSpec = swaggerJsdoc(options);
}

function setupSwagger(app) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    })
  );
}

module.exports = setupSwagger;