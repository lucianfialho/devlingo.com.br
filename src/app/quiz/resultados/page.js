"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import JobCard from '@/components/JobCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ResultadosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('sessionId');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  
  useEffect(() => {
    if (!sessionId) {
      router.push('/quiz');
      return;
    }
    
    fetchResults();
  }, [sessionId]);
  
  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/v1/quiz/submit?sessionId=${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      
      const data = await response.json();
      setResults(data.data);
      setLoading(false);
      
    } catch (err) {
      console.error('Error fetching results:', err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#58CC02] mx-auto mb-4" />
          <p className="text-[#777777] text-lg font-bold">Analisando suas respostas...</p>
        </div>
      </div>
    );
  }
  
  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-[#3C3C3C] mb-2">Ops!</h2>
          <p className="text-[#777777] mb-6">
            Não conseguimos carregar seus resultados.
          </p>
          <Button
            onClick={() => router.push('/quiz')}
            size="lg"
          >
            Fazer Quiz Novamente
          </Button>
        </div>
      </div>
    );
  }
  
  const { profile, stats, jobs } = results;
  
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header - Duolingo Style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#58CC02] mb-4">
            Parabéns!
          </h1>
          <p className="text-xl text-[#777777] font-medium">
            Você completou o DevLingo Quiz
          </p>
        </motion.div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Accuracy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full border-2 border-[#E5E5E5] shadow-none">
              <div className="p-6 text-center">
                <div className="text-5xl font-bold text-[#58CC02] mb-2">
                  {stats.accuracy}%
                </div>
                <div className="text-[#3C3C3C] font-bold text-lg">
                  Taxa de Acerto
                </div>
                <div className="text-sm text-[#777777] mt-2 font-medium">
                  {stats.correctCount} de {stats.totalQuestions} questões
                </div>
              </div>
            </Card>
          </motion.div>
          
          {/* Level */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-2 border-[#E5E5E5] shadow-none">
              <div className="p-6 text-center">
                <div className="text-4xl mb-2">
                  {profile.level === 'senior' ? '🏆' : profile.level === 'pleno' ? '⭐' : '🌱'}
                </div>
                <div className="text-2xl font-bold text-[#3C3C3C] mb-2 capitalize">
                  {profile.level}
                </div>
                <div className="text-[#777777] font-bold">
                  Nível Identificado
                </div>
              </div>
            </Card>
          </motion.div>
          
          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full border-2 border-[#E5E5E5] shadow-none">
              <div className="p-6 text-center">
                <div className="text-5xl font-bold text-[#1CB0F6] mb-2">
                  {profile.skills?.length || 0}
                </div>
                <div className="text-[#3C3C3C] font-bold text-lg mb-2">
                  Skills Identificadas
                </div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {profile.skills?.slice(0, 3).map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-[#DDF4FF] text-[#1CB0F6] text-xs font-bold rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                  {profile.skills?.length > 3 && (
                    <span className="px-2 py-1 bg-[#F7F7F7] text-[#777777] text-xs font-bold rounded-lg">
                      +{profile.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
        
        {/* Profile Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <Card className="border-2 border-[#E5E5E5] shadow-none">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-[#3C3C3C] mb-6">
                Seu Perfil de Desenvolvedor
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Skills */}
                <div>
                  <h3 className="font-bold text-[#777777] mb-4 uppercase text-sm tracking-wider">💻 Tecnologias</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.map((skill, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-[#DDF4FF] text-[#1CB0F6] font-bold rounded-xl border-b-4 border-[#1899D6] active:border-b-0 active:translate-y-1 transition-all"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Preferences */}
                <div>
                  <h3 className="font-bold text-[#777777] mb-4 uppercase text-sm tracking-wider">📍 Preferências</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#3C3C3C]">Nível:</span>
                      <span className="px-3 py-1 bg-[#D7FFB8] text-[#58CC02] font-bold rounded-lg capitalize">
                        {profile.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#3C3C3C]">Localização:</span>
                      <span className="px-3 py-1 bg-[#FFF5D1] text-[#FFC800] font-bold rounded-lg">
                        {profile.locationPreference || 'Qualquer'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* Jobs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-[#3C3C3C]">
              🎯 Vagas Recomendadas
            </h2>
            <span className="text-[#777777] font-bold bg-[#F7F7F7] px-4 py-2 rounded-xl">
              {jobs?.length || 0} vagas
            </span>
          </div>
          
          {jobs && jobs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {jobs.map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))}
            </div>
          ) : (
            <Card className="border-2 border-[#E5E5E5] shadow-none p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-[#3C3C3C] mb-2">
                Nenhuma vaga encontrada
              </h3>
              <p className="text-[#777777]">
                Não encontramos vagas que correspondam ao seu perfil no momento.
                Tente novamente mais tarde!
              </p>
            </Card>
          )}
        </motion.div>
        
        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={() => router.push('/quiz')}
            size="lg"
            className="w-full sm:w-auto text-lg px-8"
          >
            🔄 Fazer Quiz Novamente
          </Button>
          
          <Button
            onClick={() => {
              // TODO: Implementar compartilhamento
              alert('Funcionalidade de compartilhamento em breve!');
            }}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto text-lg px-8"
          >
            📤 Compartilhar Resultados
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
