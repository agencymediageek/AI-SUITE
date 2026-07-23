"use client";

import { LegalPageLayout } from "./LegalPage";
import { Cookie } from "lucide-react";

const content = {
  en: {
    title: "Cookie Policy",
    lastUpdated: "Last updated: July 21, 2026",
    intro:
      "This Cookie Policy explains how MediaGeek A.I uses cookies and similar tracking technologies when you visit our platform. By using our Service, you consent to the use of cookies as described below.",
    sections: [
      {
        title: "What Are Cookies?",
        content:
          "Cookies are small text files placed on your device when you visit a website. They help the website remember information about your visit, making your next visit easier and the site more useful to you. Cookies can be 'session' (deleted when you close your browser) or 'persistent' (remain on your device for a set period).",
      },
      {
        title: "Essential Cookies",
        content: [
          "Authentication token: keeps you logged in during your session.",
          "CSRF protection token: prevents cross-site request forgery attacks.",
          "Language preference: remembers your selected language (PT, ES, EN).",
          "Theme preference: stores your chosen light/dark mode.",
          "These cookies are strictly necessary and cannot be disabled without affecting platform functionality.",
        ],
      },
      {
        title: "Analytics Cookies",
        content: [
          "Session duration and page views: help us understand how users navigate the platform.",
          "Feature usage metrics: which AI tools are most popular.",
          "Error tracking: helps us identify and fix bugs faster.",
          "These cookies are anonymous and do not identify you personally.",
          "You may opt out of analytics cookies via the cookie consent banner.",
        ],
      },
      {
        title: "Marketing & Preference Cookies",
        content: [
          "Referral tracking: helps us understand how you found MediaGeek A.I.",
          "A/B test variants: used to test different platform experiences.",
          "These cookies are optional. You can manage them via the cookie consent banner.",
        ],
      },
      {
        title: "Third-Party Cookies",
        content: [
          "Stripe: used for secure payment processing. Governed by Stripe's Privacy Policy.",
          "AI model providers: requests to external AI APIs may log minimal metadata for safety.",
          "We do not control third-party cookies; please review the relevant privacy policies.",
        ],
      },
      {
        title: "Local Storage",
        content:
          "We also use browser local storage to save your preferences (e.g., sidebar state, selected AI model, cookie consent choice). This data stays on your device and is not transmitted to our servers.",
      },
      {
        title: "Managing Your Cookie Preferences",
        content: [
          "Cookie consent banner: shown on your first visit; you can accept all, reject optional, or customize.",
          "Browser settings: most browsers allow you to block or delete cookies via settings.",
          "Opt-out links: you can opt out of analytics at any time by clicking 'Manage Cookies' in the footer.",
          "Note: disabling essential cookies will prevent you from logging in.",
        ],
      },
      {
        title: "Changes to This Policy",
        content:
          "We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of MediaGeek A.I constitutes acceptance of the updated policy.",
      },
    ],
  },
  pt: {
    title: "Política de Cookies",
    lastUpdated: "Última atualização: 21 de julho de 2026",
    intro:
      "Esta Política de Cookies explica como a MediaGeek A.I utiliza cookies e tecnologias de rastreamento similares quando você visita nossa plataforma. Ao usar nosso Serviço, você consente com o uso de cookies conforme descrito abaixo.",
    sections: [
      {
        title: "O que são Cookies?",
        content:
          "Cookies são pequenos arquivos de texto colocados no seu dispositivo quando você visita um site. Eles ajudam o site a lembrar informações sobre sua visita, tornando sua próxima visita mais fácil e o site mais útil para você. Os cookies podem ser 'de sessão' (excluídos quando você fecha o navegador) ou 'persistentes' (permanecem no seu dispositivo por um período determinado).",
      },
      {
        title: "Cookies Essenciais",
        content: [
          "Token de autenticação: mantém você conectado durante sua sessão.",
          "Token de proteção CSRF: previne ataques de falsificação de solicitação entre sites.",
          "Preferência de idioma: lembra o idioma selecionado (PT, ES, EN).",
          "Preferência de tema: armazena o modo claro/escuro escolhido.",
          "Esses cookies são estritamente necessários e não podem ser desativados sem afetar a funcionalidade da plataforma.",
        ],
      },
      {
        title: "Cookies Analíticos",
        content: [
          "Duração da sessão e visualizações de página: nos ajudam a entender como os usuários navegam na plataforma.",
          "Métricas de uso de funcionalidades: quais ferramentas de IA são mais populares.",
          "Rastreamento de erros: nos ajuda a identificar e corrigir bugs mais rapidamente.",
          "Esses cookies são anônimos e não identificam você pessoalmente.",
          "Você pode cancelar os cookies analíticos pelo banner de consentimento de cookies.",
        ],
      },
      {
        title: "Cookies de Marketing e Preferências",
        content: [
          "Rastreamento de referência: nos ajuda a entender como você encontrou a MediaGeek A.I.",
          "Variantes de testes A/B: usados para testar diferentes experiências na plataforma.",
          "Esses cookies são opcionais. Você pode gerenciá-los pelo banner de consentimento de cookies.",
        ],
      },
      {
        title: "Cookies de Terceiros",
        content: [
          "Stripe: usado para processamento seguro de pagamentos. Regido pela Política de Privacidade do Stripe.",
          "Provedores de modelos de IA: solicitações a APIs de IA externas podem registrar metadados mínimos por segurança.",
          "Não controlamos cookies de terceiros; consulte as políticas de privacidade relevantes.",
        ],
      },
      {
        title: "Armazenamento Local",
        content:
          "Também usamos o armazenamento local do navegador para salvar suas preferências (ex.: estado da barra lateral, modelo de IA selecionado, escolha de consentimento de cookies). Esses dados ficam no seu dispositivo e não são transmitidos para nossos servidores.",
      },
      {
        title: "Gerenciando suas Preferências de Cookies",
        content: [
          "Banner de consentimento de cookies: exibido na sua primeira visita; você pode aceitar todos, recusar os opcionais ou personalizar.",
          "Configurações do navegador: a maioria dos navegadores permite bloquear ou excluir cookies nas configurações.",
          "Links de cancelamento: você pode cancelar os cookies analíticos a qualquer momento clicando em 'Gerenciar Cookies' no rodapé.",
          "Nota: desativar cookies essenciais impedirá que você faça login.",
        ],
      },
      {
        title: "Alterações nesta Política",
        content:
          "Podemos atualizar esta Política de Cookies periodicamente. As alterações serão publicadas nesta página com uma data de revisão atualizada. O uso contínuo da MediaGeek A.I constitui aceitação da política atualizada.",
      },
    ],
  },
  es: {
    title: "Política de Cookies",
    lastUpdated: "Última actualización: 21 de julio de 2026",
    intro:
      "Esta Política de Cookies explica cómo MediaGeek A.I utiliza cookies y tecnologías de seguimiento similares cuando visita nuestra plataforma. Al usar nuestro Servicio, acepta el uso de cookies como se describe a continuación.",
    sections: [
      {
        title: "¿Qué son las Cookies?",
        content:
          "Las cookies son pequeños archivos de texto colocados en su dispositivo cuando visita un sitio web. Ayudan al sitio a recordar información sobre su visita, haciendo que su próxima visita sea más fácil y el sitio más útil. Las cookies pueden ser 'de sesión' (eliminadas cuando cierra el navegador) o 'persistentes' (permanecen en su dispositivo por un período determinado).",
      },
      {
        title: "Cookies Esenciales",
        content: [
          "Token de autenticación: lo mantiene conectado durante su sesión.",
          "Token de protección CSRF: previene ataques de falsificación de solicitudes entre sitios.",
          "Preferencia de idioma: recuerda el idioma seleccionado (PT, ES, EN).",
          "Preferencia de tema: almacena el modo claro/oscuro elegido.",
          "Estas cookies son estrictamente necesarias y no pueden deshabilitarse sin afectar la funcionalidad de la plataforma.",
        ],
      },
      {
        title: "Cookies Analíticas",
        content: [
          "Duración de sesión y vistas de página: nos ayudan a entender cómo los usuarios navegan por la plataforma.",
          "Métricas de uso de funciones: qué herramientas de IA son más populares.",
          "Seguimiento de errores: nos ayuda a identificar y corregir errores más rápidamente.",
          "Estas cookies son anónimas y no lo identifican personalmente.",
          "Puede optar por no recibir cookies analíticas a través del banner de consentimiento de cookies.",
        ],
      },
      {
        title: "Cookies de Marketing y Preferencias",
        content: [
          "Seguimiento de referidos: nos ayuda a entender cómo encontró MediaGeek A.I.",
          "Variantes de pruebas A/B: utilizadas para probar diferentes experiencias en la plataforma.",
          "Estas cookies son opcionales. Puede gestionarlas a través del banner de consentimiento de cookies.",
        ],
      },
      {
        title: "Cookies de Terceros",
        content: [
          "Stripe: utilizado para el procesamiento seguro de pagos. Regido por la Política de Privacidad de Stripe.",
          "Proveedores de modelos de IA: las solicitudes a APIs de IA externas pueden registrar metadatos mínimos por seguridad.",
          "No controlamos las cookies de terceros; consulte las políticas de privacidad relevantes.",
        ],
      },
      {
        title: "Almacenamiento Local",
        content:
          "También utilizamos el almacenamiento local del navegador para guardar sus preferencias (p. ej., estado de la barra lateral, modelo de IA seleccionado, elección de consentimiento de cookies). Estos datos permanecen en su dispositivo y no se transmiten a nuestros servidores.",
      },
      {
        title: "Gestión de sus Preferencias de Cookies",
        content: [
          "Banner de consentimiento de cookies: aparece en su primera visita; puede aceptar todas, rechazar las opcionales o personalizar.",
          "Configuración del navegador: la mayoría de los navegadores permiten bloquear o eliminar cookies en la configuración.",
          "Enlaces de exclusión: puede optar por no recibir cookies analíticas en cualquier momento haciendo clic en 'Gestionar Cookies' en el pie de página.",
          "Nota: deshabilitar las cookies esenciales impedirá que inicie sesión.",
        ],
      },
      {
        title: "Cambios en esta Política",
        content:
          "Podemos actualizar esta Política de Cookies periódicamente. Los cambios se publicarán en esta página con una fecha de revisión actualizada. El uso continuado de MediaGeek A.I constituye la aceptación de la política actualizada.",
      },
    ],
  },
};

export default function CookiePolicyPage() {
  return <LegalPageLayout content={content} icon={<Cookie className="w-7 h-7" />} />;
}
