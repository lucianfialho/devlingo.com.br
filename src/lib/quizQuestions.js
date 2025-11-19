/**
 * Quiz Questions Bank - Banco de questões para o DevLingo Quiz
 * 
 * Categorizado por tecnologia, nível e tipo
 */

export const QUIZ_QUESTIONS = [
  // Pergunta Introdutória - Sempre primeira
  {
    id: 'intro-main-tech',
    technology: 'general',
    level: 'all',
    type: 'preference',
    questionType: 'main-tech',
    question: 'Qual área de desenvolvimento você mais se identifica?',
    options: [
      '🌐 Frontend (React, Vue, Angular)',
      '⚙️ Backend (Node.js, Python, Java)',
      '📱 Mobile (React Native, Flutter)',
      '🎨 Full Stack (Frontend + Backend)',
      '🔧 DevOps/Infraestrutura',
      '📊 Data Science/Analytics'
    ],
    correctAnswer: null, // Não tem resposta correta
    explanation: null,
    detectedSkills: []
  },
  
  // JavaScript - Junior
  {
    id: 'js-junior-1',
    technology: 'javascript',
    level: 'junior',
    type: 'multiple-choice',
    question: 'Qual é a saída do seguinte código?\n\n```javascript\nconsole.log(typeof null);\n```',
    options: [
      'null',
      'object',
      'undefined',
      'number'
    ],
    correctAnswer: 1,
    explanation: '`typeof null` retorna "object" devido a um bug histórico do JavaScript que foi mantido por compatibilidade.',
    detectedSkills: ['javascript']
  },
  {
    id: 'js-junior-2',
    technology: 'javascript',
    level: 'junior',
    type: 'multiple-choice',
    question: 'Qual método é usado para adicionar um elemento ao final de um array?',
    options: [
      'append()',
      'push()',
      'add()',
      'insert()'
    ],
    correctAnswer: 1,
    explanation: 'O método `push()` adiciona um ou mais elementos ao final de um array.',
    detectedSkills: ['javascript']
  },
  
  // JavaScript - Pleno
  {
    id: 'js-pleno-1',
    technology: 'javascript',
    level: 'pleno',
    type: 'multiple-choice',
    question: 'O que é "hoisting" em JavaScript?',
    options: [
      'Movimento de declarações para o topo do escopo',
      'Otimização de código pelo compilador',
      'Conversão automática de tipos',
      'Execução assíncrona de funções'
    ],
    correctAnswer: 0,
    explanation: 'Hoisting é o comportamento do JavaScript de mover declarações de variáveis e funções para o topo do escopo antes da execução.',
    detectedSkills: ['javascript']
  },
  {
    id: 'js-pleno-2',
    technology: 'javascript',
    level: 'pleno',
    type: 'code',
    question: 'Qual será a saída?\n\n```javascript\nconst arr = [1, 2, 3];\nconst result = arr.map(x => x * 2).filter(x => x > 3);\nconsole.log(result);\n```',
    options: [
      '[2, 4, 6]',
      '[4, 6]',
      '[1, 2, 3]',
      '[2, 3]'
    ],
    correctAnswer: 1,
    explanation: 'map() multiplica cada elemento por 2 ([2, 4, 6]), depois filter() mantém apenas valores > 3 ([4, 6]).',
    detectedSkills: ['javascript']
  },
  
  // React - Junior
  {
    id: 'react-junior-1',
    technology: 'react',
    level: 'junior',
    type: 'multiple-choice',
    question: 'Qual hook é usado para gerenciar estado em componentes funcionais?',
    options: [
      'useEffect',
      'useState',
      'useContext',
      'useReducer'
    ],
    correctAnswer: 1,
    explanation: 'useState é o hook básico para adicionar estado a componentes funcionais.',
    detectedSkills: ['react', 'javascript']
  },
  {
    id: 'react-junior-2',
    technology: 'react',
    level: 'junior',
    type: 'multiple-choice',
    question: 'Como você passa dados de um componente pai para um filho em React?',
    options: [
      'Usando state',
      'Usando props',
      'Usando context',
      'Usando refs'
    ],
    correctAnswer: 1,
    explanation: 'Props são usadas para passar dados de componentes pais para filhos.',
    detectedSkills: ['react', 'javascript']
  },
  
  // React - Pleno
  {
    id: 'react-pleno-1',
    technology: 'react',
    level: 'pleno',
    type: 'multiple-choice',
    question: 'Quando o useEffect é executado?',
    options: [
      'Apenas na montagem do componente',
      'Após cada renderização',
      'Depende do array de dependências',
      'Antes da renderização'
    ],
    correctAnswer: 2,
    explanation: 'useEffect executa após a renderização, e a frequência depende do array de dependências fornecido.',
    detectedSkills: ['react', 'javascript']
  },
  
  // Python - Junior
  {
    id: 'python-junior-1',
    technology: 'python',
    level: 'junior',
    type: 'multiple-choice',
    question: 'Qual é a diferença entre uma lista e uma tupla em Python?',
    options: [
      'Listas são mais rápidas',
      'Tuplas são imutáveis',
      'Listas só aceitam números',
      'Não há diferença'
    ],
    correctAnswer: 1,
    explanation: 'Tuplas são imutáveis (não podem ser modificadas após criação), enquanto listas são mutáveis.',
    detectedSkills: ['python']
  },
  {
    id: 'python-junior-2',
    technology: 'python',
    level: 'junior',
    type: 'code',
    question: 'Qual será a saída?\n\n```python\nprint(len([1, 2, 3, 4, 5]))\n```',
    options: [
      '4',
      '5',
      '6',
      'Error'
    ],
    correctAnswer: 1,
    explanation: 'len() retorna o número de elementos na lista, que é 5.',
    detectedSkills: ['python']
  },
  
  // Python - Pleno
  {
    id: 'python-pleno-1',
    technology: 'python',
    level: 'pleno',
    type: 'multiple-choice',
    question: 'O que são decorators em Python?',
    options: [
      'Funções que modificam outras funções',
      'Classes especiais',
      'Comentários de documentação',
      'Variáveis globais'
    ],
    correctAnswer: 0,
    explanation: 'Decorators são funções que modificam o comportamento de outras funções ou métodos.',
    detectedSkills: ['python']
  },
  
  // Node.js - Pleno
  {
    id: 'node-pleno-1',
    technology: 'nodejs',
    level: 'pleno',
    type: 'multiple-choice',
    question: 'O que é o Event Loop no Node.js?',
    options: [
      'Um loop infinito que processa eventos',
      'Mecanismo que gerencia operações assíncronas',
      'Sistema de cache',
      'Gerenciador de memória'
    ],
    correctAnswer: 1,
    explanation: 'O Event Loop é o mecanismo que permite ao Node.js executar operações não-bloqueantes.',
    detectedSkills: ['nodejs', 'javascript']
  },
  
  // Git - Junior
  {
    id: 'git-junior-1',
    technology: 'git',
    level: 'junior',
    type: 'multiple-choice',
    question: 'Qual comando cria um novo branch no Git?',
    options: [
      'git new branch',
      'git branch <name>',
      'git create branch',
      'git add branch'
    ],
    correctAnswer: 1,
    explanation: 'git branch <name> cria um novo branch com o nome especificado.',
    detectedSkills: ['git']
  },
  
  // SQL - Pleno
  {
    id: 'sql-pleno-1',
    technology: 'sql',
    level: 'pleno',
    type: 'multiple-choice',
    question: 'Qual é a diferença entre INNER JOIN e LEFT JOIN?',
    options: [
      'Não há diferença',
      'INNER JOIN retorna apenas registros com correspondência em ambas as tabelas',
      'LEFT JOIN é mais rápido',
      'INNER JOIN retorna todos os registros'
    ],
    correctAnswer: 1,
    explanation: 'INNER JOIN retorna apenas registros que têm correspondência em ambas as tabelas, enquanto LEFT JOIN retorna todos da tabela esquerda.',
    detectedSkills: ['sql', 'database']
  },
  
  // Questões de Preferência
  {
    id: 'pref-level',
    technology: 'general',
    level: 'all',
    type: 'preference',
    questionType: 'level',
    question: 'Qual é o seu nível de experiência como desenvolvedor?',
    options: [
      'Junior (0-2 anos)',
      'Pleno (2-5 anos)',
      'Senior (5+ anos)'
    ],
    correctAnswer: null, // Não tem resposta correta
    explanation: null,
    detectedSkills: []
  },
  {
    id: 'pref-location',
    technology: 'general',
    level: 'all',
    type: 'preference',
    questionType: 'location',
    question: 'Qual é sua preferência de trabalho?',
    options: [
      'Remote',
      'São Paulo',
      'Rio de Janeiro',
      'Qualquer lugar'
    ],
    correctAnswer: null,
    explanation: null,
    detectedSkills: []
  }
];

