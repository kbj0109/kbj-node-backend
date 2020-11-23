const express = require('express');
const chalk = require('chalk');
const swagger = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const router = express.Router();

// API Docs
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  router.use(
    '/',
    swagger.serve,
    swagger.setup(
      swaggerJSDoc({
        swaggerDefinition: {
          openapi: '3.0.3',
          info: { title: 'KBJ-Node-Backend API Document', version: '1.0.0' },
        },
        apis: [`./src/docs/**/*.yaml`],
      }),
    ),
  );
  console.log(
    chalk.green.bold(
      `*** Swagger Document is Ready with http://localhost:${process.env.PORT}/docs`,
    ),
  );
}

module.exports = router;
