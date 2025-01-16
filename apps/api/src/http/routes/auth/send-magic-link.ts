import { prisma } from '@api/lib/prisma';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { env } from '@api/env';
import { sendMail } from '@api/lib/mail/microsoft-exchange/auth';

import type { ZodTypeProvider } from 'fastify-type-provider-zod';

const requestBodySchema = z.object({
  email: z.string().email().describe('Email address of the user attempting to authenticate'),
});

const emptyResponseSchema = z.object({}).describe('An empty response indicating no further action is taken');

const successResponseSchema = z.object({
  message: z.string().describe('A message indicating that an authentication link has been created and sent'),
});

export async function sendAuthLink(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/auth/magic-link',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Generate an authentication link for a user',
        description:
          'This endpoint generates a magic link for user authentication if the provided email exists in the system. If the email exists, a code is generated, stored, and an email is sent with a link to authenticate. If the user does not exist, a success response with no further action is returned.',
        operationId: 'sendMagicLink',
        body: requestBodySchema,
        response: {
          200: z.union([
            emptyResponseSchema.describe(
              'Indicates that no user with the given email was found, hence no authentication link was generated',
            ),
            successResponseSchema.extend({
              message: z
                .literal('Authentication link generated and email sent')
                .describe(
                  'Indicates the authentication link has been successfully generated and emailed',
                ),
            }),
          ]),
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body;

      const user = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (!user) {
        return reply.status(200).send();
      }

      const token = await prisma.token.create({
        data: {
          type: 'ACCESS',
          userId: user.id,
        },
      });

      const authLinkCode = token.id

      const authLink = new URL('/auth', env.API_BASE_URL);

      authLink.searchParams.set('code', authLinkCode);
      authLink.searchParams.set('redirect', env.AUTH_REDIRECT_URL);

      await sendMail(email, 'Authenticate', user.name, authLink.toString());

      return reply.status(200).send();
    },
  );
}