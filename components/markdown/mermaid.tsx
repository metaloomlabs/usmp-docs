'use client'

import { memo, useEffect, useRef } from 'react'

interface MermaidProps {
  chart: string
  className?: string
}

export const normalizeChart = (input?: string): string => {
  if (!input) return ''

  return input
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
}

/**
 * Standard W3C SVG namespace URI required for valid SVG elements.
 */
export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

/**
 * Explicit allowlist of safe SVG element tag names used by Mermaid and standard SVG graphics.
 * Any element tag outside this allowlist is removed during sanitization.
 */
export const ALLOWED_SVG_TAGS: ReadonlySet<string> = new Set([
  'svg',
  'g',
  'defs',
  'symbol',
  'marker',
  'clippath',
  'mask',
  'pattern',
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'text',
  'tspan',
  'textpath',
  'lineargradient',
  'radialgradient',
  'stop',
  'use',
  'a',
  'style',
  'desc',
  'title',
])

/**
 * Disallowed SVG element tags that can execute code, manipulate DOM,
 * or embed external HTML/resources (defense-in-depth).
 */
export const DISALLOWED_SVG_TAGS: ReadonlySet<string> = new Set([
  'script',
  'foreignobject',
  'set',
  'animate',
  'animatemotion',
  'animatetransform',
  'handler',
  'listener',
  'iframe',
  'frame',
  'object',
  'embed',
  'applet',
  'audio',
  'video',
  'source',
  'track',
  'meta',
  'link',
  'base',
])

/**
 * Safe global, geometry, presentation, and XML attributes allowed on SVG elements.
 */
export const ALLOWED_SVG_ATTRIBUTES: ReadonlySet<string> = new Set([
  // Identification & classes
  'id',
  'class',
  'style',
  'transform',
  'role',
  'tabindex',
  // Layout & positioning
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'dx',
  'dy',
  'd',
  'points',
  'width',
  'height',
  'viewbox',
  'preserveaspectratio',
  // Presentation
  'fill',
  'fill-opacity',
  'fill-rule',
  'stroke',
  'stroke-width',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-opacity',
  'opacity',
  'color',
  'visibility',
  'display',
  'overflow',
  'clip-path',
  'clip-rule',
  'mask',
  'marker-start',
  'marker-mid',
  'marker-end',
  'paint-order',
  'vector-effect',
  'shape-rendering',
  'text-rendering',
  'image-rendering',
  // Typography
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'text-anchor',
  'dominant-baseline',
  'alignment-baseline',
  'letter-spacing',
  'word-spacing',
  // Markers, Gradients & Patterns
  'markerwidth',
  'markerheight',
  'markerunits',
  'orient',
  'refx',
  'refy',
  'offset',
  'stop-color',
  'stop-opacity',
  'gradientunits',
  'gradienttransform',
  'spreadmethod',
  'patternunits',
  'patterncontentunits',
  'patterntransform',
  // XML & Namespaces
  'xmlns',
  'xmlns:xlink',
  'xmlns:svg',
  'version',
  'xml:space',
  // Links & references (strictly validated per tag)
  'href',
  'xlink:href',
  'target',
  'rel',
  'download',
])

/**
 * Permitted CSS function calls within sanitized CSS values.
 */
export const ALLOWED_CSS_FUNCTIONS: ReadonlySet<string> = new Set([
  'url',
  'rgb',
  'rgba',
  'hsl',
  'hsla',
  'var',
  'calc',
])

/**
 * Counts the number of consecutive backslashes immediately preceding the specified index.
 */
export function countBackslashes(str: string, index: number): number {
  let count = 0
  let k = index - 1
  while (k >= 0 && str[k] === '\\') {
    count++
    k--
  }
  return count
}

/**
 * Decodes XML numeric character references (both decimal &#123; and hex &#x7b;)
 * and standard XML named entities.
 */
