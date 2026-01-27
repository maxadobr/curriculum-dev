function translateKey(key) {
  const translationPath = `key.${key}`;
  const translated = i18next.t(translationPath);
  return translated === translationPath ? key : translated;
}

function translateValue(value, path = '') {
  if (typeof value !== 'string') return value;

  const translationKey = `content.${path}`;
  const translated = i18next.t(translationKey, { defaultValue: null });

  return translated || value;
}

function jsonToHtml(piece, depth = 3, ...ignoreKeys) {
  if (Array.isArray(piece)) {
    let html = "<ul>";
    for (const item of piece) {
      if (typeof item === "string" || typeof item === "number") {
        html += `<li>${item}</li>`;
      } else {
        html += `<li>${jsonToHtml(item, depth, ...ignoreKeys)}</li>`;
      }
    }
    html += "</ul>";
    return html;
  }

  if (typeof piece === "string" || typeof piece === "number") {
    return `<p>${piece}</p>`;
  }

  if (piece && typeof piece === "object") {
    let html = "";
    for (const [key, value] of Object.entries(piece)) {
      if (ignoreKeys.includes(key)) continue;

      const translatedLabel = translateKey(key);

      html += `<div class="${key}">`;
      html += `<h${depth}>${translatedLabel}</h${depth}>`;
      html += jsonToHtml(value, depth + 1, ...ignoreKeys);
      html += `</div>`;
    }
    return html;
  }

  return "";
}

function renderResume(data) {
  document.getElementById('name').textContent = data.personalInfo.fullName;
  document.getElementById('contact-compact-list').innerHTML = jsonToHtml(data.personalInfo, 3, 'fullName', 'year', 'month', 'location');
  document.getElementById('about-me-container').innerHTML = jsonToHtml(data.aboutMe);

  document.getElementById('projects-list').innerHTML = jsonToHtml(data.projects);
  document.getElementById('skills-list').innerHTML = jsonToHtml(data.skills);
  document.getElementById('education-list').innerHTML = jsonToHtml(data.education);
  document.getElementById('experience-list').innerHTML = jsonToHtml(data.experience);
  document.getElementById('professional-skills-list').innerHTML = jsonToHtml(data.professionalSkills);
  document.getElementById('languages-list').innerHTML = jsonToHtml(data.languages);

  document.getElementById('personal-info-list').innerHTML = jsonToHtml(data.personalInfo);
  document.getElementById('availability').innerHTML = jsonToHtml(data.availability);
  document.getElementById('goals-list').innerHTML = jsonToHtml(data.careerGoals);
  document.getElementById('contact-list').innerHTML = jsonToHtml(data.personalInfo.contact);

  translateSectionTitles();
}

function translateSectionTitles() {
  const sections = document.querySelectorAll('[data-i18n-section]');
  sections.forEach(section => {
    const sectionKey = section.getAttribute('data-i18n-section');
    section.textContent = i18next.t(`section.${sectionKey}`);
  });
}

function setupLanguageSwitcher() {
  const btnEn = document.getElementById('btn-en');
  const btnPt = document.getElementById('btn-pt');

  if (btnEn) btnEn.onclick = async () => {
    await window.changeLanguage('en-US');
    await loadResume();
  };
  if (btnPt) btnPt.onclick = async () => {
    await window.changeLanguage('pt-BR');
    await loadResume();
  };
}

async function loadResume() {
  try {
    const response = await fetch('./data/resume.json');
    if (!response.ok) throw new Error('Failed to load resume.json');

    const resumeData = await response.json();
    renderResume(resumeData);
  } catch (error) {
    console.error('Error loading resume:', error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await window.initI18n();
    setupLanguageSwitcher();
    await loadResume();
  } catch (error) {
    console.error('Initialization error:', error);
  }
});