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

    return `
      <article class="project-card">
        <div class="project-image">
          ${imageHtml}
        </div>
        <div class="project-content">
          <h3>${project.name}</h3>
          <p class="project-description">${project.description}</p>
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

function renderEducation(education) {
  let html = '';

  const getStatusClass = (status) => {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s.includes('complet') || s.includes('conclu')) return 'status-completed';
    return 'status-in-progress';
  };

  const getTranslatedStatus = (status) => {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s.includes('complet') || s.includes('conclu')) return i18next.t('value.status.completed');
    if (s.includes('progress') || s.includes('andamento')) return i18next.t('value.status.inProgress');
    return status;
  };

  // Undergraduate
  if (education.undergraduate) {
    const undergrad = education.undergraduate;
    html += `
      <article class="education-card education-card-major">
        <div class="education-content">
          <h3>${undergrad.degree}</h3>
          <p class="education-institution">${undergrad.institution}</p>
          <p class="education-period">${undergrad.startDate} - ${undergrad.completionDate}</p>
          <span class="education-status ${getStatusClass(undergrad.status)}">${getTranslatedStatus(undergrad.status)}</span>
        </div>
      </article>
    `;
  }

  // Tech Courses
  if (education.techCourses) {
    // Helper to parse "MM/YYYY" into a comparable value
    const parseDate = (dateStr) => {
      if (!dateStr) return 0;
      const [month, year] = dateStr.split('/');
      return new Date(parseInt(year), parseInt(month) - 1).getTime();
    };

    // Helper to check if status is "In progress"
    const isInProgress = (status) => {
      if (!status) return false;
      const s = status.toLowerCase();
      return !s.includes('complet') && !s.includes('conclu');
    };

    // Sort courses: In Progress first, then by date descending (newest first)
    const sortedCourses = [...education.techCourses].sort((a, b) => {
      const aInProgress = isInProgress(a.status);
      const bInProgress = isInProgress(b.status);

      // 1. Status priority: In Progress comes before Completed
      if (aInProgress && !bInProgress) return -1;
      if (!aInProgress && bInProgress) return 1;

      // 2. Date priority: Newest date first
      const dateA = parseDate(a.completionDate || a.expectedStartDate);
      const dateB = parseDate(b.completionDate || b.expectedStartDate);

      return dateB - dateA;
    });

    sortedCourses.forEach(course => {
      const institution = course.institution || course.platform || '';
      const date = course.completionDate || course.expectedStartDate || '';
      const focusTags = course.focus ? course.focus.map(f => `<span class="tech-tag">${f}</span>`).join('') : '';

      html += `
        <article class="education-card">
          <div class="education-content">
            <h3>${course.name}</h3>
            ${institution ? `<p class="education-institution">${institution}</p>` : ''}
            <p class="education-period">${date} ${course.workload ? `• ${course.workload}` : ''}</p>
            ${course.status ? `<span class="education-status ${getStatusClass(course.status)}">${getTranslatedStatus(course.status)}</span>` : ''}
            ${focusTags ? `<div class="education-tags">${focusTags}</div>` : ''}
          </div>
        </article>
      `;
    });
  }

  // Technical Courses (older) - smaller cards with muted colors
  if (education.technicalCourses) {
    html += '<div class="education-minor-grid">';
    education.technicalCourses.forEach(course => {
      html += `
        <article class="education-card-minor">
          <h4>${course.name}</h4>
          <p>${course.institution} • ${course.year} • ${course.workload}</p>
        </article>
      `;
    });
    html += '</div>';
  }

  document.getElementById('education-list').innerHTML = html;
}

function renderResume(data) {
  document.getElementById('name').textContent = data.personalInfo.fullName;
  document.getElementById('contact-compact-list').innerHTML = renderContactCompact(data.personalInfo.contact);
  document.getElementById('about-me-container').innerHTML = jsonToHtml(data.aboutMe);

  renderProjects(data.projects);
  document.getElementById('skills-list').innerHTML = jsonToHtml(data.skills);
  renderEducation(data.education);
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


function deepMergeTranslations(resumeData, translations) {
  if (!translations || typeof translations !== 'object') {
    return resumeData;
  }

  if (Array.isArray(resumeData)) {
    if (Array.isArray(translations)) {
      // Merge arrays item by item to preserve properties not present in translations
      return resumeData.map((item, index) => {
        const itemTranslation = translations[index];
        if (itemTranslation) {
          return deepMergeTranslations(item, itemTranslation);
        }
        return item;
      });
    }
    // Fallback for object-based translations of arrays
    return resumeData.map((item, index) => {
      const itemTranslation = translations[index] || translations[Object.keys(translations)[index]];
      if (typeof item === 'object' && item !== null && itemTranslation) {
        return deepMergeTranslations(item, itemTranslation);
      }
      return itemTranslation || item;
    });
  }

  if (typeof resumeData === 'object' && resumeData !== null) {
    const result = { ...resumeData };
    for (const key of Object.keys(result)) {
      if (translations[key] !== undefined) {
        if (typeof result[key] === 'object' && result[key] !== null && typeof translations[key] === 'object') {
          result[key] = deepMergeTranslations(result[key], translations[key]);
        } else {
          result[key] = translations[key];
        }
      }
    }
    return result;
  }

  return translations !== undefined ? translations : resumeData;
}


function getContentTranslations() {
  const currentLng = i18next.language;
  const resources = i18next.store?.data?.[currentLng]?.translation;
  return resources?.content || null;
}

async function loadResume() {
  try {
    const response = await fetch('./data/resume.json');
    if (!response.ok) throw new Error('Failed to load resume.json');

    let resumeData = await response.json();

    const contentTranslations = getContentTranslations();
    if (contentTranslations) {
      resumeData = deepMergeTranslations(resumeData, contentTranslations);
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