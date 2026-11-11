export interface SearchDocument {
  slug: string
  title: string
  description: string
  _searchMeta: {
    cleanContent: string
    headings: string[]
    keywords: string[]
  }
}

export interface SearchResult {
  title: string
  href: string
  snippet?: string
  description?: string
  relevance: number
}

// Backward compatibility alias
export type search = SearchResult

let cachedSearchData: SearchDocument[] | null = null

export async function getSearchData(): Promise<SearchDocument[]> {
  if (cachedSearchData) return cachedSearchData
  const mod = await import('@/public/search-data/documents.json')
  cachedSearchData = (mod.default ?? mod) as SearchDocument[]
  return cachedSearchData
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export interface HighlightToken {
  text: string
  isMatch: boolean
}

export function tokenizeHighlight(text: string, searchTerms: string): HighlightToken[] {
  if (!text) return []
  if (!searchTerms?.trim()) return [{ text, isMatch: false }]

  const rawTerms = searchTerms
    .trim()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)

  if (rawTerms.length === 0) return [{ text, isMatch: false }]

  // Deduplicate case-insensitively, preferring the longer variant if lengths differ
  const termMap = new Map<string, string>()
  for (const term of rawTerms) {
    const lower = term.toLowerCase()
    if (!termMap.has(lower) || term.length > (termMap.get(lower)?.length || 0)) {
      termMap.set(lower, term)
    }
  }

  // Sort descending by length so longer terms match first before substrings
  const terms = Array.from(termMap.values()).sort((a, b) => b.length - a.length)
  const escapedTerms = terms.map((term) => escapeRegex(term))

  try {
    const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi')
    const lowerTerms = new Set(terms.map((t) => t.toLowerCase()))

    const parts = text.split(pattern)
    const tokens: HighlightToken[] = []

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (!part) continue
      const isMatch = lowerTerms.has(part.toLowerCase())
      tokens.push({ text: part, isMatch })
    }

    return tokens.length > 0 ? tokens : [{ text, isMatch: false }]
  } catch {
    return [{ text, isMatch: false }]
  }
}

export function calculateRelevance(
  query: string,
  title: string,
  content: string,
  headings: string[],
  keywords: string[]
): number {
  const lowerQuery = query.toLowerCase().trim()
  const lowerTitle = title.toLowerCase()
  const queryWords = lowerQuery.split(/\s+/).filter(Boolean)

  let score = 0

  if (lowerTitle === lowerQuery) {
    score += 50
  } else if (lowerTitle.includes(lowerQuery)) {
    score += 30
  }

  queryWords.forEach((word) => {
    if (lowerTitle.includes(word)) {
      score += 15
    }
  })

  const lowerHeadings = headings.map((h) => h.toLowerCase())
  if (lowerHeadings.some((h) => h === lowerQuery)) {
    score += 40
  }
  lowerHeadings.forEach((heading) => {
    if (heading.includes(lowerQuery)) {
      score += 25
    }
  })

  const lowerKeywords = keywords.map((k) => k.toLowerCase())
  if (lowerKeywords.some((k) => k === lowerQuery)) {
    score += 35
  }
  lowerKeywords.forEach((keyword) => {
    if (keyword.includes(lowerQuery)) {
      score += 20
    }
  })

  // Safely match exact word occurrences without regex injection crashes
  try {
    const escapedQuery = escapeRegex(lowerQuery)
    const exactMatches = content.toLowerCase().match(new RegExp(`\\b${escapedQuery}\\b`, 'gi'))
    if (exactMatches) {
      score += exactMatches.length * 10
    }
  } catch {
    // If word boundary regex fails for non-word patterns, fall back safely
    if (content.toLowerCase().includes(lowerQuery)) {
      score += 10
    }
  }

  queryWords.forEach((word) => {
    if (content.toLowerCase().includes(word)) {
      score += 5
    }
  })

  const proximityScore = calculateProximityScore(lowerQuery, content.toLowerCase())
  score += proximityScore * 2

  return score / Math.log(content.length + 1)
}

export function calculateProximityScore(query: string, content: string): number {
  if (typeof query !== 'string' || typeof content !== 'string') return 0

  const words = content.split(/\s+/)
  const queryWords = query.split(/\s+/).filter(Boolean)

  let proximityScore = 0
  let firstIndex = -1

  queryWords.forEach((queryWord, queryIndex) => {
    const wordIndex = words.indexOf(queryWord, firstIndex + 1)

    if (wordIndex !== -1) {
      if (queryIndex === 0) {
        proximityScore += 30
      } else if (wordIndex - firstIndex <= 3) {
        proximityScore += 20 - (wordIndex - firstIndex)
      }

      firstIndex = wordIndex
    } else {
      firstIndex = -1
    }
  })

  return proximityScore
}

export function extractSnippet(content: string, query: string): string {
  const indices: number[] = []
  const words = query.split(/\s+/).filter(Boolean)

  words.forEach((word) => {
    const index = content.toLowerCase().indexOf(word.toLowerCase())
    if (index !== -1) {
      indices.push(index)
    }
  })

  if (indices.length === 0) {
    return content.slice(0, 100)
  }

  const avgIndex = Math.floor(indices.reduce((a, b) => a + b) / indices.length)
  const snippetLength = 160
  const contextLength = Math.floor(snippetLength / 2)
  const start = Math.max(0, avgIndex - contextLength)
  const end = Math.min(avgIndex + contextLength, content.length)

  let snippet = content.slice(start, end)
  if (start > 0) snippet = `...${snippet}`
  if (end < content.length) snippet += '...'

  return snippet
}

export function highlight(snippet: string, searchTerms: string): string {
  if (!snippet) return ''
  if (!searchTerms?.trim()) return escapeHtml(snippet)

  const tokens = tokenizeHighlight(snippet, searchTerms)
  return tokens
    .map((token) =>
      token.isMatch
        ? `<span class='highlight'>${escapeHtml(token.text)}</span>`
        : escapeHtml(token.text)
    )
    .join('')
}

export function searchDocuments(query: string, documents: SearchDocument[]): SearchResult[] {
  const lowerQuery = query.toLowerCase().trim()
  const queryWords = lowerQuery.split(/\s+/).filter((word) => word.length >= 3)

  if (queryWords.length === 0) return []

  const results: SearchResult[] = []

  for (const doc of documents) {
    const relevanceScore = calculateRelevance(
      queryWords.join(' '),
      doc.title,
      doc._searchMeta.cleanContent,
      doc._searchMeta.headings,
      doc._searchMeta.keywords
    )

    if (relevanceScore > 0) {
      const snippet = extractSnippet(doc._searchMeta.cleanContent, lowerQuery)

      results.push({
        title: doc.title,
        href: doc.slug,
        snippet,
        description: doc.description || '',
        relevance: relevanceScore,
      })
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10)
}

export async function advanceSearch(query: string): Promise<SearchResult[]> {
  const searchData = await getSearchData()
  return searchDocuments(query, searchData)
}
