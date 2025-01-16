import { env } from '@api/env';
import nodemailer from 'nodemailer';

export async function sendMail(to: string, subject: string, name: string, authLink: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: env.EXCHANGE_EMAIL,
      pass: env.EXCHANGE_PASSWORD,
    },
    tls: {
      ciphers: 'SSLv3',
    },
  });

  try {
    const info = await transporter.sendMail({
      from: env.EXCHANGE_EMAIL,
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #333;">ProjectFlow</h2>
          </div>
          <p>Olá, <strong>${name}</strong>!</p>
          <p>Recebemos uma solicitação para acessar sua conta.</p>
          <p>Para confirmar sua identidade e garantir a segurança de suas informações, clique no link abaixo para realizar a autenticação:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${authLink}" style="background-color: #3630d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
              Fazer login!
            </a>
          </div>
          <p>Se você não solicitou esta ação, por favor, ignore este e-mail. Sua conta permanecerá segura.</p>
          <hr style="margin: 40px 0;">
          <div style="text-align: center; color: #aaa;">
            © Jolimont - ProjectFlow 2024
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}