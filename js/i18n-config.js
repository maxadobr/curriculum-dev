const supportedLanguages = ['en', 'pt-BR'];

function initI18n() {
  return i18next
    .use(i18nextHttpBackend)
    .use(i18nextBrowserLanguageDetector)
    .init({
      fallbackLng: 'en',
      supportedLngs: supportedLanguages,
      debug: true,  // Console mostra detecção
      backend: {
        loadPath: '/data/i18n/{{lng}}.json'  // Seus arquivos!
      },
      detection: {
        order: ['querystring', 'localStorage', 'navigator'],
        lookupQuerystring: 'lng',  // ?lng=pt-BR
        caches: ['localStorage']   // Lembra escolha do usuário
      }
    });
}

// Torna global pro main.js
window.initI18n = initI18n;

