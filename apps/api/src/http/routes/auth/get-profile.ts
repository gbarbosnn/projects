import { prisma } from '@api/lib/prisma';

import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { auth } from '../_middlewares/auth';
import { BadRequestError } from '../_errors/bad-request-error';

const userResponseSchema = z.object({
  user: z
    .object({
      id: z.string().describe('Unique identifier for the user'),
      name: z.string().describe('Name of the user'),
      email: z.string().email().describe('Email of the user'),
      username: z.string().describe('Username of the user'),
    })
    .describe('Authenticated user information'),
});


export async function getProfile(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/profile',
      {
        schema: {
          tags: ['Auth', 'User'],
          summary: 'Retrieve authenticated user data',
          description:
            'This endpoint retrieves the user data associated with the provided JWT token stored in cookies. If the token is invalid or the user is not found, appropriate error responses are returned.',
          operationId: 'getProfile',
          security: [{ bearerAuth: [] }],
          response: {
            200: userResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();

        const user = await prisma.user.findUnique({
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
          where: {
            id: userId,
          },
        });

        if (!user) {
          throw new BadRequestError('User not found');
        }

        return reply.status(200).send({ user });
      },
    );
}