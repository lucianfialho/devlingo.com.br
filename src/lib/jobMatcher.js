/**
 * Job Matcher - Algoritmo de matching entre perfil do quiz e vagas
 */

/**
 * Calcula score de compatibilidade entre perfil e vaga
 * 
 * @param {Object} profile - Perfil do desenvolvedor do quiz
 * @param {Object} job - Vaga de emprego
 * @returns {number} Score de 0 a 100
 */
export function calculateMatchScore(profile, job) {
  let score = 0;
  let maxScore = 0;
  
  // 1. Skills match (peso 50)
  const skillWeight = 50;
  maxScore += skillWeight;
  
  if (profile.skills && profile.skills.length > 0 && job.tags && job.tags.length > 0) {
    const profileSkills = profile.skills.map(s => s.toLowerCase());
    const jobTags = job.tags.map(t => t.toLowerCase());
    
    const matchingSkills = profileSkills.filter(skill => 
      jobTags.some(tag => tag.includes(skill) || skill.includes(tag))
    );
    
    const skillMatchRatio = matchingSkills.length / profileSkills.length;
    score += skillMatchRatio * skillWeight;
  }
  
  // 2. Level match (peso 30)
  const levelWeight = 30;
  maxScore += levelWeight;
  
  if (profile.level) {
    const jobText = `${job.title} ${job.description}`.toLowerCase();
    const levelKeywords = {
      junior: ['junior', 'jr', 'entry', 'iniciante'],
      pleno: ['pleno', 'mid', 'middle', 'intermediário'],
      senior: ['senior', 'sr', 'lead', 'principal', 'sênior']
    };
    
    const keywords = levelKeywords[profile.level.toLowerCase()] || [];
    const hasLevel = keywords.some(keyword => jobText.includes(keyword));
    
    if (hasLevel) {
      score += levelWeight;
    } else {
      // Se não mencionar nível, dar pontuação parcial (vaga pode aceitar qualquer nível)
      score += levelWeight * 0.5;
    }
  }
  
  // 3. Location preference (peso 20)
  const locationWeight = 20;
  maxScore += locationWeight;
  
  if (profile.locationPreference) {
    const jobLocation = job.location.toLowerCase();
    const preference = profile.locationPreference.toLowerCase();
    
    if (preference === 'remote' && jobLocation.includes('remote')) {
      score += locationWeight;
    } else if (jobLocation.includes(preference)) {
      score += locationWeight;
    } else if (jobLocation.includes('remote')) {
      // Remote é sempre uma opção boa
      score += locationWeight * 0.7;
    }
  } else {
    // Se não tem preferência, dar pontuação neutra
    score += locationWeight * 0.5;
  }
  
  // Normalizar para 0-100
  return Math.round((score / maxScore) * 100);
}

/**
 * Ranqueia vagas por compatibilidade com o perfil
 * 
 * @param {Object} profile - Perfil do desenvolvedor
 * @param {Array} jobs - Lista de vagas
 * @returns {Array} Vagas ordenadas por score com campo matchScore
 */
export function rankJobs(profile, jobs) {
  const jobsWithScore = jobs.map(job => ({
    ...job,
    matchScore: calculateMatchScore(profile, job)
  }));
  
  // Ordenar por score decrescente
  return jobsWithScore.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Gera explicação do match para o usuário
 * 
 * @param {Object} profile - Perfil do desenvolvedor
 * @param {Object} job - Vaga com matchScore
 * @returns {Object} Explicação estruturada do match
 */
export function explainMatch(profile, job) {
  const explanation = {
    score: job.matchScore,
    reasons: [],
    missingSkills: []
  };
  
  // Analisar skills
  if (profile.skills && job.tags) {
    const profileSkills = profile.skills.map(s => s.toLowerCase());
    const jobTags = job.tags.map(t => t.toLowerCase());
    
    const matchingSkills = profileSkills.filter(skill => 
      jobTags.some(tag => tag.includes(skill) || skill.includes(tag))
    );
    
    const missingSkills = jobTags.filter(tag => 
      !profileSkills.some(skill => tag.includes(skill) || skill.includes(tag))
    );
    
    if (matchingSkills.length > 0) {
      explanation.reasons.push({
        type: 'skills',
        message: `Você tem ${matchingSkills.length} skill(s) que a vaga procura`,
        details: matchingSkills
      });
    }
    
    if (missingSkills.length > 0) {
      explanation.missingSkills = missingSkills.slice(0, 5); // Top 5 missing
    }
  }
  
  // Analisar nível
  if (profile.level) {
    const jobText = `${job.title} ${job.description}`.toLowerCase();
    const levelKeywords = {
      junior: ['junior', 'jr', 'entry', 'iniciante'],
      pleno: ['pleno', 'mid', 'middle', 'intermediário'],
      senior: ['senior', 'sr', 'lead', 'principal', 'sênior']
    };
    
    const keywords = levelKeywords[profile.level.toLowerCase()] || [];
    const hasLevel = keywords.some(keyword => jobText.includes(keyword));
    
    if (hasLevel) {
      explanation.reasons.push({
        type: 'level',
        message: `Nível compatível: ${profile.level}`,
        details: null
      });
    }
  }
  
  // Analisar localização
  if (profile.locationPreference) {
    const jobLocation = job.location.toLowerCase();
    const preference = profile.locationPreference.toLowerCase();
    
    if (preference === 'remote' && jobLocation.includes('remote')) {
      explanation.reasons.push({
        type: 'location',
        message: 'Vaga remota conforme sua preferência',
        details: null
      });
    } else if (jobLocation.includes(preference)) {
      explanation.reasons.push({
        type: 'location',
        message: `Localização compatível: ${job.location}`,
        details: null
      });
    }
  }
  
  return explanation;
}

/**
 * Extrai perfil de desenvolvedor das respostas do quiz
 * 
 * @param {Array} answers - Respostas do quiz
 * @returns {Object} Perfil do desenvolvedor
 */
export function extractProfileFromAnswers(answers) {
  const profile = {
    skills: [],
    level: 'pleno', // default
    locationPreference: 'remote',
    interests: []
  };
  
  // Analisar respostas para extrair skills
  answers.forEach(answer => {
    if (answer.detectedSkills) {
      profile.skills.push(...answer.detectedSkills);
    }
    
    if (answer.questionType === 'level') {
      profile.level = answer.selectedAnswer;
    }
    
    if (answer.questionType === 'location') {
      profile.locationPreference = answer.selectedAnswer;
    }
  });
  
  // Remover skills duplicadas
  profile.skills = [...new Set(profile.skills)];
  
  // Calcular nível baseado em acertos (se não foi perguntado diretamente)
  if (!answers.some(a => a.questionType === 'level')) {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalQuestions = answers.length;
    const accuracy = correctAnswers / totalQuestions;
    
    if (accuracy >= 0.8) {
      profile.level = 'senior';
    } else if (accuracy >= 0.5) {
      profile.level = 'pleno';
    } else {
      profile.level = 'junior';
    }
  }
  
  return profile;
}
