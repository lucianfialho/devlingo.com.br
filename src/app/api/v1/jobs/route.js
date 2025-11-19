import { NextResponse } from 'next/server';
import redisClient from '@/lib/redisClient';
import { fetchAllJobs, filterJobs } from '@/lib/jobScraper';

const CACHE_TTL = 3600; // 1 hora

/**
 * GET /api/v1/jobs
 * 
 * Busca vagas de emprego com filtros opcionais
 * 
 * Query params:
 * - skills: string[] - Skills para filtrar (ex: ?skills=react&skills=nodejs)
 * - level: string - Nível (junior, pleno, senior)
 * - location: string - Localização
 * - refresh: boolean - Forçar refresh do cache
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extrair parâmetros
    const skills = searchParams.getAll('skills');
    const level = searchParams.get('level');
    const location = searchParams.get('location');
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    // Criar chave de cache baseada nos filtros
    const cacheKey = `jobs:${skills.join(',') || 'all'}:${level || 'all'}:${location || 'all'}`;
    
    // Tentar buscar do cache
    if (!forceRefresh) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log('✅ Jobs retrieved from cache');
          return NextResponse.json({
            success: true,
            data: JSON.parse(cached),
            source: 'cache'
          });
        }
      } catch (cacheError) {
        console.warn('⚠️ Cache read error:', cacheError);
      }
    }
    
    // Buscar vagas de todas as fontes
    console.log('🔍 Fetching jobs from APIs...');
    const allJobs = await fetchAllJobs();
    
    // Aplicar filtros
    const filters = {
      skills: skills.length > 0 ? skills : [],
      level,
      location
    };
    
    const filteredJobs = filterJobs(allJobs, filters);
    
    // Salvar no cache
    try {
      await redisClient.setEx(
        cacheKey,
        CACHE_TTL,
        JSON.stringify(filteredJobs)
      );
      console.log('✅ Jobs cached successfully');
    } catch (cacheError) {
      console.warn('⚠️ Cache write error:', cacheError);
    }
    
    return NextResponse.json({
      success: true,
      data: filteredJobs,
      source: 'api',
      count: filteredJobs.length,
      filters: filters
    });
    
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch jobs',
        message: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/jobs
 * 
 * Busca vagas baseado em perfil do usuário
 * 
 * Body:
 * {
 *   profile: {
 *     skills: string[],
 *     level: string,
 *     locationPreference: string
 *   }
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { profile } = body;
    
    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Profile is required'
        },
        { status: 400 }
      );
    }
    
    // Buscar todas as vagas
    const allJobs = await fetchAllJobs();
    
    // Filtrar baseado no perfil
    const filters = {
      skills: profile.skills || [],
      level: profile.level,
      location: profile.locationPreference
    };
    
    const filteredJobs = filterJobs(allJobs, filters);
    
    return NextResponse.json({
      success: true,
      data: filteredJobs,
      count: filteredJobs.length,
      profile: profile
    });
    
  } catch (error) {
    console.error('❌ Error fetching jobs by profile:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch jobs',
        message: error.message
      },
      { status: 500 }
    );
  }
}
