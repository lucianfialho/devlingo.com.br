"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const RelatedTerms = ({ currentTerm }) => {
  const [relatedTerms, setRelatedTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedTerms = async () => {
      if (!currentTerm) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Limpar o termo para usar na API (remover caracteres especiais, etc.)
        const cleanTerm = currentTerm.toLowerCase().replace(/[-\s]/g, '');
        
        // Tentar múltiplas estratégias para buscar termos relacionados
        let terms = [];
        let apiSource = '';
        
        // Estratégia 1: Buscar sinônimos
        try {
          const synonymsUrl = `https://api.stackexchange.com/2.3/tags/${cleanTerm}/synonyms?order=desc&sort=creation&site=stackoverflow&key=U4DMV*8nvpm3EOpvf69Rxw((&pagesize=8`;
          const synonymsResponse = await fetch(synonymsUrl);
          
          if (synonymsResponse.ok) {
            const synonymsData = await synonymsResponse.json();
            const synonyms = synonymsData.items || [];
            
            if (synonyms.length > 0) {
              terms = synonyms.map(item => ({
                name: item.to_tag || item.from_tag,
                slug: (item.to_tag || item.from_tag).toLowerCase().replace(/[^a-z0-9]/g, '-'),
                count: item.applied_count || 0
              }));
              apiSource = 'synonyms';
            }
          }
        } catch (err) {
          console.log('Sinônimos não encontrados, tentando tags relacionadas...');
        }
        
        // Estratégia 2: Se não encontrou sinônimos, buscar tags relacionadas por popularidade
        if (terms.length === 0) {
          try {
            const relatedUrl = `https://api.stackexchange.com/2.3/tags/${cleanTerm}/related?order=desc&sort=popular&site=stackoverflow&key=U4DMV*8nvpm3EOpvf69Rxw((&pagesize=6`;
            const relatedResponse = await fetch(relatedUrl);
            
            if (relatedResponse.ok) {
              const relatedData = await relatedResponse.json();
              const relatedTags = relatedData.items || [];
              
              if (relatedTags.length > 0) {
                terms = relatedTags.map(item => ({
                  name: item.name,
                  slug: item.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                  count: item.count || 0
                }));
                apiSource = 'related';
              }
            }
          } catch (err) {
            console.log('Tags relacionadas não encontradas...');
          }
        }
        
        // Estratégia 3: Se ainda não encontrou nada, buscar tags populares da mesma categoria
        if (terms.length === 0) {
          try {
            // Buscar tags populares que possam estar relacionadas
            const popularUrl = `https://api.stackexchange.com/2.3/tags?order=desc&sort=popular&site=stackoverflow&key=U4DMV*8nvpm3EOpvf69Rxw((&pagesize=20&inname=${cleanTerm.substring(0, 3)}`;
            const popularResponse = await fetch(popularUrl);
            
            if (popularResponse.ok) {
              const popularData = await popularResponse.json();
              const popularTags = popularData.items || [];
              
              // Filtrar tags que contenham parte do termo original ou sejam relacionadas
              const filteredTags = popularTags.filter(tag => 
                tag.name !== cleanTerm && 
                (tag.name.includes(cleanTerm.substring(0, 3)) || 
                 cleanTerm.includes(tag.name.substring(0, 3)))
              ).slice(0, 5);
              
              if (filteredTags.length > 0) {
                terms = filteredTags.map(item => ({
                  name: item.name,
                  slug: item.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                  count: item.count || 0
                }));
                apiSource = 'popular';
              }
            }
          } catch (err) {
            console.log('Tags populares não encontradas...');
          }
        }
        
        // Estratégia 4: Fallback local se nenhuma estratégia da API funcionou
        if (terms.length === 0) {
          console.log('Usando fallback local para termos relacionados...');
          terms = generateFallbackTerms(currentTerm);
          apiSource = 'fallback';
          setError('API temporariamente indisponível');
        }
        
        setRelatedTerms(terms);
        
        // Log para debug
        console.log(`Termos relacionados encontrados via: ${apiSource}`, terms);
        
      } catch (err) {
        console.error('Erro geral ao buscar termos relacionados:', err);
        
        // Fallback final
        const fallbackTerms = generateFallbackTerms(currentTerm);
        setRelatedTerms(fallbackTerms);
        setError('API temporariamente indisponível');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedTerms();
  }, [currentTerm]);

  // Função para gerar termos relacionados como fallback
  const generateFallbackTerms = (term) => {
    const techTermsMap = {
      'javascript': ['nodejs', 'react', 'typescript', 'html', 'css', 'es6'],
      'python': ['django', 'flask', 'pandas', 'numpy', 'tensorflow', 'pip'],
      'java': ['spring', 'maven', 'gradle', 'hibernate', 'junit', 'jvm'],
      'react': ['javascript', 'jsx', 'redux', 'nextjs', 'hooks', 'components'],
      'nodejs': ['javascript', 'express', 'npm', 'mongodb', 'typescript', 'backend'],
      'css': ['html', 'sass', 'bootstrap', 'flexbox', 'grid', 'responsive'],
      'html': ['css', 'javascript', 'dom', 'semantic', 'accessibility', 'web'],
      'sql': ['database', 'mysql', 'postgresql', 'mongodb', 'nosql', 'query'],
      'git': ['github', 'version-control', 'gitlab', 'bitbucket', 'merge', 'commit'],
      'api': ['rest', 'graphql', 'json', 'http', 'endpoint', 'microservices'],
      'php': ['laravel', 'symfony', 'wordpress', 'mysql', 'composer', 'web'],
      'angular': ['typescript', 'javascript', 'rxjs', 'components', 'services', 'frontend'],
      'vue': ['javascript', 'vuex', 'nuxt', 'components', 'directives', 'frontend'],
      'docker': ['container', 'kubernetes', 'devops', 'deployment', 'microservices', 'virtualization'],
      'mongodb': ['nosql', 'database', 'json', 'aggregation', 'indexing', 'collections'],
      'mysql': ['sql', 'database', 'relational', 'queries', 'indexing', 'normalization'],
      'linux': ['ubuntu', 'bash', 'terminal', 'server', 'commands', 'filesystem'],
      'aws': ['cloud', 'ec2', 's3', 'lambda', 'devops', 'infrastructure'],
      'firebase': ['google', 'realtime', 'authentication', 'hosting', 'nosql', 'backend']
    };

    const cleanTerm = term.toLowerCase().replace(/[-\s]/g, '');
    const related = techTermsMap[cleanTerm] || [];
    
    // Se não encontrou mapeamento específico, gerar termos genéricos relacionados a tecnologia
    if (related.length === 0) {
      const genericTerms = ['programming', 'development', 'coding', 'software', 'web', 'technology'];
      return genericTerms.slice(0, 4).map(genericTerm => ({
        name: genericTerm,
        slug: genericTerm.replace(/[^a-z0-9]/g, '-'),
        count: 0
      }));
    }
    
    return related.slice(0, 6).map(relatedTerm => ({
      name: relatedTerm,
      slug: relatedTerm.replace(/[^a-z0-9]/g, '-'),
      count: 0
    }));
  };

  if (loading) {
    return (
      <section className="w-full py-6">
        <h2 id="termos-relacionados" className="text-2xl font-semibold mb-4">📂 Termos relacionados</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="shadow-sm animate-pulse">
              <CardContent className="text-center py-3 px-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error && relatedTerms.length === 0) {
    return (
      <section className="w-full py-6">
        <h2 id="termos-relacionados" className="text-2xl font-semibold mb-4">📂 Termos relacionados</h2>
        <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
          <div className="mb-2">🔍</div>
          <p className="text-sm">Não foi possível encontrar termos relacionados no momento.</p>
          <p className="text-xs mt-1">Tente recarregar a página ou volte mais tarde.</p>
        </div>
      </section>
    );
  }

  if (relatedTerms.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-6">
      <h2 id="termos-relacionados" className="text-2xl font-semibold mb-4">📂 Termos relacionados</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {relatedTerms.map((relatedTerm, index) => (
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="text-center py-3 px-2">
              <Link 
                href={`/termos/${relatedTerm.slug}`} 
                className="text-blue-600 hover:underline text-sm md:text-base block"
              >
                {relatedTerm.name}
              </Link>
              {relatedTerm.count > 0 && (
                <span className="text-xs text-gray-500 mt-1 block">
                  {relatedTerm.count} usos
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {error && relatedTerms.length > 0 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
          <span className="text-xs text-yellow-700">
            ⚠️ Mostrando termos relacionados alternativos (API temporariamente indisponível)
          </span>
        </div>
      )}
    </section>
  );
};

export default RelatedTerms;