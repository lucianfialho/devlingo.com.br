/**
 * Job Scraper - Integração com APIs de vagas de emprego
 * 
 * Suporta múltiplas fontes:
 * - RemoteOK API (vagas remotas)
 * - Dataset mockado (fallback)
 */

const REMOTEOK_API = 'https://remoteok.com/api';

/**
 * Normaliza dados de vaga de diferentes fontes para formato padrão
 */
function normalizeJob(job, source = 'remoteok') {
  if (source === 'remoteok') {
    return {
      id: job.id || job.slug,
      title: job.position,
      company: job.company,
      location: job.location || 'Remote',
      description: job.description,
      url: job.url,
      salary: job.salary_min && job.salary_max 
        ? `$${job.salary_min} - $${job.salary_max}` 
        : null,
      tags: job.tags || [],
      date: job.date,
      logo: job.company_logo,
      source: 'RemoteOK'
    };
  }
  
  return job;
}

/**
 * Busca vagas da API RemoteOK
 */
export async function fetchRemoteOKJobs() {
  try {
    const response = await fetch(REMOTEOK_API, {
      headers: {
        'User-Agent': 'DevLingo Job Matcher (lucian@metricasboss.com.br)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`RemoteOK API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // RemoteOK retorna um array onde o primeiro item é metadata
    const jobs = data.slice(1);
    
    return jobs.map(job => normalizeJob(job, 'remoteok'));
  } catch (error) {
    console.error('❌ Error fetching RemoteOK jobs:', error);
    return [];
  }
}

/**
 * Dataset mockado de vagas para desenvolvimento e fallback
 */
export function getMockJobs() {
  return [
    {
      id: 'mock-1',
      title: 'Desenvolvedor Frontend React',
      company: 'TechCorp Brasil',
      location: 'São Paulo, SP (Remoto)',
      description: 'Buscamos desenvolvedor React com experiência em Next.js e TypeScript.',
      url: 'https://example.com/job/1',
      salary: 'R$ 8.000 - R$ 12.000',
      tags: ['react', 'nextjs', 'typescript', 'javascript', 'frontend'],
      date: new Date().toISOString(),
      logo: null,
      source: 'Mock'
    },
    {
      id: 'mock-2',
      title: 'Desenvolvedor Full Stack Node.js',
      company: 'StartupXYZ',
      location: 'Remote',
      description: 'Desenvolvedor full stack para trabalhar com Node.js, React e MongoDB.',
      url: 'https://example.com/job/2',
      salary: 'R$ 10.000 - R$ 15.000',
      tags: ['nodejs', 'react', 'mongodb', 'javascript', 'fullstack'],
      date: new Date().toISOString(),
      logo: null,
      source: 'Mock'
    },
    {
      id: 'mock-3',
      title: 'Engenheiro de Software Python',
      company: 'DataCo',
      location: 'Rio de Janeiro, RJ (Híbrido)',
      description: 'Engenheiro Python para trabalhar com data science e machine learning.',
      url: 'https://example.com/job/3',
      salary: 'R$ 12.000 - R$ 18.000',
      tags: ['python', 'django', 'machine-learning', 'data-science'],
      date: new Date().toISOString(),
      logo: null,
      source: 'Mock'
    },
    {
      id: 'mock-4',
      title: 'Desenvolvedor Backend Java',
      company: 'Enterprise Solutions',
      location: 'Belo Horizonte, MG',
      description: 'Desenvolvedor Java sênior para projetos enterprise com Spring Boot.',
      url: 'https://example.com/job/4',
      salary: 'R$ 14.000 - R$ 20.000',
      tags: ['java', 'spring', 'microservices', 'backend'],
      date: new Date().toISOString(),
      logo: null,
      source: 'Mock'
    },
    {
      id: 'mock-5',
      title: 'Desenvolvedor Mobile React Native',
      company: 'AppMakers',
      location: 'Remote',
      description: 'Desenvolvedor mobile para criar apps iOS e Android com React Native.',
      url: 'https://example.com/job/5',
      salary: 'R$ 9.000 - R$ 14.000',
      tags: ['react-native', 'mobile', 'javascript', 'ios', 'android'],
      date: new Date().toISOString(),
      logo: null,
      source: 'Mock'
    },
    {
      id: 'mock-6',
      title: 'DevOps Engineer',
      company: 'CloudTech',
      location: 'Remote',
      description: 'DevOps engineer para gerenciar infraestrutura AWS e CI/CD.',
      url: 'https://example.com/job/6',
      salary: 'R$ 15.000 - R$ 22.000',
      tags: ['devops', 'aws', 'docker', 'kubernetes', 'ci-cd'],
      date: new Date().toISOString(),
      logo: null,
      source: 'Mock'
    }
  ];
}

/**
 * Filtra vagas baseado em skills e nível
 */
export function filterJobs(jobs, { skills = [], level = null, location = null }) {
  return jobs.filter(job => {
    // Filtro por skills
    if (skills.length > 0) {
      const jobTags = job.tags.map(tag => tag.toLowerCase());
      const hasMatchingSkill = skills.some(skill => 
        jobTags.includes(skill.toLowerCase())
      );
      if (!hasMatchingSkill) return false;
    }
    
    // Filtro por localização
    if (location && !job.location.toLowerCase().includes(location.toLowerCase())) {
      return false;
    }
    
    // Filtro por nível (baseado em palavras-chave no título/descrição)
    if (level) {
      const text = `${job.title} ${job.description}`.toLowerCase();
      const levelKeywords = {
        junior: ['junior', 'jr', 'entry', 'iniciante'],
        pleno: ['pleno', 'mid', 'middle', 'intermediário'],
        senior: ['senior', 'sr', 'lead', 'principal', 'sênior']
      };
      
      const keywords = levelKeywords[level.toLowerCase()] || [];
      const hasLevel = keywords.some(keyword => text.includes(keyword));
      
      // Se não encontrar nível específico, incluir vagas sem nível definido
      if (!hasLevel && level !== 'pleno') return false;
    }
    
    return true;
  });
}

/**
 * Busca vagas de todas as fontes disponíveis
 */
export async function fetchAllJobs() {
  const [remoteOKJobs] = await Promise.all([
    fetchRemoteOKJobs()
  ]);
  
  const mockJobs = getMockJobs();
  
  // Combinar todas as fontes
  const allJobs = [...remoteOKJobs, ...mockJobs];
  
  // Remover duplicatas por ID
  const uniqueJobs = Array.from(
    new Map(allJobs.map(job => [job.id, job])).values()
  );
  
  return uniqueJobs;
}
