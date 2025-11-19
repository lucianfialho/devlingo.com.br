import { NextResponse } from 'next/server';
import redisClient from '@/lib/redisClient';
import { validateAnswer } from '@/lib/quizQuestions';
import { extractProfileFromAnswers } from '@/lib/jobMatcher';
import { fetchAllJobs, filterJobs } from '@/lib/jobScraper';
import { rankJobs } from '@/lib/jobMatcher';

/**
 * POST /api/v1/quiz/submit
 * 
 * Submete respostas do quiz e retorna perfil + vagas recomendadas
 * 
 * Body:
 * {
 *   sessionId: string,
 *   answers: Array<{
 *     questionId: string,
 *     selectedAnswer: number,
 *     timeSpent: number
 *   }>
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, answers } = body;
    
    if (!sessionId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        {
          success: false,
          error: 'sessionId and answers are required'
        },
        { status: 400 }
      );
    }
    
    // Validar todas as respostas
    const validatedAnswers = answers.map(answer => {
      const validation = validateAnswer(answer.questionId, answer.selectedAnswer);
      return {
        ...answer,
        ...validation
      };
    });
    
    // Calcular estatísticas
    const technicalAnswers = validatedAnswers.filter(a => a.isCorrect !== null);
    const correctCount = technicalAnswers.filter(a => a.isCorrect).length;
    const totalQuestions = technicalAnswers.length;
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    
    // Extrair perfil do desenvolvedor
    const profile = extractProfileFromAnswers(validatedAnswers);
    
    // Buscar vagas
    const allJobs = await fetchAllJobs();
    
    // Filtrar e ranquear vagas baseado no perfil
    const filteredJobs = filterJobs(allJobs, {
      skills: profile.skills,
      level: profile.level,
      location: profile.locationPreference
    });
    
    const rankedJobs = rankJobs(profile, filteredJobs);
    
    // Pegar top 10 vagas
    const topJobs = rankedJobs.slice(0, 10);
    
    // Salvar sessão no Redis
    const sessionData = {
      sessionId,
      answers: validatedAnswers,
      profile,
      stats: {
        totalQuestions,
        correctCount,
        accuracy: Math.round(accuracy)
      },
      jobs: topJobs, // Salvar vagas recomendadas
      timestamp: new Date().toISOString()
    };
    
    try {
      await redisClient.setEx(
        `quiz:session:${sessionId}`,
        86400, // 24 horas
        JSON.stringify(sessionData)
      );
      
      // Salvar perfil separadamente
      await redisClient.setEx(
        `quiz:profile:${sessionId}`,
        86400,
        JSON.stringify(profile)
      );
      
      console.log('✅ Quiz session saved to Redis');
    } catch (cacheError) {
      console.warn('⚠️ Failed to save to Redis:', cacheError);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        profile,
        stats: {
          totalQuestions,
          correctCount,
          incorrectCount: totalQuestions - correctCount,
          accuracy: Math.round(accuracy)
        },
        jobs: topJobs,
        answers: validatedAnswers
      }
    });
    
  } catch (error) {
    console.error('❌ Error submitting quiz:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit quiz',
        message: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/quiz/submit?sessionId=xxx
 * 
 * Recupera resultados de uma sessão anterior
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'sessionId is required'
        },
        { status: 400 }
      );
    }
    
    // Buscar sessão no Redis
    const sessionData = await redisClient.get(`quiz:session:${sessionId}`);
    
    if (!sessionData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found'
        },
        { status: 404 }
      );
    }
    
    const parsedSession = JSON.parse(sessionData);
    
    // Se não houver vagas salvas (sessão antiga ou erro), buscar novamente
    if (!parsedSession.jobs || parsedSession.jobs.length === 0) {
      console.log('🔄 Jobs missing in session, fetching fresh recommendations...');
      
      // Buscar e filtrar vagas novamente
      const allJobs = await fetchAllJobs();
      const filteredJobs = filterJobs(allJobs, {
        skills: parsedSession.profile.skills,
        level: parsedSession.profile.level,
        location: parsedSession.profile.locationPreference
      });
      
      const rankedJobs = rankJobs(parsedSession.profile, filteredJobs);
      parsedSession.jobs = rankedJobs.slice(0, 10);
      
      // Atualizar Redis com as vagas
      await redisClient.setEx(
        `quiz:session:${sessionId}`,
        86400,
        JSON.stringify(parsedSession)
      );
    }
    
    return NextResponse.json({
      success: true,
      data: parsedSession
    });
    
  } catch (error) {
    console.error('❌ Error retrieving quiz session:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve session',
        message: error.message
      },
      { status: 500 }
    );
  }
}
