"use client";

import './quiz.css';
import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import QuizQuestion from '@/components/QuizQuestion';
import ProgressBar from '@/components/ProgressBar';
import RefreshBanner from '@/components/RefreshBanner';
import AdSenseRewardAd from '@/components/AdSenseRewardAd';
import QuizPreloader from '@/components/QuizPreloader';
import { selectQuestions, validateAnswer } from '@/lib/quizQuestions';
import { Button } from '@/components/ui/button';

export default function QuizPage() {
  const router = useRouter();
  
  // Estados
  const [sessionId] = useState(() => `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [showPreloader, setShowPreloader] = useState(true);
  const [showInitialReward, setShowInitialReward] = useState(false);
  const [showFinalReward, setShowFinalReward] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Inicializar questões - máximo 5 questões
  useEffect(() => {
    const initialQuestions = selectQuestions([], 5);
    setQuestions(initialQuestions);
  }, []);

  // Handler para quando preloader completar
  const handlePreloaderComplete = () => {
    setShowPreloader(false);
  };

  // Carregar ad da sidebar quando página inicial for exibida
  useEffect(() => {
    if (!quizStarted && !showPreloader && typeof window !== 'undefined') {
      // Delay para garantir que o DOM está pronto e preloader foi exibido
      const timer = setTimeout(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
          console.error('Error loading sidebar ad:', error);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [quizStarted, showPreloader]);


  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  // Handler para quando usuário completa o reward ad inicial
  const handleInitialRewardComplete = () => {
    setShowInitialReward(false);
    setQuizStarted(true);
  };
  
  // Handler para quando usuário seleciona uma resposta
  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    
    // Validar resposta
    const validation = validateAnswer(currentQuestion.id, answerIndex);
    setFeedback(validation);
    setShowFeedback(true);
    
    // Atualizar contador de acertos
    if (validation.isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
    
    // Salvar resposta
    const answerData = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      ...validation,
      timeSpent: 0 // TODO: implementar timer
    };
    
    setAnswers(prev => [...prev, answerData]);
  };
  
  // Handler para próxima questão
  const handleNext = () => {
    if (isLastQuestion) {
      // Última questão - mostrar reward ad final
      setShowFinalReward(true);
    } else {
      // Próxima questão
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setFeedback(null);
    }
  };
  
  // Handler para quando usuário completa o reward ad final
  const handleFinalRewardComplete = async () => {
    setShowFinalReward(false);
    setIsSubmitting(true);
    
    try {
      // Submeter quiz
      const response = await fetch('/api/v1/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          answers
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }
      
      const data = await response.json();
      
      // Redirecionar para resultados
      router.push(`/quiz/resultados?sessionId=${sessionId}`);
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Erro ao enviar quiz. Tente novamente.');
      setIsSubmitting(false);
    }
  };
  
  if (!quizStarted) {
    // Mostrar preloader primeiro
    if (showPreloader) {
      return <QuizPreloader onComplete={handlePreloaderComplete} minDisplayTime={2500} />;
    }
    
    return (
      <>
        {/* Layout com duas colunas: conteúdo à esquerda, anúncio à direita */}
        <div className="min-h-screen bg-gradient-to-b from-[#58CC02] to-[#47A302] p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
              
              {/* Coluna Esquerda - Conteúdo Editorial */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl"
              >
                {/* Ícone e Título */}
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">🎯</div>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#3C3C3C] mb-3">
                    Descubra Seu Perfil de Desenvolvedor
                  </h1>
                  <p className="text-lg text-[#777777] mb-3">
                    Responda ao quiz e encontre as vagas ideais para suas habilidades
                  </p>
                  
                  {/* Informação sobre mercado e salários */}
                  <div className="inline-block bg-[#E8F5E9] rounded-full px-5 py-2 border-2 border-[#58CC02]">
                    <p className="text-sm text-[#3C3C3C]">
                      <span className="font-bold">📊 Mercado aquecido:</span> Salários de R$ 4.000 a R$ 15.000+
                    </p>
                  </div>
                </div>

                {/* Estatísticas do mercado */}
                <div className="bg-gradient-to-r from-[#1CB0F6]/10 to-[#58CC02]/10 rounded-2xl p-5 mb-6 border-2 border-[#E5E5E5]">
                  <h3 className="font-bold text-[#3C3C3C] mb-3 text-center">💰 Faixas Salariais por Nível</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-xl mb-1">🌱</div>
                      <p className="font-bold text-[#3C3C3C] text-sm">Júnior</p>
                      <p className="text-[#58CC02] font-bold text-sm">R$ 4-7k</p>
                    </div>
                    <div className="text-center">
                      <div className="text-xl mb-1">🚀</div>
                      <p className="font-bold text-[#3C3C3C] text-sm">Pleno</p>
                      <p className="text-[#1CB0F6] font-bold text-sm">R$ 7-12k</p>
                    </div>
                    <div className="text-center">
                      <div className="text-xl mb-1">⭐</div>
                      <p className="font-bold text-[#3C3C3C] text-sm">Sênior</p>
                      <p className="text-[#FF9600] font-bold text-sm">R$ 12k+</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#777777] text-center mt-3">
                    *Valores médios baseados em vagas publicadas em novembro de 2024
                  </p>
                </div>

                {/* Benefícios */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 p-3 bg-[#F7F7F7] rounded-xl">
                    <div className="text-2xl">✅</div>
                    <div>
                      <h3 className="font-bold text-[#3C3C3C] mb-1 text-sm">Análise Personalizada</h3>
                      <p className="text-[#777777] text-sm">
                        Identifique seus pontos fortes em desenvolvimento web, mobile, backend e mais
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-[#F7F7F7] rounded-xl">
                    <div className="text-2xl">💼</div>
                    <div>
                      <h3 className="font-bold text-[#3C3C3C] mb-1 text-sm">Vagas com Salários Transparentes</h3>
                      <p className="text-[#777777] text-sm">
                        Veja oportunidades reais com informações claras sobre remuneração e benefícios
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-[#F7F7F7] rounded-xl">
                    <div className="text-2xl">⚡</div>
                    <div>
                      <h3 className="font-bold text-[#3C3C3C] mb-1 text-sm">Rápido e Prático</h3>
                      <p className="text-[#777777] text-sm">
                        Apenas 5 questões para descobrir oportunidades compatíveis com seu perfil
                      </p>
                    </div>
                  </div>
                </div>

                {/* Como Funciona */}
                <div className="bg-[#E8F5E9] rounded-xl p-5 mb-6">
                  <h3 className="font-bold text-[#3C3C3C] mb-3 text-base">📋 Como funciona:</h3>
                  <ol className="space-y-2 text-[#4A4A4A] text-sm">
                    <li className="flex gap-2">
                      <span className="font-bold text-[#58CC02] min-w-[20px]">1.</span>
                      <span>Responda 5 questões sobre suas preferências e habilidades técnicas</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-[#58CC02] min-w-[20px]">2.</span>
                      <span>Receba uma análise detalhada do seu perfil de desenvolvedor</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-[#58CC02] min-w-[20px]">3.</span>
                      <span>Explore vagas personalizadas de acordo com suas competências</span>
                    </li>
                  </ol>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => setShowInitialReward(true)}
                  className="w-full"
                  size="lg"
                >
                  COMEÇAR QUIZ AGORA
                </Button>

                {/* Info adicional */}
                <p className="text-center text-xs text-[#AFAFAF] mt-4">
                  ⏱️ Tempo estimado: 2-3 minutos | 🔒 Seus dados são privados
                </p>
              </motion.div>

              {/* Coluna Direita - Banner de Anúncio */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block sticky top-8"
              >
                <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-[#E5E5E5]">
                  <p className="text-xs text-[#AFAFAF] text-center mb-2">Publicidade</p>
                  <ins
                    className="adsbygoogle"
                    style={{ 
                      display: 'block',
                      minHeight: '600px'
                    }}
                    data-ad-client="ca-pub-5795702444937299"
                    data-ad-slot="3390069372"
                    data-ad-format="vertical"
                    data-full-width-responsive="false"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <AdSenseRewardAd
          show={showInitialReward}
          onRewardGranted={handleInitialRewardComplete}
          adSlot="3390069372"
          minWatchTime={5}
          buttonText="ASSISTIR ANÚNCIO"
          rewardMessage="Assista ao anúncio para começar o quiz"
          icon="🎯"
        />
        
        {!showInitialReward && questions.length === 0 && (
          <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#58CC02] mx-auto mb-4" />
              <p className="text-[#777777]">Carregando quiz...</p>
            </div>
          </div>
        )}
      </>
    );
  }
  
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#58CC02] mx-auto mb-4" />
          <p className="text-[#777777]">Carregando questões...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-white overflow-hidden">

      {/* Reward Ad Final */}
      <AdSenseRewardAd
        show={showFinalReward}
        onRewardGranted={handleFinalRewardComplete}
        adSlot="6473621613"
        minWatchTime={5}
        buttonText="VER RESULTADOS"
        rewardMessage="Assista ao anúncio para ver seus resultados"
        icon="🏆"
      />
      
      {/* Container Principal - Fullscreen com scroll */}
      <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-2">

        {/* Progress Bar no topo */}
        <ProgressBar
          current={currentQuestionIndex + 1}
          total={questions.length}
          correctCount={correctCount}
        />
        
        {/* Banner Ad com Refresh */}
        <RefreshBanner
          adSlot="2725948290"
          refreshInterval={30000}
          maxRefreshes={10}
          className="mb-2"
        />
        
        {/* Quiz Card - Duolingo Style */}
        <motion.div
          className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-4 md:p-6 shadow-sm"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence mode="wait">
            <QuizQuestion
              key={currentQuestion.id}
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              onAnswer={handleAnswer}
              showFeedback={showFeedback}
              feedback={feedback}
            />
          </AnimatePresence>
          
          {/* Botão Continue - Duolingo Style */}
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Enviando...
                  </span>
                ) : isLastQuestion ? (
                  'VER RESULTADOS'
                ) : (
                  'CONTINUAR'
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
      </div>
    </div>
  );
}
