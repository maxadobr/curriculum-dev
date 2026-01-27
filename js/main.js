function jsonToHtml(piece, depth = 3) {
  // Adicionar função para remover objeto/pular para o próximo
  // Caso 1: Array => <ul><li>...</li></ul>
  if (Array.isArray(piece)) {
    let html = "<ul>";
    for (const item of piece) {
      // Se item for primitivo (string/number), coloca direto no <li>
      if (typeof item === "string" || typeof item === "number") {
        html += `<li>${item}</li>`;
      } else {
        // Se for objeto/array, chama recursivo
        html += `<li>${jsonToHtml(item, depth)}</li>`;
      }
    }
    html += "</ul>";
    return html;
  }

  // Caso 2: String ou número => <p>...</p>
  if (typeof piece === "string" || typeof piece === "number") {
    return `<p>${piece}</p>`;
  }

  // Caso 3: Objeto => itera sobre chaves/valores
  if (piece && typeof piece === "object") {
    let html = "";
    // Object.entries retorna array de [chave, valor]
    for (const [key, value] of Object.entries(piece)) {
      html += `<h${depth}>${key}</h${depth}>`;
      html += jsonToHtml(value, depth + 1); // Recursão no valor
    }
    return html;
  }

  // Caso 4: null, undefined, boolean, etc.
  return "";
}

// Render all the sessions of the resume
function renderResume(data) {
  console.log('✅ Resume rendered:', data.aboutMe?.professionalSummary);

  //
  // Basic Presentation
 
  document.getElementById('name').textContent = data.personalInfo.fullName;
  document.getElementById('contact-compact-list').innerHTML = jsonToHtml(data.personalInfo);
  document.getElementById('about-me-container').innerHTML = jsonToHtml(data.aboutMe);

  // What I can do

  document.getElementById('projects-list').innerHTML = jsonToHtml(data.projects);
  document.getElementById('skills-list').innerHTML = jsonToHtml(data.skills);
  document.getElementById('education-list').innerHTML = jsonToHtml(data.education);
  document.getElementById('experience-list').innerHTML = jsonToHtml(data.experience);
  document.getElementById('professional-skills-list').innerHTML = jsonToHtml(data.professionalSkills);
  document.getElementById('languages-list').innerHTML = jsonToHtml(data.languages);
 
  // Personal Area
 
  document.getElementById('personal-info-list').innerHTML = jsonToHtml(data.personalInfo);
  document.getElementById('availability').innerHTML = jsonToHtml(data.availability);
  document.getElementById('goals-list').innerHTML = jsonToHtml(data.careerGoals);
  document.getElementById('contact-list').innerHTML = jsonToHtml(data.personalInfo.contact);
  // TODO: renderPersonalInfo(data.personalInfo);
  // TODO: renderAvailability(data.availability);
  // TODO: renderCarreerGoals(data.carreerGoals);
  // TODO: renderContact(data.contact);
  //
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
    
    // Fetch JSON based on language
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
