"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * JobCard - Card de vaga de emprego com match score - Duolingo Style
 */
export default function JobCard({ job, index = 0 }) {
  const matchScore = job.matchScore || 0;
  
  // Cor do match score - Duolingo palette
  const getMatchColor = () => {
    if (matchScore >= 80) return 'text-[#58CC02] bg-[#D7FFB8]';
    if (matchScore >= 60) return 'text-[#1CB0F6] bg-[#DDF4FF]';
    if (matchScore >= 40) return 'text-[#FFC800] bg-[#FFF5D1]';
    return 'text-[#777777] bg-[#E5E5E5]';
  };
  
  const getMatchLabel = () => {
    if (matchScore >= 80) return 'Excelente match!';
    if (matchScore >= 60) return 'Bom match';
    if (matchScore >= 40) return 'Match razoável';
    return 'Match baixo';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full hover:shadow-md transition-all duration-300 border-2 border-[#E5E5E5] hover:border-[#58CC02]">
        <div className="p-6 flex flex-col h-full">
          {/* Header com Logo e Match Score */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              {/* Logo */}
              {job.logo ? (
                <img
                  src={job.logo}
                  alt={job.company}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#E5E5E5]"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-[#F7F7F7] border-2 border-[#E5E5E5] flex items-center justify-center">
                  <span className="text-[#3C3C3C] font-bold text-xl">
                    {job.company?.[0] || '?'}
                  </span>
                </div>
              )}
              
              {/* Título e Empresa */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#3C3C3C] mb-1 leading-tight">
                  {job.title}
                </h3>
                <p className="text-[#777777] font-medium">
                  {job.company}
                </p>
              </div>
            </div>
          </div>
          
          {/* Match Score Badge */}
          <div className={`self-start mb-4 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 ${getMatchColor()}`}>
            <span className="text-lg">{matchScore}%</span>
            <span>{getMatchLabel()}</span>
          </div>
          
          {/* Informações */}
          <div className="space-y-3 mb-6 flex-grow">
            {/* Localização */}
            <div className="flex items-center gap-2 text-[#777777]">
              <span className="text-lg">📍</span>
              <span className="text-sm font-medium">{job.location}</span>
            </div>
            
            {/* Salário */}
            {job.salary && (
              <div className="flex items-center gap-2 text-[#777777]">
                <span className="text-lg">💰</span>
                <span className="text-sm font-medium">{job.salary}</span>
              </div>
            )}
            
            {/* Source */}
            <div className="flex items-center gap-2 text-[#777777]">
              <span className="text-lg">💼</span>
              <span className="text-xs font-medium">Via {job.source}</span>
            </div>
            
            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {job.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-[#F7F7F7] text-[#777777] text-xs font-bold rounded-lg border border-[#E5E5E5]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Ações */}
          <div className="flex gap-3 mt-auto">
            <Button
              asChild
              className="flex-1"
              variant="default" // Green button
            >
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <span>Ver Vaga</span>
                <span className="text-lg">↗</span>
              </a>
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              title="Salvar vaga"
            >
              ❤️
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
