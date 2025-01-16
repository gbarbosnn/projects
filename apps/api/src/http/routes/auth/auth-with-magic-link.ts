import { env } from '@api/env';
import { prisma } from '@api/lib/prisma';
import dayjs from 'dayjs';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';
import { UnauthorizedError } from '../_errors/unauthorized-error';

const querySchema = z.object({
  code: z.string().describe('Unique code associated with the magic link for user authentication'),
  redirect: z.string().url().describe('URL to redirect the user upon successful authentication'),
});


export async function authenticateWithLink(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/auth',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate with magic link',
        description:
          'This endpoint authenticates users using a magic link identified by a unique code. After successful authentication, a JWT is issued and the user is redirected.',
        querystring: querySchema,
      },
    },
    async (request, reply) => {
      try {
        const { code, redirect } = querySchema.parse(request.query);

        if (!redirect.startsWith(env.AUTH_REDIRECT_URL)) {
          throw new BadRequestError('Invalid redirect URL');
        }

        const authLink = await prisma.token.findFirst({
          where: {
            id: code,
          },
        });

        if (!authLink) {
          throw new BadRequestError('Auth link not found');
        }

        const daysSinceAuthLinkCreation = dayjs().diff(authLink.createdAt, 'day');
        if (daysSinceAuthLinkCreation > 1) {
          await prisma.token.delete({
            where: { userId: authLink.userId, id: code },
          });

          throw new BadRequestError('Auth link expired, please generate a new one');
        }

        const user = await prisma.user.findUnique({
          where: { id: authLink.userId },
        });

        if (!user) {
          throw new BadRequestError('User not found');
        }

        const token = await reply.jwtSign({ sub: user.id }, { sign: { expiresIn: '7d' } });

        reply.setCookie('token', token, {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });

        await prisma.token.delete({
          where: { userId: authLink.userId, id: code },
        });

        return reply.redirect(redirect);
      } catch (error) {
        console.error('Internal server error:', error);
        throw new BadRequestError('Internal server error');
      }
    },
  );
}