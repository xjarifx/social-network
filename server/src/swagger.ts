import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Router } from "express";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "social-network-api",
      version: "1.0.0",
    },
  },
  apis: ["./src/modules/**/*.routes.ts"], // scan all route files
});

export const swaggerRouter = Router();

swaggerRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
swaggerRouter.get("/openapi.json", (_req, res) => res.json(swaggerSpec));
