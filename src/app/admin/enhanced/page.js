"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EnhancePage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [candidatesLoaded, setCandidatesLoaded] = useState(false);
  const [status, setStatus] = useState(null);
  const [selectedTerms, setSelectedTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [maxConcurrent, setMaxConcurrent] = useState(1);
  const [minLength, setMinLength] = useState(0);
  const [maxLength, setMaxLength] = useState(1500);
  
  // Estados para pesquisa individual
  const [individualSearchTerm, setIndividualSearchTerm] = useState("");
  const [individualSearchResult, setIndividualSearchResult] = useState(null);
  const [individualSearchLoading, setIndividualSearchLoading] = useState(false);

  // Função para carregar candidatos (chamada manualmente)
  const loadCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/enhance-candidates?minLength=${minLength}&maxLength=${maxLength}`);
      const data = await response.json();
      
      if (data.success) {
        setCandidates(data.candidates);
        setCandidatesLoaded(true);
      } else {
        console.error("Erro ao buscar candidatos:", data.error);
        alert("Erro ao carregar candidatos: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao buscar candidatos:", error);
      alert("Erro ao carregar candidatos: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Verificar status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/v1/enhance-status");
        const data = await response.json();
        
        if (data.success) {
          setStatus(data.status);
          
          // Se estiver em andamento, verificar novamente em 5 segundos
          if (data.status.inProgress) {
            setTimeout(checkStatus, 5000);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar status:", error);
      }
    };
    
    checkStatus();
  }, []);
  
  // Pesquisa individual de termo
  const searchIndividualTerm = async () => {
    if (!individualSearchTerm.trim()) {
      alert("Digite um termo para pesquisar!");
      return;
    }
    
    try {
      setIndividualSearchLoading(true);
      setIndividualSearchResult(null);
      
      // Primeiro, vamos buscar o termo na API de termos
      const response = await fetch(`/api/v1/term/${individualSearchTerm.toLowerCase().replace(/\s+/g, '-')}`);
      const data = await response.json();
      
      if (data.success && data.term) {
        // Analisar o termo encontrado
        const term = data.term;
        let contentLength = 0;
        let hasCodeExamples = false;
        
        if (typeof term.content === 'string') {
          contentLength = term.content.length;
        } else if (typeof term.content === 'object') {
          contentLength = Object.values(term.content)
            .map(section => section.content || '')
            .join(' ').length;
        }
        
        hasCodeExamples = term.codeExamples && term.codeExamples.length > 0;
        
        setIndividualSearchResult({
          term: individualSearchTerm,
          found: true,
          data: {
            ...term,
            contentLength,
            hasCodeExamples,
            version: term.version || 'v1',
            lastUpdated: term.last_updated || null
          }
        });
      } else {
        setIndividualSearchResult({
          term: individualSearchTerm,
          found: false,
          data: null
        });
      }
    } catch (error) {
      console.error("Erro ao pesquisar termo:", error);
      setIndividualSearchResult({
        term: individualSearchTerm,
        found: false,
        error: error.message
      });
    } finally {
      setIndividualSearchLoading(false);
    }
  };
  
  // Aprimorar termo individual
  const enhanceIndividualTerm = async (termSlug) => {
    if (!confirm(`Aprimorar o termo "${termSlug}"?`)) {
      return;
    }
    
    try {
      console.log(`Iniciando aprimoramento do termo: ${termSlug}`);
      
      const response = await fetch(`/api/v1/enhance/${termSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Verificar se a resposta está OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Verificar se há conteúdo para parsear
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Resposta não é JSON:', textResponse);
        throw new Error(`Resposta inválida do servidor. Tipo: ${contentType}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        alert('Termo aprimorado com sucesso!');
        // Recarregar o resultado da pesquisa individual
        await searchIndividualTerm();
      } else {
        alert(`Erro ao aprimorar termo: ${data.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro completo ao aprimorar termo:", error);
      
      if (error.message.includes('Unexpected end of JSON input')) {
        alert(`Erro: O servidor retornou uma resposta vazia ou inválida. Verifique se a API está funcionando corretamente.`);
      } else if (error.message.includes('HTTP error')) {
        alert(`Erro HTTP: ${error.message}. Verifique se a rota da API existe.`);
      } else {
        alert(`Erro: ${error.message}`);
      }
    }
  };
  
  // Filtrar candidatos
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = searchTerm === "" || 
      candidate.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.title && candidate.title.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = categoryFilter === "all" || candidate.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Obter categorias únicas
  const categories = ["all", ...new Set(candidates.map(c => c.category))];
  
  // Selecionar todos os termos filtrados
  const selectAllFiltered = () => {
    setSelectedTerms(filteredCandidates.map(c => c.term));
  };
  
  // Limpar seleção
  const clearSelection = () => {
    setSelectedTerms([]);
  };
  
  // Alternar seleção de um termo
  const toggleTerm = (term) => {
    if (selectedTerms.includes(term)) {
      setSelectedTerms(selectedTerms.filter(t => t !== term));
    } else {
      setSelectedTerms([...selectedTerms, term]);
    }
  };
  
  // Iniciar aprimoramento em lote
  const startBatchEnhancement = async () => {
    if (!selectedTerms.length) {
      alert("Selecione pelo menos um termo para aprimorar!");
      return;
    }
    
    if (!confirm(`Iniciar aprimoramento para ${selectedTerms.length} termos?`)) {
      return;
    }
    
    try {
      console.log('Iniciando aprimoramento em lote para:', selectedTerms);
      
      const response = await fetch("/api/v1/enhance-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          terms: selectedTerms,
          maxConcurrent: Number(maxConcurrent)
        }),
      });
      
      console.log('Batch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Resposta não é JSON:', textResponse);
        throw new Error(`Resposta inválida do servidor. Tipo: ${contentType}`);
      }
      
      const data = await response.json();
      console.log('Batch response data:', data);
      
      if (data.success) {
        alert(`Processo iniciado! ${selectedTerms.length} termos serão aprimorados.`);
        setSelectedTerms([]);
        
        // Verificar status imediatamente
        const statusResponse = await fetch("/api/v1/enhance-status");
        const statusData = await statusResponse.json();
        
        if (statusData.success) {
          setStatus(statusData.status);
        }
      } else {
        alert(`Erro: ${data.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro completo ao iniciar aprimoramento:", error);
      
      if (error.message.includes('Unexpected end of JSON input')) {
        alert(`Erro: O servidor retornou uma resposta vazia. Verifique se a API de aprimoramento em lote está funcionando.`);
      } else if (error.message.includes('HTTP error')) {
        alert(`Erro HTTP: ${error.message}. Verifique se a rota da API existe.`);
      } else {
        alert(`Erro: ${error.message}`);
      }
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-background text-foreground px-6 mt-24">
      <Card className="w-full max-w-5xl mb-8">
        <CardHeader>
          <h1 className="text-3xl font-bold">Aprimoramento de Conteúdo</h1>
          <p className="text-muted-foreground">Melhore a qualidade do conteúdo existente para atender aos requisitos do AdSense</p>
        </CardHeader>
        <CardContent>
          {/* Status atual */}
          {status && status.inProgress && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h2 className="text-lg font-bold text-blue-700">Processo em Andamento</h2>
              <p>Total: {status.total} termos</p>
              <p>Concluídos: {status.completed} ({Math.round((status.completed / status.total) * 100)}%)</p>
              <p>Falhas: {status.failed}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.round((status.completed / status.total) * 100)}%` }}></div>
              </div>
            </div>
          )}
          
          {/* Pesquisa Individual */}
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-md">
            <h2 className="text-lg font-bold text-green-700 mb-4">Pesquisa Individual de Termo</h2>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  type="text"
                  value={individualSearchTerm}
                  onChange={(e) => setIndividualSearchTerm(e.target.value)}
                  placeholder="Digite o nome do termo (ex: javascript, react, api)"
                  onKeyPress={(e) => e.key === 'Enter' && searchIndividualTerm()}
                />
              </div>
              <Button 
                onClick={searchIndividualTerm}
                disabled={individualSearchLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {individualSearchLoading ? "Buscando..." : "Buscar Termo"}
              </Button>
            </div>
            
            {/* Resultado da Pesquisa Individual */}
            {individualSearchResult && (
              <div className="mt-4 p-4 bg-white border rounded-md">
                {individualSearchResult.found ? (
                  <div>
                    <h3 className="font-bold text-green-700 mb-2">✓ Termo Encontrado: {individualSearchResult.data.title || individualSearchResult.term}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Categoria:</span>
                        <p>{individualSearchResult.data.category}</p>
                      </div>
                      <div>
                        <span className="font-medium">Tamanho do Conteúdo:</span>
                        <p className={getContentQualityColor(individualSearchResult.data.contentLength)}>
                          {individualSearchResult.data.contentLength} chars
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Exemplos de Código:</span>
                        <p>{individualSearchResult.data.hasCodeExamples ? "✓ Sim" : "✗ Não"}</p>
                      </div>
                      <div>
                        <span className="font-medium">Versão:</span>
                        <p>{individualSearchResult.data.version}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => enhanceIndividualTerm(individualSearchResult.term.toLowerCase().replace(/\s+/g, '-'))}
                        disabled={status && status.inProgress}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Aprimorar Este Termo
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/termos/${individualSearchResult.term.toLowerCase().replace(/\s+/g, '-')}`, '_blank')}
                      >
                        Ver Página
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold text-red-700 mb-2">✗ Termo Não Encontrado: {individualSearchResult.term}</h3>
                    <p className="text-sm text-gray-600">
                      {individualSearchResult.error 
                        ? `Erro: ${individualSearchResult.error}`
                        : "Este termo não existe na base de dados ou pode estar com um nome diferente."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Seção de Candidatos em Lote */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h2 className="text-lg font-bold text-blue-700 mb-4">Aprimoramento em Lote</h2>
            
            {!candidatesLoaded ? (
              <div className="text-center">
                <p className="mb-4 text-gray-600">Carregue a lista de candidatos para fazer aprimoramento em lote</p>
                <Button 
                  onClick={loadCandidates}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Carregando..." : "Carregar Lista de Candidatos"}
                </Button>
              </div>
            ) : (
              <>
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Buscar na lista:</label>
                    <Input
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filtrar lista..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Categoria:</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full rounded-md border border-input px-3 py-2"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat === "all" ? "Todas as categorias" : cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={loadCandidates}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                    >
                      {loading ? "Atualizando..." : "Atualizar Lista"}
                    </Button>
                  </div>
                </div>
                
                {/* Configuração do Lote */}
                <div className="mb-6 p-4 bg-gray-50 rounded-md">
                  <h3 className="font-medium mb-2">Configuração do Lote</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Processamento Paralelo:</label>
                      <Input
                        type="number"
                        value={maxConcurrent}
                        onChange={(e) => setMaxConcurrent(Number(e.target.value))}
                        min="1"
                        max="5"
                      />
                      <p className="text-xs text-gray-600 mt-1">Cuidado: valores altos podem sobrecarregar a API</p>
                    </div>
                    
                    <div className="md:col-span-2 flex items-end">
                      <div className="space-x-2">
                        <Button onClick={selectAllFiltered} variant="secondary">
                          Selecionar Todos Filtrados ({filteredCandidates.length})
                        </Button>
                        <Button onClick={clearSelection} variant="outline">
                          Limpar Seleção
                        </Button>
                        <Button 
                          onClick={startBatchEnhancement} 
                          disabled={selectedTerms.length === 0 || (status && status.inProgress)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Iniciar Aprimoramento ({selectedTerms.length})
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Lista de Candidatos */}
                <div>
                  <h3 className="font-medium mb-2">Candidatos para Aprimoramento ({filteredCandidates.length})</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-2 text-left w-10">
                            <input 
                              type="checkbox" 
                              checked={filteredCandidates.length > 0 && filteredCandidates.every(c => selectedTerms.includes(c.term))}
                              onChange={() => {
                                if (filteredCandidates.every(c => selectedTerms.includes(c.term))) {
                                  clearSelection();
                                } else {
                                  selectAllFiltered();
                                }
                              }}
                            />
                          </th>
                          <th className="border p-2 text-left">Termo</th>
                          <th className="border p-2 text-left">Categoria</th>
                          <th className="border p-2 text-left">Tamanho</th>
                          <th className="border p-2 text-left">Exemplos</th>
                          <th className="border p-2 text-left">Versão</th>
                          <th className="border p-2 text-left">Última Atualização</th>
                          <th className="border p-2 text-left">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCandidates.map((candidate) => (
                          <tr key={candidate.term} className="hover:bg-gray-50">
                            <td className="border p-2">
                              <input 
                                type="checkbox" 
                                checked={selectedTerms.includes(candidate.term)}
                                onChange={() => toggleTerm(candidate.term)}
                              />
                            </td>
                            <td className="border p-2">
                              <a 
                                href={`/termos/${candidate.term}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline"
                              >
                                {candidate.title || candidate.term}
                              </a>
                            </td>
                            <td className="border p-2">{candidate.category}</td>
                            <td className="border p-2">
                              <span className={`${getContentQualityColor(candidate.contentLength)}`}>
                                {candidate.contentLength} chars
                              </span>
                            </td>
                            <td className="border p-2">
                              {candidate.hasCodeExamples ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-red-600">✗</span>
                              )}
                            </td>
                            <td className="border p-2">{candidate.version}</td>
                            <td className="border p-2">
                              {candidate.lastUpdated 
                                ? new Date(candidate.lastUpdated).toLocaleDateString() 
                                : "Nunca"}
                            </td>
                            <td className="border p-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`/api/v1/enhance/${candidate.term}`, '_blank')}
                                disabled={status && status.inProgress}
                              >
                                Aprimorar
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredCandidates.length === 0 && (
                    <p className="text-center py-4 text-gray-500">Nenhum candidato encontrado com os filtros atuais</p>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Guia de Qualidade */}
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <h2 className="text-2xl font-bold">Guia de Qualidade para AdSense</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">O que é considerado conteúdo de baixo valor?</h3>
              <ul className="list-disc ml-6 mt-2">
                <li>Conteúdo muito curto ou superficial (menos de 300 palavras)</li>
                <li>Conteúdo gerado automaticamente sem revisão humana</li>
                <li>Conteúdo duplicado ou muito similar a outras páginas</li>
                <li>Páginas sem informações úteis ou valor educacional</li>
                <li>Páginas projetadas apenas para gerar tráfego sem fornecer conteúdo significativo</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium">Características de conteúdo de alta qualidade:</h3>
              <ul className="list-disc ml-6 mt-2">
                <li>Informações detalhadas e aprofundadas (1000+ palavras)</li>
                <li>Conteúdo original e único que demonstra expertise</li>
                <li>Exemplos práticos, casos de uso e aplicações reais</li>
                <li>Estrutura clara com títulos, subtítulos e formatação adequada</li>
                <li>Exemplos de código funcionais e bem explicados</li>
                <li>Referências a fontes confiáveis e de alta qualidade</li>
                <li>Conteúdo que responde a perguntas comuns dos usuários (FAQ)</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-md">
              <h3 className="font-medium text-yellow-800">Legendas de qualidade:</h3>
              <div className="flex items-center space-x-4 mt-2">
                <div>
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                  <span className="text-sm">Baixa qualidade (&lt; 500 chars)</span>
                </div>
                <div>
                  <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                  <span className="text-sm">Qualidade média (500-1500 chars)</span>
                </div>
                <div>
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                  <span className="text-sm">Alta qualidade (&gt; 1500 chars)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

// Função para determinar a cor baseada no tamanho do conteúdo
function getContentQualityColor(length) {
  if (length < 500) return "text-red-600";
  if (length < 1500) return "text-yellow-600";
  return "text-green-600";
}