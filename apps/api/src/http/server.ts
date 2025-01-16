import { fastify } from 'fastify'
import fastifyCors from '@fastify/cors'
import fCookies from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";

import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider
} from 'fastify-type-provider-zod'

import { authenticateWithLink, createAccount, getProfile, sendAuthLink } from './routes'

import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { env } from '@api/env';
import { errorHandler } from './error-handler';

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors)
app.register(fCookies);
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
});

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'SampleApi',
      description: 'Sample backend service',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    servers: [],
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs"
});

app.setErrorHandler(errorHandler)

//auth 
app.register(createAccount)
app.register(sendAuthLink)
app.register(authenticateWithLink)
app.register(getProfile)

app.listen({
  port: 3333
}).then(() => {
  console.log('HTTP server running🔥')
})