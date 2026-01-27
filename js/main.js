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

      html += `<div class="${key}">`;
      html += `<h${depth}>${key}</h${depth}>`;
      html += jsonToHtml(value, depth + 1, ...ignoreKeys);
      html += `</div>`;
    }
    return html;
  }

  return "";
}

function renderResume(data) {
  console.log('✅ Resume rendered:', data.aboutMe?.professionalSummary);

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
}

function setupLanguageSwitcher() {
  const btnEn = document.getElementById('btn-en');
  const btnPt = document.getElementById('btn-pt');

  if (btnEn) btnEn.onclick = () => i18next.changeLanguage('en').then(loadResume);
  if (btnPt) btnPt.onclick = () => i18next.changeLanguage('pt-BR').then(loadResume);
}

async function loadResume() {
  try {
    console.log('🔄 Loading resume:', i18next.language);

    const response = await fetch(`/data/i18n/${i18next.language}.json`);
    if (!response.ok) throw new Error(`404: /data/i18n/${i18next.language}.json`);

    const resumeData = await response.json();
    renderResume(resumeData);
  } catch (error) {
    console.error('❌ Error while loading resume:', error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initializing Internacional Resume...');

  try {
    await window.initI18n();
    console.log('✅ i18next ready. Detected language:', i18next.language);

    setupLanguageSwitcher();
    await loadResume();
  }
  catch (error) {
    console.error('❌ Some error ocurred:', error);
  }
})