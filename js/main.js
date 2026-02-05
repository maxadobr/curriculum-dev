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

function renderProjects(projects) {
  const projectsHtml = projects.map(project => {
    const imageHtml = project.image
      ? `<img src="${project.image}" alt="${project.name}">`
      : `<span class="project-image-placeholder">Project Image</span>`;

    // Build features list if available
    let featuresHtml = '';
    if (project.features && project.features.length > 0) {
      featuresHtml = `
        <div class="features-section">
          <h4>${translateKey('features')}</h4>
          <ul>
            ${project.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Build technical highlights list if available
    let highlightsHtml = '';
    if (project.technicalHighlights && project.technicalHighlights.length > 0) {
      highlightsHtml = `
        <div class="highlights-section">
          <h4>${translateKey('technicalHighlights')}</h4>
          <ul>
            ${project.technicalHighlights.map(h => `<li>${h}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Dropdown details (only shown on web, hidden in print)
    const detailsHtml = (featuresHtml || highlightsHtml) ? `
      <details class="project-details">
        <summary>→ ${translateKey('details') || 'Detalhes'}</summary>
        <div class="project-details-content">
          ${featuresHtml}
          ${highlightsHtml}
        </div>
      </details>
    ` : '';

    // Print-only links (hidden on screen, visible in print)
    const printLinksHtml = `
      <div class="project-print-links">
        ${project.demoUrl ? `<span class="print-link"><strong>Demo:</strong> ${project.demoUrl}</span>` : ''}
        ${project.repository ? `<span class="print-link"><strong>GitHub:</strong> ${project.repository}</span>` : ''}
      </div>
    `;

    return `
      <article class="project-card">
        <div class="project-image">
          ${imageHtml}
        </div>
        <div class="project-content">
          <h3>${project.name}</h3>
          <p class="project-description">${project.description}</p>
          ${detailsHtml}
          ${printLinksHtml}
          <div class="project-actions">
            ${project.demoUrl ? `<a href="${project.demoUrl}" class="project-btn" target="_blank" rel="noopener noreferrer">demo</a>` : ''}
            ${project.repository ? `<a href="${project.repository}" class="project-btn" target="_blank" rel="noopener noreferrer">code</a>` : ''}
          </div>
        </div>
      </article>
    `;
  }).join('');

  document.getElementById('projects-list').innerHTML = projectsHtml;
}


function renderContactCompact(contact) {
  const iconMap = {
    email: 'fa-solid fa-envelope',
    linkedin: 'fa-brands fa-linkedin',
    github: 'fa-brands fa-github'
  };

  let html = '<div class="contact-compact-icons">';

  for (const [key, value] of Object.entries(contact)) {
    const iconClass = iconMap[key] || 'fa-solid fa-link';
    const isLink = value.startsWith('http');
    const displayValue = isLink
      ? `<a href="${value}" target="_blank" rel="noopener noreferrer">${value}</a>`
      : (key === 'email' ? `<a href="mailto:${value}">${value}</a>` : value);

    html += `
      <div class="contact-compact-item">
        <i class="${iconClass}"></i>
        <span>${displayValue}</span>
      </div>
    `;
  }

  html += '</div>';
  return html;
}

function renderLanguages(languages) {
  let html = '';

  languages.forEach(lang => {
    html += `<div class="language-item">`;
    html += `<h3>${lang.language}</h3>`;

    if (lang.level) {
      html += `<p class="language-level"><strong>${translateKey('level')}:</strong> ${lang.level}</p>`;
    }

    if (lang.skills && lang.skills.length > 0) {
      html += `<div class="language-skills">`;
      html += `<strong>${translateKey('skills')}:</strong>`;
      html += `<ul>`;
      lang.skills.forEach(skill => {
        html += `<li>${skill}</li>`;
      });
      html += `</ul></div>`;
    }

    if (lang.institution) {
      html += `<p class="language-institution"><strong>${translateKey('institution')}:</strong> ${lang.institution}</p>`;
    }

    html += `</div>`;
  });

  return html;
}

function renderPersonalInfo(info) {
  const location = info.location
    ? `${info.location.city}, ${info.location.state} - ${info.location.country}`
    : '';

  const contactIcons = {
    email: 'fa-solid fa-envelope',
    linkedin: 'fa-brands fa-linkedin',
    github: 'fa-brands fa-github'
  };

  let contactHtml = '';
  if (info.contact) {
    for (const [key, value] of Object.entries(info.contact)) {
      const icon = contactIcons[key] || 'fa-solid fa-link';
      const isLink = value.startsWith('http');
      const href = isLink ? value : (key === 'email' ? `mailto:${value}` : value);
      const displayText = key === 'email' ? value : value.replace(/https?:\/\/(www\.)?/, '');

      contactHtml += `
        <a href="${href}" class="business-card-contact-item" target="${isLink ? '_blank' : '_self'}" rel="noopener noreferrer">
          <i class="${icon}"></i>
          <span>${displayText}</span>
        </a>
      `;
    }
  }

  return `
    <div class="business-card">
      <div class="business-card-main">
        <h3 class="business-card-name">${info.fullName}</h3>
        <p class="business-card-location"><i class="fa-solid fa-location-dot"></i> ${location}</p>
      </div>
      <div class="business-card-contact">
        ${contactHtml}
      </div>
    </div>
  `;
}

const cardUtils = {
  getStatusClass: (status) => {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s.includes('complet') || s.includes('conclu')) return 'status-completed';
    return 'status-in-progress';
  },

  getTranslatedStatus: (status) => {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s.includes('complet') || s.includes('conclu')) return i18next.t('value.status.completed');
    if (s.includes('progress') || s.includes('andamento')) return i18next.t('value.status.inProgress');
    return status;
  },

  parseDate: (dateStr) => {
    if (!dateStr) return 0;
    const [month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1).getTime();
  },

  isInProgress: (status) => {
    if (!status) return false;
    const s = status.toLowerCase();
    return !s.includes('complet') && !s.includes('conclu');
  },

  sortByStatusAndDate: (items, dateField = 'completionDate', altDateField = 'expectedStartDate') => {
    return [...items].sort((a, b) => {
      const aInProgress = cardUtils.isInProgress(a.status);
      const bInProgress = cardUtils.isInProgress(b.status);

      if (aInProgress && !bInProgress) return -1;
      if (!aInProgress && bInProgress) return 1;

      const dateA = cardUtils.parseDate(a[dateField] || a[altDateField]);
      const dateB = cardUtils.parseDate(b[dateField] || b[altDateField]);

      return dateB - dateA;
    });
  }
};

/**
 * Renders a card-based section (education or experience)
 * @param {Object} data - Section data object
 * @param {string} sectionType - 'education' or 'experience'
 * @param {string} targetElementId - DOM element ID to render into
 */
function renderCardsSection(data, sectionType, targetElementId) {
  let html = '';
  const cssPrefix = sectionType;

  // Main/Featured item (undergraduate for education, or first major experience)
  const mainItem = data.undergraduate || null;
  if (mainItem) {
    const period = mainItem.startDate && mainItem.completionDate
      ? `${mainItem.startDate} - ${mainItem.completionDate}`
      : mainItem.period || '';

    html += `
      <article class="${cssPrefix}-card ${cssPrefix}-card-major">
        <div class="${cssPrefix}-content">
          <h3>${mainItem.degree || mainItem.role || mainItem.name}</h3>
          <p class="${cssPrefix}-institution">${mainItem.institution || mainItem.company || ''}</p>
          <p class="${cssPrefix}-period">${period}</p>
          ${mainItem.status ? `<span class="${cssPrefix}-status ${cardUtils.getStatusClass(mainItem.status)}">${cardUtils.getTranslatedStatus(mainItem.status)}</span>` : ''}
        </div>
      </article>
    `;
  }

  // Regular entries (techCourses for education, experience array items)
  const entries = data.techCourses || (Array.isArray(data) ? data : null);
  if (entries && entries.length > 0) {
    const sortedEntries = cardUtils.sortByStatusAndDate(entries, 'completionDate', 'expectedStartDate');

    sortedEntries.forEach(entry => {
      const title = entry.name || entry.role || '';
      const institution = entry.institution || entry.platform || entry.company || '';
      const date = entry.completionDate || entry.expectedStartDate || '';
      const workload = entry.workload || '';
      const focusTags = entry.focus ? entry.focus.map(f => `<span class="tech-tag">${f}</span>`).join('') : '';

      // Build period string for experience entries
      let periodStr = date;
      if (entry.period) {
        periodStr = typeof entry.period === 'object'
          ? `${entry.period.start || ''} - ${entry.period.end || translateKey('present')}`
          : entry.period;
      }
      if (workload) periodStr += ` • ${workload}`;

      // Build responsibilities/achievements list
      let detailsHtml = '';
      const responsibilities = entry.responsibilities || [];
      const achievements = entry.keyAchievements || [];
      if (responsibilities.length > 0 || achievements.length > 0) {
        detailsHtml = '<ul class="entry-details">';
        responsibilities.slice(0, 2).forEach(r => { detailsHtml += `<li>${r}</li>`; });
        achievements.slice(0, 1).forEach(a => { detailsHtml += `<li class="achievement">${a}</li>`; });
        detailsHtml += '</ul>';
      }

      html += `
        <article class="${cssPrefix}-card">
          <div class="${cssPrefix}-content">
            <h3>${title}</h3>
            ${institution ? `<p class="${cssPrefix}-institution">${institution}</p>` : ''}
            <p class="${cssPrefix}-period">${periodStr}</p>
            ${entry.status ? `<span class="${cssPrefix}-status ${cardUtils.getStatusClass(entry.status)}">${cardUtils.getTranslatedStatus(entry.status)}</span>` : ''}
            ${focusTags ? `<div class="${cssPrefix}-tags">${focusTags}</div>` : ''}
            ${detailsHtml}
          </div>
        </article>
      `;
    });
  }

  // Minor entries (technicalCourses for education, older/apprentice roles for experience)
  const minorEntries = data.technicalCourses || null;
  if (minorEntries && minorEntries.length > 0) {
    html += `<div class="${cssPrefix}-minor-grid">`;
    minorEntries.forEach(entry => {
      const title = entry.name || entry.role || '';
      const details = entry.institution
        ? `${entry.institution} • ${entry.year || ''} • ${entry.workload || ''}`
        : entry.activities || '';

      html += `
        <article class="${cssPrefix}-card-minor">
          <h4>${title}</h4>
          <p>${details}</p>
        </article>
      `;
    });
    html += '</div>';
  }

  document.getElementById(targetElementId).innerHTML = html;
}

function renderResume(data) {
  document.getElementById('name').textContent = data.personalInfo.fullName;
  document.getElementById('contact-compact-list').innerHTML = renderContactCompact(data.personalInfo.contact);
  document.getElementById('about-me-container').innerHTML = jsonToHtml(data.aboutMe);

  renderProjects(data.projects);
  document.getElementById('skills-list').innerHTML = jsonToHtml(data.skills);
  renderCardsSection(data.education, 'education', 'education-list');
  renderCardsSection(data.experience, 'experience', 'experience-list');
  document.getElementById('professional-skills-list').innerHTML = jsonToHtml(data.professionalSkills);
  document.getElementById('languages-list').innerHTML = renderLanguages(data.languages);

  document.getElementById('personal-info-list').innerHTML = renderPersonalInfo(data.personalInfo);
  document.getElementById('availability').innerHTML = jsonToHtml(data.availability);
  document.getElementById('goals-list').innerHTML = jsonToHtml(data.careerGoals);

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


function deepMergeTranslations(resumeData, translations, path = '') {
  if (translations === undefined || translations === null) {
    return resumeData;
  }

  // If translation is a primitive (string, number, boolean), replace directly
  if (typeof translations !== 'object') {
    return translations;
  }

  // If resumeData is a primitive but translations is an object, return original
  if (typeof resumeData !== 'object' || resumeData === null) {
    return typeof translations === 'object' ? resumeData : translations;
  }

  // Both are arrays
  if (Array.isArray(resumeData) && Array.isArray(translations)) {
    return resumeData.map((item, index) => {
      if (index < translations.length && translations[index] !== undefined) {
        // For primitives in array, replace directly
        if (typeof item !== 'object' || item === null) {
          return translations[index];
        }
        // For objects in array, merge recursively
        return deepMergeTranslations(item, translations[index], `${path}[${index}]`);
      }
      return item;
    });
  }

  // resumeData is array but translations is object (legacy fallback)
  if (Array.isArray(resumeData)) {
    return resumeData.map((item, index) => {
      const itemTranslation = translations[index] || translations[Object.keys(translations)[index]];
      if (itemTranslation !== undefined) {
        if (typeof item !== 'object' || item === null) {
          return itemTranslation;
        }
        return deepMergeTranslations(item, itemTranslation, `${path}[${index}]`);
      }
      return item;
    });
  }

  // Both are objects
  const result = { ...resumeData };
  for (const key of Object.keys(result)) {
    if (translations[key] !== undefined) {
      result[key] = deepMergeTranslations(result[key], translations[key], `${path}.${key}`);
    }
  }
  return result;
}


function getContentTranslations() {
  const currentLng = i18next.language;
  const resources = i18next.store?.data?.[currentLng]?.translation;
  console.debug('[i18n] Current language:', currentLng);
  console.debug('[i18n] Content translations keys:', resources?.content ? Object.keys(resources.content) : 'none');
  return resources?.content || null;
}

async function loadResume() {
  try {
    const response = await fetch('./data/resume.json');
    if (!response.ok) throw new Error('Failed to load resume.json');

    let resumeData = await response.json();

    const contentTranslations = getContentTranslations();
    if (contentTranslations) {
      console.debug('[i18n] Merging translations for keys:', Object.keys(contentTranslations));
      resumeData = deepMergeTranslations(resumeData, contentTranslations, 'root');
    } else {
      console.warn('[i18n] No content translations found!');
    }

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