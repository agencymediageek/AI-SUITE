"use client";

import { LegalPageLayout } from "./LegalPage";
import { FileText } from "lucide-react";

const content = {
  en: {
    title: "Terms of Service",
    lastUpdated: "Last updated: July 21, 2026",
    intro:
      "These Terms of Service ('Terms') govern your access to and use of MediaGeek A.I ('Service'). By creating an account or using the Service, you agree to be bound by these Terms.",
    sections: [
      {
        title: "Acceptance of Terms",
        content:
          "By accessing or using MediaGeek A.I, you confirm that you are at least 18 years old, have read and understood these Terms, and agree to be legally bound by them. If you do not agree, you must not use the Service.",
      },
      {
        title: "Description of Service",
        content:
          "MediaGeek A.I provides an AI-powered productivity platform offering 100+ tools for content creation, coding, image generation, marketing, and more. Features vary by subscription plan. We reserve the right to modify, suspend, or discontinue any part of the Service at any time.",
      },
      {
        title: "Account Registration",
        content: [
          "You must provide accurate, current, and complete registration information.",
          "You are responsible for maintaining the confidentiality of your account credentials.",
          "You must notify us immediately of any unauthorized use of your account.",
          "One account per person; account sharing is prohibited.",
          "We reserve the right to suspend or terminate accounts that violate these Terms.",
        ],
      },
      {
        title: "Acceptable Use",
        content: [
          "You agree not to use the Service to generate illegal, harmful, defamatory, or abusive content.",
          "You agree not to attempt to reverse-engineer, scrape, or circumvent any security measures.",
          "You agree not to use automated bots or scripts to abuse the Service.",
          "You agree not to upload or transmit malware, viruses, or malicious code.",
          "You agree not to impersonate any person or entity.",
          "Violation of these rules may result in immediate account termination without refund.",
        ],
      },
      {
        title: "Intellectual Property",
        content:
          "The Service, including all software, designs, and content created by us, is owned by MediaGeek A.I and protected by intellectual property laws. Content you generate using the Service belongs to you, subject to our right to use anonymized data to improve the platform.",
      },
      {
        title: "Payment and Subscriptions",
        content: [
          "Paid plans are billed monthly or annually as selected at checkout.",
          "Payments are processed by Stripe. By subscribing, you authorize recurring charges.",
          "All fees are non-refundable except as required by law or at our sole discretion.",
          "Failure to pay may result in suspension or downgrade of your account.",
          "Prices may change with 30 days' prior notice.",
        ],
      },
      {
        title: "Limitation of Liability",
        content:
          "To the maximum extent permitted by law, MediaGeek A.I shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service. Our total liability to you for any claim shall not exceed the amount you paid us in the 12 months preceding the claim.",
      },
      {
        title: "Disclaimers",
        content:
          "The Service is provided 'as is' and 'as available' without warranties of any kind. AI-generated content may be inaccurate, incomplete, or offensive. You are responsible for reviewing and validating all AI-generated outputs before use.",
      },
      {
        title: "Governing Law",
        content:
          "These Terms are governed by the laws of Brazil. Any disputes arising from these Terms shall be submitted to the courts of Brazil, and you consent to the personal jurisdiction of such courts.",
      },
      {
        title: "Changes to Terms",
        content:
          "We reserve the right to update these Terms at any time. We will provide at least 15 days' notice before material changes take effect. Continued use of the Service after the effective date constitutes acceptance.",
      },
    ],
  },
  pt: {
    title: "Termos de Serviço",
    lastUpdated: "Última atualização: 21 de julho de 2026",
    intro:
      "Estes Termos de Serviço ('Termos') regem seu acesso e uso da MediaGeek A.I ('Serviço'). Ao criar uma conta ou usar o Serviço, você concorda em estar vinculado a estes Termos.",
    sections: [
      {
        title: "Aceitação dos Termos",
        content:
          "Ao acessar ou usar a MediaGeek A.I, você confirma que tem pelo menos 18 anos de idade, leu e entendeu estes Termos e concorda em estar legalmente vinculado a eles. Se não concordar, não use o Serviço.",
      },
      {
        title: "Descrição do Serviço",
        content:
          "A MediaGeek A.I oferece uma plataforma de produtividade baseada em IA com mais de 100 ferramentas para criação de conteúdo, programação, geração de imagens, marketing e muito mais. Os recursos variam conforme o plano de assinatura. Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer parte do Serviço a qualquer momento.",
      },
      {
        title: "Registro de Conta",
        content: [
          "Você deve fornecer informações de registro precisas, atuais e completas.",
          "Você é responsável por manter a confidencialidade das suas credenciais de conta.",
          "Você deve nos notificar imediatamente sobre qualquer uso não autorizado da sua conta.",
          "Uma conta por pessoa; compartilhamento de conta é proibido.",
          "Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos.",
        ],
      },
      {
        title: "Uso Aceitável",
        content: [
          "Você concorda em não usar o Serviço para gerar conteúdo ilegal, prejudicial, difamatório ou abusivo.",
          "Você concorda em não tentar fazer engenharia reversa, coletar dados ou contornar medidas de segurança.",
          "Você concorda em não usar bots ou scripts automatizados para abusar do Serviço.",
          "Você concorda em não fazer upload ou transmitir malware, vírus ou código malicioso.",
          "Você concorda em não se passar por qualquer pessoa ou entidade.",
          "A violação dessas regras pode resultar no encerramento imediato da conta sem reembolso.",
        ],
      },
      {
        title: "Propriedade Intelectual",
        content:
          "O Serviço, incluindo todos os softwares, designs e conteúdos criados por nós, é de propriedade da MediaGeek A.I e protegido por leis de propriedade intelectual. O conteúdo que você gera usando o Serviço é seu, sujeito ao nosso direito de usar dados anonimizados para melhorar a plataforma.",
      },
      {
        title: "Pagamento e Assinaturas",
        content: [
          "Os planos pagos são cobrados mensalmente ou anualmente conforme selecionado no checkout.",
          "Os pagamentos são processados pelo Stripe. Ao assinar, você autoriza cobranças recorrentes.",
          "Todas as taxas são não reembolsáveis, exceto conforme exigido por lei ou a nosso critério exclusivo.",
          "O não pagamento pode resultar na suspensão ou rebaixamento da sua conta.",
          "Os preços podem mudar com 30 dias de aviso prévio.",
        ],
      },
      {
        title: "Limitação de Responsabilidade",
        content:
          "Na extensão máxima permitida por lei, a MediaGeek A.I não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos decorrentes do uso ou da incapacidade de usar o Serviço. Nossa responsabilidade total para com você por qualquer reclamação não excederá o valor que você nos pagou nos 12 meses anteriores à reclamação.",
      },
      {
        title: "Isenções de Responsabilidade",
        content:
          "O Serviço é fornecido 'como está' e 'conforme disponível' sem garantias de qualquer tipo. O conteúdo gerado por IA pode ser impreciso, incompleto ou ofensivo. Você é responsável por revisar e validar todos os resultados gerados por IA antes do uso.",
      },
      {
        title: "Lei Aplicável",
        content:
          "Estes Termos são regidos pelas leis do Brasil. Quaisquer disputas decorrentes destes Termos serão submetidas aos tribunais do Brasil, e você consente com a jurisdição pessoal de tais tribunais.",
      },
      {
        title: "Alterações nos Termos",
        content:
          "Reservamo-nos o direito de atualizar estes Termos a qualquer momento. Forneceremos pelo menos 15 dias de aviso antes que alterações materiais entrem em vigor. O uso contínuo do Serviço após a data de vigência constitui aceitação.",
      },
    ],
  },
  es: {
    title: "Términos de Servicio",
    lastUpdated: "Última actualización: 21 de julio de 2026",
    intro:
      "Estos Términos de Servicio ('Términos') rigen su acceso y uso de MediaGeek A.I ('Servicio'). Al crear una cuenta o usar el Servicio, acepta quedar vinculado por estos Términos.",
    sections: [
      {
        title: "Aceptación de los Términos",
        content:
          "Al acceder o usar MediaGeek A.I, confirma que tiene al menos 18 años, ha leído y comprendido estos Términos y acepta estar legalmente vinculado por ellos. Si no está de acuerdo, no debe usar el Servicio.",
      },
      {
        title: "Descripción del Servicio",
        content:
          "MediaGeek A.I ofrece una plataforma de productividad impulsada por IA con más de 100 herramientas para creación de contenido, programación, generación de imágenes, marketing y más. Las funciones varían según el plan de suscripción. Nos reservamos el derecho de modificar, suspender o discontinuar cualquier parte del Servicio en cualquier momento.",
      },
      {
        title: "Registro de Cuenta",
        content: [
          "Debe proporcionar información de registro precisa, actual y completa.",
          "Es responsable de mantener la confidencialidad de sus credenciales de cuenta.",
          "Debe notificarnos de inmediato sobre cualquier uso no autorizado de su cuenta.",
          "Una cuenta por persona; compartir cuentas está prohibido.",
          "Nos reservamos el derecho de suspender o cancelar cuentas que violen estos Términos.",
        ],
      },
      {
        title: "Uso Aceptable",
        content: [
          "Acepta no usar el Servicio para generar contenido ilegal, dañino, difamatorio o abusivo.",
          "Acepta no intentar realizar ingeniería inversa, extraer datos o eludir medidas de seguridad.",
          "Acepta no usar bots automatizados o scripts para abusar del Servicio.",
          "Acepta no cargar ni transmitir malware, virus o código malicioso.",
          "Acepta no hacerse pasar por ninguna persona o entidad.",
          "La violación de estas reglas puede resultar en la terminación inmediata de la cuenta sin reembolso.",
        ],
      },
      {
        title: "Propiedad Intelectual",
        content:
          "El Servicio, incluido todo el software, diseños y contenidos creados por nosotros, es propiedad de MediaGeek A.I y está protegido por las leyes de propiedad intelectual. El contenido que genera usando el Servicio le pertenece, sujeto a nuestro derecho de usar datos anonimizados para mejorar la plataforma.",
      },
      {
        title: "Pago y Suscripciones",
        content: [
          "Los planes de pago se facturan mensual o anualmente según lo seleccionado en el proceso de pago.",
          "Los pagos son procesados por Stripe. Al suscribirse, autoriza cargos recurrentes.",
          "Todas las tarifas no son reembolsables excepto según lo exigido por la ley o a nuestra entera discreción.",
          "El incumplimiento del pago puede resultar en la suspensión o degradación de su cuenta.",
          "Los precios pueden cambiar con 30 días de aviso previo.",
        ],
      },
      {
        title: "Limitación de Responsabilidad",
        content:
          "En la máxima medida permitida por la ley, MediaGeek A.I no será responsable de ningún daño indirecto, incidental, especial, consecuente o punitivo derivado del uso o imposibilidad de uso del Servicio. Nuestra responsabilidad total hacia usted por cualquier reclamación no excederá el monto que nos pagó en los 12 meses anteriores a la reclamación.",
      },
      {
        title: "Exenciones de Responsabilidad",
        content:
          "El Servicio se proporciona 'tal cual' y 'según disponibilidad' sin garantías de ningún tipo. El contenido generado por IA puede ser inexacto, incompleto u ofensivo. Usted es responsable de revisar y validar todos los resultados generados por IA antes de su uso.",
      },
      {
        title: "Ley Aplicable",
        content:
          "Estos Términos se rigen por las leyes de Brasil. Cualquier disputa derivada de estos Términos se someterá a los tribunales de Brasil, y usted consiente la jurisdicción personal de dichos tribunales.",
      },
      {
        title: "Cambios en los Términos",
        content:
          "Nos reservamos el derecho de actualizar estos Términos en cualquier momento. Proporcionaremos al menos 15 días de aviso antes de que los cambios materiales entren en vigor. El uso continuado del Servicio después de la fecha de vigencia constituye aceptación.",
      },
    ],
  },
};

export default function TermsPage() {
  return <LegalPageLayout content={content} icon={<FileText className="w-7 h-7" />} />;
}
