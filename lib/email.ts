import { Resend } from 'resend';

// Inicializa cliente Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'onboarding@resend.dev'; // Dominio de teste do Resend (trocar em producao)

/**
 * Envia email de verificacao de conta
 */
export async function sendVerificationEmail(
  email: string,
  verificationUrl: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verifique seu email - CNC Builder',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #0070f3;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
              }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Bem-vindo ao CNC Builder!</h1>
              <p>Obrigado por se cadastrar. Para ativar sua conta, clique no botao abaixo:</p>
              <a href="${verificationUrl}" class="button">Verificar Email</a>
              <p>Ou copie e cole este link no seu navegador:</p>
              <p style="word-break: break-all; color: #0070f3;">${verificationUrl}</p>
              <p>Este link expira em 24 horas.</p>
              <div class="footer">
                <p>Se voce nao criou esta conta, pode ignorar este email.</p>
                <p>CNC Builder - Gerador de G-code profissional</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error('Erro ao enviar email de verificacao:', error);
    throw new Error('Falha ao enviar email de verificacao');
  }
}

/**
 * Envia email de recuperacao de senha
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Recuperacao de senha - CNC Builder',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #dc2626;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
              }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Recuperacao de Senha</h1>
              <p>Recebemos uma solicitacao para redefinir a senha da sua conta.</p>
              <p>Clique no botao abaixo para criar uma nova senha:</p>
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
              <p>Ou copie e cole este link no seu navegador:</p>
              <p style="word-break: break-all; color: #dc2626;">${resetUrl}</p>
              <p>Este link expira em 1 hora.</p>
              <div class="footer">
                <p>Se voce nao solicitou esta mudanca, pode ignorar este email. Sua senha permanecera inalterada.</p>
                <p>CNC Builder - Gerador de G-code profissional</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error('Erro ao enviar email de recuperacao:', error);
    throw new Error('Falha ao enviar email de recuperacao de senha');
  }
}

/**
 * Envia email de boas-vindas apos cadastro
 */
export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Bem-vindo ao CNC Builder!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .feature { margin: 15px 0; }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Ola, ${name}!</h1>
              <p>Sua conta foi verificada com sucesso. Bem-vindo ao CNC Builder!</p>

              <h2>O que voce pode fazer agora:</h2>
              <div class="feature">
                ✅ Configurar suas chapas e ferramentas
              </div>
              <div class="feature">
                ✅ Cadastrar pecas e usar nesting automatico
              </div>
              <div class="feature">
                ✅ Gerar codigo G-code otimizado para sua CNC
              </div>
              <div class="feature">
                ✅ Visualizar preview 2D antes de cortar
              </div>

              <p>Comece agora: <a href="${process.env.NEXTAUTH_URL}/app">Acessar aplicacao</a></p>

              <div class="footer">
                <p>Precisa de ajuda? Entre em contato conosco.</p>
                <p>CNC Builder - Gerador de G-code profissional</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error);
    // Nao lanca erro pois email de boas-vindas nao e critico
  }
}