export function decodeXmlEntities(val: string): string {
  if (!val) return ''
  return val
    .replace(/&#x([0-9a-fA-F]+);?/gi, (_, hex) => {
      try {
        const code = Number.parseInt(hex, 16)
        return Number.isNaN(code) ? '' : String.fromCodePoint(code)
      } catch {
        return ''
      }
    })
    .replace(/&#([0-9]+);?/g, (_, dec) => {
      try {
        const code = Number.parseInt(dec, 10)
        return Number.isNaN(code) ? '' : String.fromCodePoint(code)
      } catch {
        return ''
      }
    })
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
}

/**
 * Decodes CSS character escape sequences in identifiers and tokens.
 * Crucially: does NOT decode quotes (\" or \') or backslashes (\\) into structural
 * syntax delimiters, preserving string and token boundaries.
 */
export function decodeCssEscapes(css: string): string {
  if (!css) return ''
  return css
    .replace(/\\([0-9a-fA-F]{1,6})\s?/g, (match, hex) => {
      try {
        const code = Number.parseInt(hex, 16)
        if (Number.isNaN(code)) return ''
        const char = String.fromCodePoint(code)
        // Do not turn hex escapes into structural quotes or backslashes that corrupt tokenizer
        if (char === '"' || char === "'" || char === '\\') {
          return match
        }
        return char
      } catch {
        return ''
      }
    })
    .replace(/\\([^\r\n\f0-9a-fA-F])/g, (match, ch) => {
      // Preserve escaped quotes and escaped backslashes so string/token boundaries remain valid
      if (ch === '"' || ch === "'" || ch === '\\') {
        return match
      }
      return ch
    })
}

/**
 * Strips CSS comments while preserving quoted string literals and respecting backslash parity.
 * Fails closed (returns empty string) if an unclosed comment or unclosed string is encountered.
 */
export function stripCssComments(css: string): string {
  if (!css) return ''
  let result = ''
  let i = 0
  let inString: string | null = null

  while (i < css.length) {
    const char = css[i]
    if (inString !== null) {
      result += char
      if (char === inString) {
        const bs = countBackslashes(css, i)
        if (bs % 2 === 0) {
          inString = null // Unescaped closing quote
        }
      }
      i++
    } else if (char === '"' || char === "'") {
      inString = char
      result += char
      i++
    } else if (char === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      if (end === -1) {
        break // Drops unclosed comment to EOF
      }
      result += ' '
      i = end + 2
    } else {
      result += char
      i++
    }
  }

  if (inString !== null) {
    return '' // Unterminated string -> fail closed
  }

  return result
}

/**
 * Canonically normalizes CSS text by stripping comments and decoding XML entities and CSS escapes.
 */
export function normalizeCssText(css: string): string {
  const stripped = stripCssComments(css)
  if (!stripped) return ''
  return decodeCssEscapes(decodeXmlEntities(stripped))
}

/**
 * Checks whether a URI contains dangerous schemes (javascript:, vbscript:, data:).
 * Decodes XML entities and CSS escapes, and strips whitespace and ASCII control characters.
 */
export function isUnsafeUri(rawUri: string): boolean {
  if (!rawUri) return false
  const decoded = decodeXmlEntities(decodeCssEscapes(rawUri))

  // Strip ASCII whitespace and control characters (<= 32 and 127..159)
  let normalized = ''
  for (let i = 0; i < decoded.length; i++) {
    const code = decoded.charCodeAt(i)
    if (code > 32 && (code < 127 || code > 159)) {
      normalized += decoded[i]
    }
  }
  normalized = normalized.toLowerCase()

  if (
    normalized.startsWith('javascript:') ||
    normalized.startsWith('vbscript:') ||
    normalized.startsWith('data:') ||
    normalized.startsWith('file:') ||
    normalized.startsWith('blob:')
  ) {
    return true
  }

  return false
}

/**
 * Validates whether an anchor URL target is safe for user navigation.
 * Permits only safe fragment identifiers (#id), relative paths, https, http, and mailto.
 */
