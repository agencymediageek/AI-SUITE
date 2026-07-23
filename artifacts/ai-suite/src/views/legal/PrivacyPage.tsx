"use client";

import { LegalPageLayout } from "./LegalPage";
import { Shield } from "lucide-react";

const content = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: July 21, 2026",
    intro:
      "MediaGeek A.I ('we', 'our', 'us') is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding it.",
    sections: [
      {
        title: "Information We Collect",
        content: [
          "Account information: name, email address, and password (hashed) when you register.",
          "Usage data: tools used, prompts sent, tokens consumed, and session metadata.",
          "Payment data: billing details processed securely by Stripe — we never store full card numbers.",
          "Device & browser data: IP address, browser type, operating system, and referral URL.",
          "Cookies and local storage values used to maintain your session and preferences.",
        ],
      },
      {
        title: "How We Use Your Information",
        content: [
          "To provide, operate, and improve the MediaGeek A.I platform and its AI tools.",
          "To process payments and manage your subscription.",
          "To send transactional emails (account confirmation, password reset).",
          "To detect and prevent fraud, abuse, and security incidents.",
          "To comply with applicable legal obligations.",
        ],
      },
      {
        title: "Data Sharing",
        content:
          "We do not sell your personal data. We share it only with trusted service providers necessary to operate our platform (e.g., Stripe for payments, AI model providers for generation requests). These partners are bound by confidentiality obligations.",
      },
      {
        title: "Data Retention",
        content:
          "We retain your account data for as long as your account is active or as needed to provide services. If you delete your account, we will delete or anonymize your personal data within 30 days, except where we are required by law to retain it longer.",
      },
      {
        title: "Your Rights",
        content: [
          "Access: request a copy of the personal data we hold about you.",
          "Correction: request correction of inaccurate data.",
          "Deletion: request deletion of your personal data ('right to be forgotten').",
          "Portability: request your data in a structured, machine-readable format.",
          "Objection: object to certain processing activities.",
          "To exercise any of these rights, email us at contato@mediageek.io.",
        ],
      },
      {
        title: "Cookies",
        content:
          "We use essential cookies to keep you logged in and remember your preferences. We may also use analytics cookies to understand how users interact with our platform. You can manage your cookie preferences at any time using the cookie banner.",
      },
      {
        title: "Security",
        content:
          "We implement industry-standard security measures including HTTPS, hashed passwords, and access controls. No system is 100% secure; please use a strong, unique password and notify us immediately of any suspected breach.",
      },
      {
        title: "Changes to This Policy",
        content:
          "We may update this Privacy Policy periodically. We will notify you of significant changes by email or by displaying a notice on the platform. Continued use of MediaGeek A.I after changes constitutes acceptance of the updated policy.",
      },
    ],
  },
  pt: {
    title: "Política de Privacidade",
    lastUpdated: "Última atualização: 21 de julho de 2026",
    intro:
      "A MediaGeek A.I ('nós', 'nosso', 'nossa') está comprometida em proteger suas informações pessoais. Esta Política de Privacidade explica quais dados coletamos, como os utilizamos e quais são seus direitos.",
    sections: [
      {
        title: "Informações que Coletamos",
        content: [
          "Dados de conta: nome, endereço de e-mail e senha (criptografada) ao se registrar.",
          "Dados de uso: ferramentas utilizadas, prompts enviados, tokens consumidos e metadados de sessão.",
          "Dados de pagamento: detalhes de cobrança processados com segurança pelo Stripe — jamais armazenamos números completos de cartão.",
          "Dados de dispositivo e navegador: endereço IP, tipo de navegador, sistema operacional e URL de referência.",
          "Cookies e valores de armazenamento local usados para manter sua sessão e preferências.",
        ],
      },
      {
        title: "Como Usamos Suas Informações",
        content: [
          "Para fornecer, operar e melhorar a plataforma MediaGeek A.I e suas ferramentas de IA.",
          "Para processar pagamentos e gerenciar sua assinatura.",
          "Para enviar e-mails transacionais (confirmação de conta, redefinição de senha).",
          "Para detectar e prevenir fraudes, abusos e incidentes de segurança.",
          "Para cumprir obrigações legais aplicáveis.",
        ],
      },
      {
        title: "Compartilhamento de Dados",
        content:
          "Não vendemos seus dados pessoais. Compartilhamos apenas com fornecedores de serviço confiáveis necessários para operar nossa plataforma (ex.: Stripe para pagamentos, provedores de modelos de IA para geração de conteúdo). Esses parceiros estão vinculados por obrigações de confidencialidade.",
      },
      {
        title: "Retenção de Dados",
        content:
          "Mantemos seus dados de conta enquanto sua conta estiver ativa ou conforme necessário para fornecer os serviços. Se você excluir sua conta, apagaremos ou anonimizaremos seus dados pessoais em até 30 dias, exceto quando formos obrigados por lei a retê-los por mais tempo.",
      },
      {
        title: "Seus Direitos (LGPD)",
        content: [
          "Acesso: solicitar uma cópia dos dados pessoais que mantemos sobre você.",
          "Correção: solicitar a correção de dados imprecisos.",
          "Exclusão: solicitar a exclusão dos seus dados pessoais ('direito ao esquecimento').",
          "Portabilidade: solicitar seus dados em formato estruturado e legível por máquina.",
          "Oposição: opor-se a determinadas atividades de processamento.",
          "Para exercer qualquer desses direitos, envie um e-mail para contato@mediageek.io.",
        ],
      },
      {
        title: "Cookies",
        content:
          "Utilizamos cookies essenciais para mantê-lo conectado e lembrar suas preferências. Também podemos usar cookies analíticos para entender como os usuários interagem com nossa plataforma. Você pode gerenciar suas preferências de cookies a qualquer momento usando o banner de cookies.",
      },
      {
        title: "Segurança",
        content:
          "Implementamos medidas de segurança padrão da indústria, incluindo HTTPS, senhas criptografadas e controles de acesso. Nenhum sistema é 100% seguro; por favor, use uma senha forte e única e nos notifique imediatamente sobre qualquer suspeita de violação.",
      },
      {
        title: "Alterações nesta Política",
        content:
          "Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças significativas por e-mail ou exibindo um aviso na plataforma. O uso contínuo da MediaGeek A.I após as alterações constitui aceitação da política atualizada.",
      },
    ],
  },
  es: {
    title: "Política de Privacidad",
    lastUpdated: "Última actualización: 21 de julio de 2026",
    intro:
      "MediaGeek A.I ('nosotros', 'nuestro', 'nuestra') está comprometida con la protección de su información personal. Esta Política de Privacidad explica qué datos recopilamos, cómo los usamos y cuáles son sus derechos.",
    sections: [
      {
        title: "Información que Recopilamos",
        content: [
          "Datos de cuenta: nombre, dirección de correo electrónico y contraseña (cifrada) al registrarse.",
          "Datos de uso: herramientas utilizadas, prompts enviados, tokens consumidos y metadatos de sesión.",
          "Datos de pago: detalles de facturación procesados de forma segura por Stripe — nunca almacenamos números de tarjeta completos.",
          "Datos de dispositivo y navegador: dirección IP, tipo de navegador, sistema operativo y URL de referencia.",
          "Cookies y valores de almacenamiento local usados para mantener su sesión y preferencias.",
        ],
      },
      {
        title: "Cómo Usamos Su Información",
        content: [
          "Para proporcionar, operar y mejorar la plataforma MediaGeek A.I y sus herramientas de IA.",
          "Para procesar pagos y gestionar su suscripción.",
          "Para enviar correos electrónicos transaccionales (confirmación de cuenta, restablecimiento de contraseña).",
          "Para detectar y prevenir fraudes, abusos e incidentes de seguridad.",
          "Para cumplir con las obligaciones legales aplicables.",
        ],
      },
      {
        title: "Compartición de Datos",
        content:
          "No vendemos sus datos personales. Los compartimos solo con proveedores de servicios de confianza necesarios para operar nuestra plataforma (p. ej., Stripe para pagos, proveedores de modelos de IA para solicitudes de generación). Estos socios están sujetos a obligaciones de confidencialidad.",
      },
      {
        title: "Retención de Datos",
        content:
          "Conservamos sus datos de cuenta mientras su cuenta esté activa o según sea necesario para prestar los servicios. Si elimina su cuenta, borraremos o anonimizaremos sus datos personales en un plazo de 30 días, excepto cuando la ley nos obligue a conservarlos por más tiempo.",
      },
      {
        title: "Sus Derechos (RGPD)",
        content: [
          "Acceso: solicitar una copia de los datos personales que tenemos sobre usted.",
          "Rectificación: solicitar la corrección de datos inexactos.",
          "Supresión: solicitar la eliminación de sus datos personales ('derecho al olvido').",
          "Portabilidad: solicitar sus datos en un formato estructurado y legible por máquina.",
          "Oposición: oponerse a determinadas actividades de tratamiento.",
          "Para ejercer cualquiera de estos derechos, envíenos un correo a contato@mediageek.io.",
        ],
      },
      {
        title: "Cookies",
        content:
          "Utilizamos cookies esenciales para mantenerle conectado y recordar sus preferencias. También podemos usar cookies analíticas para entender cómo los usuarios interactúan con nuestra plataforma. Puede gestionar sus preferencias de cookies en cualquier momento usando el banner de cookies.",
      },
      {
        title: "Seguridad",
        content:
          "Implementamos medidas de seguridad estándar del sector, incluidos HTTPS, contraseñas cifradas y controles de acceso. Ningún sistema es 100% seguro; use una contraseña fuerte y única y notifíquenos de inmediato si sospecha de una violación.",
      },
      {
        title: "Cambios en esta Política",
        content:
          "Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos los cambios significativos por correo electrónico o mostrando un aviso en la plataforma. El uso continuado de MediaGeek A.I tras los cambios constituye la aceptación de la política actualizada.",
      },
    ],
  },
};

export default function PrivacyPage() {
  return <LegalPageLayout content={content} icon={<Shield className="w-7 h-7" />} />;
}
