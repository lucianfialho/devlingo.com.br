/**
 * Mapeamento de aliases de termos
 * Útil para URLs com encoding problemático ou nomes alternativos
 */

export const termAliases = {
  // C++ pode ser encodado de várias formas
  'c--': 'c++',
  'c-plus-plus': 'c++',
  'cplusplus': 'c++',

  // C# pode ser encodado de várias formas
  'c-sharp': 'c#',
  'csharp': 'c#',

  // F# pode ser encodado de várias formas
  'f-sharp': 'f#',
  'fsharp': 'f#',

  // Adicione mais aliases conforme necessário
};

/**
 * Resolve um slug para seu termo canônico
 */
export function resolveTermAlias(slug) {
  const cleanSlug = slug.toLowerCase().trim();
  return termAliases[cleanSlug] || cleanSlug;
}