export function isSafeAnchorUrl(rawUrl: string): boolean {
  if (!rawUrl) return false
  if (isUnsafeUri(rawUrl)) return false

  const decoded = decodeXmlEntities(decodeCssEscapes(rawUrl)).trim()
  let normalized = ''
  for (let i = 0; i < decoded.length; i++) {
    const code = decoded.charCodeAt(i)
    if (code > 32 && (code < 127 || code > 159)) {
      normalized += decoded[i]
    }
  }
  const lower = normalized.toLowerCase()

  return (
    lower.startsWith('#') ||
    lower.startsWith('/') ||
    lower.startsWith('./') ||
    lower.startsWith('../') ||
    lower.startsWith('https://') ||
    lower.startsWith('http://') ||
    lower.startsWith('mailto:')
  )
}

/**
 * Validates and sanitizes a CSS property value.
 * Validates permitted function calls (url, rgb, rgba, var, calc) and restricts
 * url() targets strictly to local fragment identifiers (#id).
 */
export function sanitizeCssValue(value: string): string | null {
  if (!value) return null
  const val = value.trim()
  const lower = val.toLowerCase()

  // Reject dangerous keywords and script protocols
  if (
    lower.includes('javascript:') ||
    lower.includes('vbscript:') ||
    lower.includes('data:') ||
    lower.includes('expression') ||
    lower.includes('behavior') ||
    lower.includes('-moz-binding')
  ) {
    return null
  }

  // Scan and validate all function calls
  let result = ''
  let i = 0
  let inString: string | null = null

  while (i < val.length) {
    const c = val[i]

    if (inString !== null) {
      result += c
      if (c === inString) {
        const bs = countBackslashes(val, i)
        if (bs % 2 === 0) {
          inString = null
        }
      }
      i++
      continue
    }

    if (c === '"' || c === "'") {
      inString = c
      result += c
      i++
      continue
    }

    const funcMatch = val.slice(i).match(/^([a-zA-Z_-][a-zA-Z0-9_-]*)\s*\(/)
    if (funcMatch) {
      const funcName = funcMatch[1].toLowerCase()
      if (!ALLOWED_CSS_FUNCTIONS.has(funcName)) {
        return null // Unallowed function call
      }

      // Find matching closing parenthesis
      const startParen = i + funcMatch[0].length
      let parenDepth = 1
      let j = startParen
      let quote: string | null = null
      let innerContent = ''

      while (j < val.length && parenDepth > 0) {
        const ch = val[j]
        if (!quote && (ch === '"' || ch === "'")) {
          quote = ch
          innerContent += ch
        } else if (quote && ch === quote) {
          const bs = countBackslashes(val, j)
          if (bs % 2 === 0) {
            quote = null
          }
          innerContent += ch
        } else if (!quote && ch === '(') {
          parenDepth++
          innerContent += ch
        } else if (!quote && ch === ')') {
          parenDepth--
          if (parenDepth > 0) innerContent += ch
        } else {
          innerContent += ch
        }
        j++
      }

      if (parenDepth !== 0 || quote !== null) {
        return null // Unbalanced parentheses or unterminated string in function
      }

      if (funcName === 'url') {
        const rawTarget = innerContent
          .trim()
          .replace(/^['"]|['"]$/g, '')
          .trim()
        if (rawTarget.startsWith('#')) {
          result += `url(${rawTarget})`
        } else {
          result += 'none'
        }
      } else {
        const safeArgs = sanitizeCssValue(innerContent)
        if (safeArgs === null) return null
        result += `${funcName}(${safeArgs})`
      }

      i = j
      continue
    }

    result += val[i]
    i++
  }

  if (inString !== null) {
    return null // Unterminated string -> fail closed
  }

  return result
}

/**
 * Parses and sanitizes a CSS declaration list (e.g., inside a rule block or inline style attribute).
 */
export function parseAndSanitizeDeclarations(declBlock: string): string {
  const norm = normalizeCssText(declBlock)
  if (!norm) return ''
  const declarations: string[] = []
  let current = ''
  let inString: string | null = null
  let parenDepth = 0

  for (let i = 0; i < norm.length; i++) {
    const c = norm[i]
    if (inString) {
      current += c
      if (c === inString) {
        const bs = countBackslashes(norm, i)
        if (bs % 2 === 0) inString = null
      }
    } else if (c === '"' || c === "'") {
      inString = c
      current += c
    } else if (c === '(') {
      parenDepth++
      current += c
    } else if (c === ')') {
      if (parenDepth > 0) parenDepth--
      current += c
    } else if (c === ';' && parenDepth === 0) {
      if (current.trim()) declarations.push(current.trim())
      current = ''
    } else {
      current += c
    }
  }

  if (inString !== null || parenDepth !== 0) {
    return '' // Unterminated string or unbalanced parens -> fail closed
  }

  if (current.trim()) declarations.push(current.trim())

  const validDecls: string[] = []
  for (const decl of declarations) {
    const colonIdx = decl.indexOf(':')
    if (colonIdx === -1) continue

    const prop = decl.slice(0, colonIdx).trim().toLowerCase()
    const rawVal = decl.slice(colonIdx + 1).trim()

    // Enforce property name is valid CSS identifier or custom property (--*)
    if (!/^(--[a-zA-Z0-9_-]+|[a-zA-Z_-][a-zA-Z0-9_-]*)$/.test(prop)) {
      continue
    }

    if (
      prop === 'behavior' ||
      prop === '-moz-binding' ||
      prop === '-webkit-binding' ||
      prop.includes('expression') ||
      prop.includes('javascript')
    ) {
      continue
    }

    const safeVal = sanitizeCssValue(rawVal)
    if (safeVal !== null) {
      validDecls.push(`${prop}: ${safeVal};`)
    }
  }

  return validDecls.join(' ')
}

/**
 * Checks whether braces are strictly balanced outside quoted strings.
 */
export function verifyBalancedBraces(css: string): boolean {
  let braceCount = 0
  let inString: string | null = null

  for (let i = 0; i < css.length; i++) {
    const c = css[i]
    if (inString) {
      if (c === inString) {
        const bs = countBackslashes(css, i)
        if (bs % 2 === 0) inString = null
      }
    } else if (c === '"' || c === "'") {
      inString = c
    } else if (c === '{') {
      braceCount++
    } else if (c === '}') {
      braceCount--
      if (braceCount < 0) return false
    }
  }

  return braceCount === 0 && inString === null
}

/**
 * Finds the index of the next unquoted occurrence of a character, ignoring characters inside strings.
 */
export function findNextUnquoted(str: string, charToFind: string, startIndex: number): number {
  let inString: string | null = null
  for (let i = startIndex; i < str.length; i++) {
    const c = str[i]
    if (inString) {
      if (c === inString) {
        const bs = countBackslashes(str, i)
        if (bs % 2 === 0) inString = null
      }
    } else if (c === '"' || c === "'") {
      inString = c
    } else if (c === charToFind) {
      return i
    }
  }
  return -1
}

/**
 * Finds the index of the matching closing brace for an open brace, ignoring braces inside strings.
 */
export function findMatchingCloseBrace(str: string, openBraceIndex: number): number {
  let depth = 1
  let inString: string | null = null
  let i = openBraceIndex + 1

  while (i < str.length && depth > 0) {
    const c = str[i]
    if (inString) {
      if (c === inString) {
        const bs = countBackslashes(str, i)
        if (bs % 2 === 0) inString = null
      }
    } else if (c === '"' || c === "'") {
      inString = c
    } else if (c === '{') {
      depth++
    } else if (c === '}') {
      depth--
    }
    i++
  }

  if (depth === 0 && inString === null) {
    return i - 1
  }
  return -1
}

/**
 * Allowlist of block @-rules permitted in sanitized SVG styling.
 */
export const ALLOWED_BLOCK_AT_RULES: ReadonlySet<string> = new Set([
  'media',
  'supports',
  'keyframes',
  '-webkit-keyframes',
])

/**
 * Parses, validates, and reconstructs CSS rules from <style> blocks.
 * Accurately tracks string literals, backslash parity, and function arguments.
 * Disallows dangerous @-rules (@import, @charset, @namespace, @font-face).
 * Correctly handles nested @media / @supports rule blocks and custom properties.
 * Rejects ambiguous, unterminated, or malformed CSS constructs (fail closed).
 */
export function sanitizeCss(cssText: string): string {
  if (!cssText || typeof cssText !== 'string') return ''

  const normalized = normalizeCssText(cssText)
  if (!normalized) return ''

  // Verify balanced braces outside strings
  if (!verifyBalancedBraces(normalized)) return ''

  const cleanRules: string[] = []
  let i = 0

  while (i < normalized.length) {
    // Skip leading whitespace
    while (i < normalized.length && /\s/.test(normalized[i])) {
      i++
    }
    if (i >= normalized.length) break

    if (normalized[i] === '@') {
      const semiIdx = findNextUnquoted(normalized, ';', i)
      const braceIdx = findNextUnquoted(normalized, '{', i)

      if (semiIdx !== -1 && (braceIdx === -1 || semiIdx < braceIdx)) {
        // Disallowed standalone at-rule without block (@import, @charset, @namespace)
        i = semiIdx + 1
        continue
      }

      if (braceIdx !== -1) {
        const atPrelude = normalized.slice(i, braceIdx).trim()
        const match = atPrelude.match(/^@([a-zA-Z0-9-]+)/)
        const atName = match ? match[1].toLowerCase() : ''

        const closeBrace = findMatchingCloseBrace(normalized, braceIdx)
        if (closeBrace === -1) return '' // Malformed

        if (!ALLOWED_BLOCK_AT_RULES.has(atName)) {
          // Disallowed block at-rules (@font-face, @document, etc.)
          i = closeBrace + 1
          continue
        }

        const blockContent = normalized.slice(braceIdx + 1, closeBrace)

        if (atName === 'media' || atName === 'supports') {
          // Nested stylesheet of rules
          const cleanNested = sanitizeCss(blockContent)
          if (cleanNested) {
            cleanRules.push(`${atPrelude} {\n${cleanNested}\n}`)
          }
        } else if (atName.includes('keyframes')) {
          // Keyframe selectors (from, to, 0%..100%)
          const cleanKeyframes = sanitizeCss(blockContent)
          if (cleanKeyframes) {
            cleanRules.push(`${atPrelude} {\n${cleanKeyframes}\n}`)
          }
        }

        i = closeBrace + 1
        continue
      }

      return '' // Malformed at-rule
    }

    // Qualified rule (style rule): selector { declarations }
    const openBrace = findNextUnquoted(normalized, '{', i)
    if (openBrace === -1) {
      // Stray text outside a rule block
      break
    }
    const selector = normalized.slice(i, openBrace).trim()
    const closeBrace = findMatchingCloseBrace(normalized, openBrace)
    if (closeBrace === -1) return ''

    const declBlock = normalized.slice(openBrace + 1, closeBrace)
    const cleanDecls = parseAndSanitizeDeclarations(declBlock)
    if (cleanDecls && selector) {
      cleanRules.push(`${selector} { ${cleanDecls} }`)
    }
    i = closeBrace + 1
  }

  return cleanRules.join('\n')
}

/**
 * Normalizes an element's tag name by removing XML namespace prefixes (e.g., "svg:rect" -> "rect")
 * and converting to lowercase.
 */
export function getNormalizedTagName(el: Element): string {
  const localName = el.localName || el.tagName || ''
  const tagWithoutPrefix = localName.includes(':') ? localName.split(':').pop() || '' : localName
  return tagWithoutPrefix.toLowerCase()
}

/**
 * Validates whether an attribute is allowed and safe on an SVG element.
 */
export function isUnsafeAttribute(attrName: string, attrVal: string, tagName = ''): boolean {
  const lowerName = attrName.toLowerCase()
  const lowerTag = tagName.toLowerCase()

  // Disallow any inline event handlers (onclick, onload, onerror, onmouseover, etc.)
  // Handles namespaced handlers like xlink:onload, svg:onclick
  if (lowerName.startsWith('on') || lowerName.includes(':on')) {
    return true
  }

  // Enforce allowed attributes list (plus data-* and aria-*)
  if (
    !ALLOWED_SVG_ATTRIBUTES.has(lowerName) &&
    !lowerName.startsWith('data-') &&
    !lowerName.startsWith('aria-')
  ) {
    return true
  }

  // Restrict hyperlink-specific attributes exclusively to <a>
  if (lowerName === 'target' || lowerName === 'rel' || lowerName === 'download') {
    if (lowerTag !== 'a') {
      return true
    }
  }

  // Restrict XML namespaces and SVG document metadata exclusively to <svg>
  if (lowerName.startsWith('xmlns') || lowerName === 'version' || lowerName === 'xml:space') {
    if (lowerTag !== 'svg') {
      return true
    }
  }

  // Restrict viewport attributes strictly to viewport-establishing elements
  if (lowerName === 'viewbox' || lowerName === 'preserveaspectratio') {
    if (
      lowerTag !== 'svg' &&
      lowerTag !== 'symbol' &&
      lowerTag !== 'marker' &&
      lowerTag !== 'pattern'
    ) {
      return true
    }
  }

  // Check URL attributes
  if (
    lowerName === 'href' ||
    lowerName === 'xlink:href' ||
    lowerName === 'src' ||
    lowerName === 'action' ||
    lowerName === 'formaction'
  ) {
    if (isUnsafeUri(attrVal)) {
      return true
    }

    // Restrict <use> tags strictly to local fragment identifiers (#id)
    if (lowerTag === 'use' && (lowerName === 'href' || lowerName === 'xlink:href')) {
      const trimmed = decodeXmlEntities(decodeCssEscapes(attrVal)).trim()
      if (!trimmed.startsWith('#')) {
        return true
      }
    }

    // Restrict <a> tags to safe anchor URLs
    if (lowerTag === 'a' && (lowerName === 'href' || lowerName === 'xlink:href')) {
      if (!isSafeAnchorUrl(attrVal)) {
        return true
      }
    }

    // Only <a> and <use> may have href or xlink:href in sanitized SVG
    if (lowerTag !== 'a' && lowerTag !== 'use') {
      return true
    }
  }

  // Check inline style attribute for CSS execution or external URLs
  if (lowerName === 'style') {
    const sanitized = parseAndSanitizeDeclarations(attrVal)
    if (!sanitized) {
      return true
    }
  }

  return false
}

/**
 * Hardens an SVG DOM Element by enforcing:
 * 1. Strict SVG namespace URI check (exact equality with SVG_NAMESPACE).
 * 2. Explicit SVG element allowlist (removes any disallowed or unexpected element).
 * 3. Strict attribute allowlist and validation (strips inline event handlers, dangerous URIs, external <use>).
 * 4. CSS declaration sanitization for <style> elements and inline styles.
 * 5. Safe anchor restrictions (noopener, noreferrer on external targets).
 */
export function sanitizeSvgElement(svgElement: Element): Element {
  if (!svgElement) return svgElement

  // 1. Enforce EXACT SVG namespace equality on root element (rejects null, undefined, foreign)
  if (svgElement.namespaceURI !== SVG_NAMESPACE) {
    if (typeof svgElement.replaceChildren === 'function') {
      svgElement.replaceChildren()
    }
    return svgElement
  }

  const rootTag = getNormalizedTagName(svgElement)
  if (rootTag !== 'svg' || DISALLOWED_SVG_TAGS.has(rootTag) || !ALLOWED_SVG_TAGS.has(rootTag)) {
    if (typeof svgElement.replaceChildren === 'function') {
      svgElement.replaceChildren()
    }
    return svgElement
  }

  // Sanitize root element's own attributes
  if (svgElement.attributes) {
    for (const attr of Array.from(svgElement.attributes)) {
      if (isUnsafeAttribute(attr.name, attr.value, rootTag)) {
        svgElement.removeAttribute(attr.name)
      }
    }
  }

  // Sanitize descendants
  if (typeof svgElement.querySelectorAll === 'function') {
    const allDescendants = Array.from(svgElement.querySelectorAll('*'))
    for (const el of allDescendants) {
      // 1. Enforce EXACT SVG namespace equality on every descendant (rejects null, undefined, foreign)
      if (el.namespaceURI !== SVG_NAMESPACE) {
        el.remove()
        continue
      }

      const tagName = getNormalizedTagName(el)

      // 2. Enforce explicit element allowlist and reject disallowed tags
      if (DISALLOWED_SVG_TAGS.has(tagName) || !ALLOWED_SVG_TAGS.has(tagName)) {
        el.remove()
        continue
      }

      // 3. Sanitize attributes of allowed elements
      if (el.attributes) {
        for (const attr of Array.from(el.attributes)) {
          if (isUnsafeAttribute(attr.name, attr.value, tagName)) {
            el.removeAttribute(attr.name)
          } else if (attr.name.toLowerCase() === 'style') {
            const cleanedStyle = parseAndSanitizeDeclarations(attr.value)
            if (cleanedStyle !== attr.value) {
              if (cleanedStyle) {
                el.setAttribute(attr.name, cleanedStyle)
              } else {
                el.removeAttribute(attr.name)
              }
            }
          }
        }
      }

      // 4. Anchor safety: if <a> opens in new tab, enforce noopener noreferrer
      if (tagName === 'a' && el.getAttribute('target') === '_blank') {
        el.setAttribute('rel', 'noopener noreferrer')
      }

      // 5. Sanitize CSS rules in <style> blocks
      if (tagName === 'style' && el.textContent) {
        el.textContent = sanitizeCss(el.textContent)
      }
    }
  }

  return svgElement
}

/**
 * Sanitizes an SVG string using the browser DOMParser if available.
 * Fails closed: Never returns unsanitized SVG if DOMParser or XMLSerializer is unavailable.
 */
export function sanitizeSvg(svgString: string): string {
  if (!svgString || typeof svgString !== 'string') return ''

  // Fail closed if DOMParser or XMLSerializer is unavailable
  if (typeof DOMParser === 'undefined' || typeof XMLSerializer === 'undefined') {
    return ''
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgString, 'image/svg+xml')
    if (doc.querySelector('parsererror')) {
      return ''
    }
    const svgElement = doc.documentElement
    if (svgElement?.nodeName.toLowerCase() !== 'svg' || svgElement.namespaceURI !== SVG_NAMESPACE) {
      return ''
    }
    sanitizeSvgElement(svgElement)
    return new XMLSerializer().serializeToString(svgElement)
  } catch {
    return ''
  }
}

let mermaidPromise: Promise<typeof import('mermaid')> | null = null

function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((m) => {
      m.default.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'strict',
      })
      return m
    })
  }
  return mermaidPromise
}

