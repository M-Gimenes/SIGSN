import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'SIGSN API',
    description: 'Sistema de Gestão do Observatório Sidereus Nuncius',
    version: '1.0.0',
  },
  servers: [{ url: 'http://localhost:3333' }],
};

swaggerAutogen({ openapi: '3.0.0' })('./swagger.json', ['./src/routes.js'], doc);
