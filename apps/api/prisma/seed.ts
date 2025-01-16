import { PrismaClient, Role, TokenType, Status } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.organizationMember.deleteMany({});
  await prisma.proposalComment.deleteMany({});
  await prisma.approval.deleteMany({});
  await prisma.stakeholder.deleteMany({});
  await prisma.proposal.deleteMany({});
  await prisma.invite.deleteMany({});

  await prisma.token.deleteMany({});
  await prisma.user.deleteMany({});

  const user1 = await prisma.user.create({
    data: {
      name: 'Gustavo',
      email: 'gbarbosn@gmail.com',
      username: 'gustavo',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Guido',
      email: 'guido@example.com',
      username: 'guido',
    },
  });

  const organization = await prisma.organization.create({
    data: {
      name: 'Tech Solutions',
      slug: 'tech-solutions',
      ownerId: user1.id,
    },
  });

  await prisma.organizationMember.create({
    data: {
      role: Role.ADMIN,
      organizationId: organization.id,
      userId: user1.id,
    },
  });

  await prisma.organizationMember.create({
    data: {
      role: Role.MEMBER,
      organizationId: organization.id,
      userId: user2.id,
    },
  });

  // const invite = await prisma.invite.create({
  //   data: {
  //     name: 'Carlos Pereira',
  //     email: 'carlos.pereira@example.com',
  //     role: Role.MEMBER,
  //     organizationId: organization.id,
  //     authorId: user1.id,
  //   },
  // });


  const proposal = await prisma.proposal.create({
    data: {
      name: 'Novo Projeto de Desenvolvimento',
      objective: 'Desenvolver uma nova plataforma para e-commerce.',
      expect_start_date: new Date('2025-02-01'),
      expect_end_date: new Date('2025-08-01'),
      organizationId: organization.id,
      userId: user1.id,
    },
  });

  await prisma.stakeholder.create({
    data: {
      role: 'Desenvolvedor',
      proposalId: proposal.id,
      userId: user2.id,
    },
  });

  const approval = await prisma.approval.create({
    data: {
      status: Status.DRAFT,
      proposalId: proposal.id,
      approverId: user1.id,
    },
  });

  const comment = await prisma.proposalComment.create({
    data: {
      message: 'Esta proposta parece ótima!',
      proposalId: proposal.id,
      userId: user2.id,
    },
  });

  console.log('Banco de dados populado com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
