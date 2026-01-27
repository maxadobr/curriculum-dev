const supportedLanguages = ['en-US', 'pt-BR'];

async function loadTranslations(lng) {
  const response = await fetch(`/data/i18n/${lng}.json`);
  if (!response.ok) throw new Error(`Failed to load translations for ${lng}`);
  return response.json();
}

function detectLanguage() {
  const cached = localStorage.getItem('i18nextLng');
  if (cached && supportedLanguages.includes(cached)) {
    return cached;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const urlLng = urlParams.get('lng');
  if (urlLng && supportedLanguages.includes(urlLng)) {
    return urlLng;
  }

  const navLang = navigator.language;
  if (navLang.startsWith('pt')) return 'pt-BR';
  return 'en-US';
}

async function initI18n() {
  const detectedLng = detectLanguage();
  const translations = await loadTranslations(detectedLng);

  await i18next.init({
    lng: detectedLng,
    fallbackLng: 'en-US',
    supportedLngs: supportedLanguages,
    debug: false,
    resources: {
      [detectedLng]: { translation: translations }
    }
  });

  localStorage.setItem('i18nextLng', detectedLng);
}

async function changeLanguage(lng) {
  const translations = await loadTranslations(lng);
  i18next.addResourceBundle(lng, 'translation', translations, true, true);
  await i18next.changeLanguage(lng);
  localStorage.setItem('i18nextLng', lng);
}

function clearLanguageCache() {
  localStorage.removeItem('i18nextLng');
  location.reload();
}

window.initI18n = initI18n;
window.changeLanguage = changeLanguage;
window.clearLanguageCache = clearLanguageCache;
