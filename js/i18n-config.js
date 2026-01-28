const supportedLanguages = ['en-US', 'pt-BR'];

function normalizeLanguageCode(lng) {
  if (!lng) return null;
  if (supportedLanguages.includes(lng)) return lng;
  if (lng.startsWith('pt')) return 'pt-BR';
  if (lng.startsWith('en')) return 'en-US';
  return null;
}

async function loadTranslations(lng) {
  const response = await fetch(`./data/i18n/${lng}.json`);
  if (!response.ok) throw new Error(`Failed to load translations for ${lng}`);
  return response.json();
}

function detectLanguage() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLng = normalizeLanguageCode(urlParams.get('lng'));
  if (urlLng) {
    return urlLng;
  }

  const cached = localStorage.getItem('i18nextLng');
  if (cached && supportedLanguages.includes(cached)) {
    return cached;
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