export const Mermaid = memo(({ chart, className }: MermaidProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const current = ref.current

    if (!current || !chart) return

    let isMounted = true

    const renderChart = async () => {
      const id = `mermaid-${crypto.randomUUID().replace(/[^a-zA-Z0-9]/g, '')}`

      try {
        const { default: mermaid } = await getMermaid()
        const { svg } = await mermaid.render(id, normalizeChart(chart))
        if (!isMounted || !ref.current) return

        const parser = new DOMParser()
        const doc = parser.parseFromString(svg, 'image/svg+xml')
        const parserError = doc.querySelector('parsererror')
        if (parserError) {
          throw new Error('Failed to parse Mermaid SVG output')
        }

        const svgElement = doc.documentElement
        if (
          svgElement?.nodeName.toLowerCase() === 'svg' &&
          svgElement.namespaceURI === SVG_NAMESPACE
        ) {
          sanitizeSvgElement(svgElement)
          ref.current.replaceChildren(svgElement)
        } else {
          ref.current.replaceChildren()
        }
      } catch (err) {
        if (!isMounted || !ref.current) return
        ref.current.replaceChildren()
        const pre = document.createElement('pre')
        pre.className =
          'text-xs text-destructive p-3 rounded-md bg-destructive/10 border border-destructive/20 font-mono overflow-x-auto'
        pre.textContent = `Mermaid rendering error: ${
          err instanceof Error ? err.message : String(err)
        }`
        ref.current.appendChild(pre)
      }
    }

    void renderChart()

    return () => {
      isMounted = false
    }
  }, [chart])

  return <div ref={ref} className={className} />
})
