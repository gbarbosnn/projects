import { prisma } from "@api/lib/prisma";
import type { FastifyInstance } from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { UnauthorizedError } from '../_errors/unauthorized-error';

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("preHandler", async (request) => {
    request.getCurrentUserId = async (): Promise<string> => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>();

        return sub;
      } catch {
        throw new UnauthorizedError("Invalid token");
      }
    };

    request.getUserMembership = async (slug: string) => {
      const userId = await request.getCurrentUserId();

      const member = await prisma.organizationMember.findFirst({
        where: {
          userId,
          organization: {
            slug,
          },
        },
        include: {
          organization: true,
        },
      });

      if (!member) {
        throw new UnauthorizedError(`You're not a member of this enterprise.`);
      }

      const { organization, ...membership } = member;

      return {
        organization,
        membership,
      };
    };
  });
});