/**
 * Seleciona questões para o quiz baseado em respostas anteriores
 * 
 * @param {Array} previousAnswers - Respostas anteriores do usuário
 * @param {number} count - Número de questões a selecionar
 * @returns {Array} Questões selecionadas
 */
export function selectQuestions(previousAnswers = [], count = 10) {
  const questions = [];
  
  // Sempre começar com a pergunta introdutória
  const introQuestion = QUIZ_QUESTIONS.find(q => q.id === 'intro-main-tech');
  if (introQuestion) {
    questions.push(introQuestion);
  }
  
  // Adicionar outras questões de preferência (exceto a introdutória)
  const otherPrefQuestions = QUIZ_QUESTIONS.filter(q => 
    q.type === 'preference' && q.id !== 'intro-main-tech'
  );
  questions.push(...otherPrefQuestions);
  
  // Detectar tecnologias de interesse baseado em respostas anteriores
  const detectedTechs = new Set();
  
  // Detectar a partir da pergunta introdutória
  const introAnswer = previousAnswers.find(a => a.questionId === 'intro-main-tech');
  if (introAnswer) {
    const selectedOption = introAnswer.selectedAnswer;
    // Mapear a opção selecionada para tecnologias relevantes
    const techMapping = {
      0: ['javascript', 'react'], // Frontend
      1: ['nodejs', 'python'], // Backend
      2: ['react'], // Mobile
      3: ['javascript', 'react', 'nodejs'], // Full Stack
      4: ['git'], // DevOps
      5: ['python', 'sql'] // Data Science
    };
    
    const techs = techMapping[selectedOption] || [];
    techs.forEach(tech => detectedTechs.add(tech));
  }
  
  // Detectar a partir de outras respostas
  previousAnswers.forEach(answer => {
    if (answer.detectedSkills) {
      answer.detectedSkills.forEach(skill => detectedTechs.add(skill));
    }
  });
  
  // Calcular nível baseado em acertos
  let estimatedLevel = 'junior';
  if (previousAnswers.length > 0) {
    const correctCount = previousAnswers.filter(a => a.isCorrect).length;
    const accuracy = correctCount / previousAnswers.length;
    
    if (accuracy >= 0.7) {
      estimatedLevel = 'pleno';
    }
    if (accuracy >= 0.85) {
      estimatedLevel = 'senior';
    }
  }
  
  // Selecionar questões técnicas
  const technicalQuestions = QUIZ_QUESTIONS.filter(q => q.type !== 'preference');
  
  // Priorizar questões das tecnologias detectadas
  let remainingCount = count - questions.length;
  
  if (detectedTechs.size > 0) {
    const relevantQuestions = technicalQuestions.filter(q => 
      detectedTechs.has(q.technology) && 
      (q.level === estimatedLevel || q.level === 'all')
    );
    
    const selected = shuffleArray(relevantQuestions).slice(0, Math.min(remainingCount, relevantQuestions.length));
    questions.push(...selected);
    remainingCount -= selected.length;
  }
  
  // Preencher com questões aleatórias
  if (remainingCount > 0) {
    const remainingQuestions = technicalQuestions.filter(q => 
      !questions.includes(q)
    );
    
    const selected = shuffleArray(remainingQuestions).slice(0, remainingCount);
    questions.push(...selected);
  }
  
  return questions;
}

/**
 * Embaralha array (Fisher-Yates shuffle)
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Valida resposta do usuário
 */
export function validateAnswer(questionId, selectedAnswer) {
  const question = QUIZ_QUESTIONS.find(q => q.id === questionId);
  
  if (!question) {
    throw new Error('Question not found');
  }
  
  // Questões de preferência não têm resposta correta
  if (question.type === 'preference') {
    return {
      isCorrect: null,
      correctAnswer: null,
      explanation: null,
      detectedSkills: question.detectedSkills,
      questionType: question.questionType,
      selectedAnswer: question.options[selectedAnswer]
    };
  }
  
  const isCorrect = selectedAnswer === question.correctAnswer;
  
  return {
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    detectedSkills: question.detectedSkills,
    questionType: question.type
  };
}
