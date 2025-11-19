"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * QuizQuestion - Componente individual de questão estilo Duolingo
 */
export default function QuizQuestion({
  question,
  selectedAnswer,
  onAnswer,
  showFeedback = false,
  feedback = null
}) {
  const [animateWrong, setAnimateWrong] = useState(false);
  
  // Trigger shake animation on wrong answer (but not for preference questions)
  useEffect(() => {
    if (showFeedback && feedback && feedback.isCorrect === false) {
      setAnimateWrong(true);
      setTimeout(() => setAnimateWrong(false), 500);
    }
  }, [showFeedback, feedback]);
  
  const handleOptionClick = (index) => {
    if (!showFeedback && onAnswer) {
      onAnswer(index);
    }
  };
  
  const getOptionVariant = (index) => {
    if (!showFeedback) {
      return index === selectedAnswer ? 'default' : 'outline';
    }
    
    // Para perguntas de preferência (sem resposta correta/incorreta)
    if (feedback?.isCorrect === null) {
      return index === selectedAnswer ? 'default' : 'outline';
    }
    
    if (index === feedback?.correctAnswer) {
      return 'default'; // Green for correct
    }
    
    if (index === selectedAnswer && feedback?.isCorrect === false) {
      return 'destructive'; // Red for wrong
    }
    
    return 'outline';
  };
  
  const getOptionClassName = (index) => {
    let classes = 'w-full text-left justify-start h-auto py-2 px-4 text-sm md:text-base';
    
    if (showFeedback) {
      // Para perguntas de preferência, mostrar a resposta selecionada como correta (verde)
      if (feedback?.isCorrect === null && index === selectedAnswer) {
        classes += ' bg-[#58CC02] text-white border-[#58CC02] hover:bg-[#61D802]';
      } else if (index === feedback?.correctAnswer) {
        classes += ' bg-[#58CC02] text-white border-[#58CC02] hover:bg-[#61D802]';
      } else if (index === selectedAnswer && feedback?.isCorrect === false) {
        classes += ' bg-[#FF4B4B] text-white border-[#FF4B4B]';
      } else {
        classes += ' opacity-50 cursor-not-allowed';
      }
    } else if (index === selectedAnswer) {
      classes += ' bg-[#DDF4FF] border-[#84D8FF]';
    }
    
    return classes;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ 
        opacity: 1, 
        x: 0
      }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={`w-full ${animateWrong ? 'shake' : ''}`}
    >
      {/* Questão */}
      <div className="mb-3">
        <h3 className="text-lg md:text-xl font-bold text-[#3C3C3C] mb-2">
          {question.question}
        </h3>
        
        {question.type === 'code' && question.codeSnippet && (
          <div className="mt-4 p-4 bg-[#F7F7F7] rounded-xl border border-[#E5E5E5]">
            <pre className="text-sm text-[#3C3C3C] overflow-x-auto">
              <code>{question.codeSnippet}</code>
            </pre>
          </div>
        )}
      </div>
      
      {/* Opções - Duolingo Style */}
      <div className="space-y-1.5">
        {question.options.map((option, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Button
              variant="outline"
              className={getOptionClassName(index)}
              onClick={() => handleOptionClick(index)}
              disabled={showFeedback}
            >
              {option}
            </Button>
          </motion.div>
        ))}
      </div>
      
      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && feedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`
              mt-2 p-3 rounded-xl border-2
              ${feedback.isCorrect === null || feedback.isCorrect
                ? 'bg-[#D7FFB8] border-[#58CC02]' 
                : 'bg-[#FFC1C1] border-[#FF4B4B]'
              }
            `}
          >
            <div className="flex items-start gap-2">
              <span className="text-xl flex-shrink-0">
                {feedback.isCorrect === null ? '✨' : feedback.isCorrect ? '✅' : '💡'}
              </span>
              <div>
                <h4 className="font-bold text-[#3C3C3C] mb-1 text-base">
                  {feedback.isCorrect === null 
                    ? 'Perfeito!' 
                    : feedback.isCorrect 
                      ? 'Excelente!' 
                      : 'Não foi dessa vez'
                  }
                </h4>
                {feedback.explanation && (
                  <p className="text-[#3C3C3C] leading-relaxed text-sm">
                    {feedback.explanation}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
