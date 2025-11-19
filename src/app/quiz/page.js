"use client";

import './quiz.css';
import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import QuizQuestion from '@/components/QuizQuestion';
import ProgressBar from '@/components/ProgressBar';
import RefreshBanner from '@/components/RefreshBanner';
import RewardAd from '@/components/RewardAd';
import { selectQuestions, validateAnswer } from '@/lib/quizQuestions';
import { Button } from '@/components/ui/button';

export default function QuizPage() {
  const router = useRouter();
  
  // Estados
  const [sessionId] = useState(() => `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [showInitialReward, setShowInitialReward] = useState(true);
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
    return (
      <>
        <RewardAd
          show={showInitialReward}
          onComplete={handleInitialRewardComplete}
          adSlot="3390069372"
          minWatchTime={5}
          rewardMessage="Vamos começar o quiz!"
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
      <RewardAd
        show={showFinalReward}
        onComplete={handleFinalRewardComplete}
        adSlot="6473621613"
        minWatchTime={5}
        rewardMessage="Veja seus resultados e vagas recomendadas!"
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
