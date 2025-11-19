"use client";

import { Progress } from '@/components/ui/progress';

/**
 * ProgressBar - Barra de progresso estilo Duolingo
 * 
 * @param {number} current - Questão atual (1-indexed)
 * @param {number} total - Total de questões
 * @param {number} correctCount - Número de acertos
 */
export default function ProgressBar({ current, total, correctCount = 0 }) {
  const progress = (current / total) * 100;
  
  return (
    <div className="w-full mb-8">
      {/* Progress Bar - Duolingo Style */}
      <div className="mb-3">
        <Progress value={progress} className="h-4" />
      </div>
      
      {/* Info */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-[#3C3C3C]">
          Questão {current} de {total}
        </span>
        <span className="text-sm font-bold text-[#58CC02]">
          {correctCount} {correctCount === 1 ? 'acerto' : 'acertos'}
        </span>
      </div>
    </div>
  );
}
