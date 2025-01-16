import { prisma } from '@api/lib/prisma';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';

export const createAccountSchema = z.object({
  name: z.string().describe('First username'),
  email: z.string().email().describe('User email'),
  username: z.string().describe('Username'),
})

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Create a new account',
        description: 'Create a new user account by providing a unique email, username and first name. ',
        body: createAccountSchema,
        response: {
          200: z.object({
            message: z.string().describe('Success message indicating that the user was created successfully'),
          }),
        }
      }
    },
    async (request, reply) => {
      const { email, name, username } = request.body;

      const userWithSameEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (userWithSameEmail) {
        throw new BadRequestError('User with same e-mail already exists');
      }

      await prisma.user.create({
        data: {
          email,
          name,
          username
        }
      });

      return reply.status(201).send({ message: 'User created' });
    }
  );
}
