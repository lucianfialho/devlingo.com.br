"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function QuizPreloader({ onComplete, minDisplayTime = 2000 }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    // Simular progresso de carregamento
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    // Garantir tempo mínimo de exibição
    const minTimeTimeout = setTimeout(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
      
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, remainingTime);
    }, minDisplayTime);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(minTimeTimeout);
    };
  }, [onComplete, minDisplayTime]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-b from-[#58CC02] to-[#47A302] flex items-center justify-center z-50"
    >
      <div className="text-center px-4">
        {/* Logo ou ícone */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="text-8xl mb-4">🎯</div>
          <h1 className="text-white text-3xl md:text-4xl font-bold mb-2">
            DevLingo Quiz
          </h1>
          <p className="text-white/90 text-lg">
            Preparando seu quiz personalizado...
          </p>
        </motion.div>

        {/* Barra de progresso */}
        <div className="max-w-md mx-auto">
          <div className="bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
            <motion.div
              className="bg-white h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-white/80 text-sm mt-3 font-medium">
            {progress < 30 && "🔄 Carregando conteúdo..."}
            {progress >= 30 && progress < 60 && "📊 Preparando anúncios..."}
            {progress >= 60 && progress < 90 && "🎯 Quase lá..."}
            {progress >= 90 && "✨ Tudo pronto!"}
          </p>
        </div>

        {/* Animação de pontos */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-white rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
