import assert from 'node:assert/strict'
import test, { describe, it } from 'node:test'

import {
  calculateRelevance,
  escapeRegex,
  highlight,
  type SearchDocument,
  searchDocuments,
} from '../lib/search'

const mockDocuments: SearchDocument[] = [
  {
    slug: '/docs/getting-started/installation',
    title: 'Installation & Setup',
    description: 'Learn how to install USMP across ESP32, Arduino, and Python.',
    _searchMeta: {
      cleanContent:
        'USMP installation guide. Install the Python library via pip install usmp. For Arduino, download usmp-1.3.0-arduino.zip. For ESP32 (ESP-IDF), use idf-component. Includes PSK pre-shared key generation with 256-bit entropy.',
      headings: [
        'Prerequisites',
        'Python Installation',
        'Arduino Setup (ZIP)',
        'ESP-IDF Component',
      ],
      keywords: ['install', 'setup', 'arduino', 'esp32', 'python', 'psk'],
    },
  },
  {
    slug: '/docs/protocol/encryption',
    title: 'Cryptographic Details',
    description: 'Detailed cryptographic specifications for USMP encryption.',
    _searchMeta: {
      cleanContent:
        'USMP uses ChaCha20-Poly1305 and AES-256-GCM AEAD ciphers. Keys are derived using HKDF-SHA256 with nonce and session_id. Monotonic 32-bit sequence counter prevents replay attacks.',
      headings: [
        'AEAD Ciphers',
        'Key Derivation (HKDF)',
        'Nonce Construction',
        'Rekeying Procedure',
      ],
      keywords: ['crypto', 'encryption', 'chacha20', 'aes-gcm', 'hkdf', 'rekey'],
    },
  },
  {
    slug: '/docs/protocol/handshake',
    title: 'Handshake Mechanics',
    description: 'Three-way cryptographic mutual authentication handshake.',
    _searchMeta: {
      cleanContent:
        'The USMP handshake performs mutual authentication using ephemeral X25519 key exchange and HMAC-SHA256 tokens over Pre-Shared Keys (PSK). Packets include PKT_HELLO, PKT_HELLO_ACK, and PKT_SESSION_OK.',
      headings: [
        'Handshake Overview',
        'Message Flow',
        'HMAC Verification',
        'Session Establishment',
      ],
      keywords: ['handshake', 'authentication', 'x25519', 'psk', 'hello'],
    },
  },
]

describe('Search Functionality & Special Characters - P1 Regression Tests', () => {
  it('correctly escapes regex metacharacters in escapeRegex', () => {
    const chars = ['(', ')', '[', ']', '*', '+', '?', '.', '\\', '^', '$', '{', '}', '|']
    for (const char of chars) {
      const escaped = escapeRegex(char)
      assert.doesNotThrow(() => new RegExp(escaped))
    }
  })

  it('safely handles empty and whitespace-only search input without error', () => {
    assert.deepEqual(searchDocuments('', mockDocuments), [])
    assert.deepEqual(searchDocuments('   ', mockDocuments), [])
    assert.deepEqual(searchDocuments('\t\n', mockDocuments), [])
  })

  it('safely handles single special characters without crashing', () => {
    const specialChars = [
      '(',
      ')',
      '[',
      ']',
      '*',
      '+',
      '?',
      '.',
      '\\',
      '^',
      '$',
      '/',
      '{',
      '}',
      '|',
      '"',
      "'",
    ]
    for (const char of specialChars) {
      assert.doesNotThrow(() => {
        const results = searchDocuments(char, mockDocuments)
        assert.ok(Array.isArray(results))
      }, `Search crashed on special character: ${char}`)
    }
  })

  it('safely handles special characters embedded in query words', () => {
    const problematicQueries = [
      '(arduino)',
      '[crypto]',
      'esp32*',
      'c++?',
      'test\\query',
      'hkdf+sha256',
      'psk.key',
      '(esp32',
      '[unclosed',
      '***',
      '+++',
      '???',
      '\\\\\\',
    ]

    for (const query of problematicQueries) {
      assert.doesNotThrow(() => {
        const results = searchDocuments(query, mockDocuments)
        assert.ok(Array.isArray(results))
      }, `Search crashed on query: ${query}`)
    }
  })

  it('finds normal words and ranks title/exact matches highest', () => {
    const results = searchDocuments('installation', mockDocuments)
    assert.ok(results.length > 0)
    assert.equal(results[0].title, 'Installation & Setup')
    assert.equal(results[0].href, '/docs/getting-started/installation')
  })

  it('finds multi-word queries with proper relevance', () => {
    const results = searchDocuments('handshake mechanics', mockDocuments)
    assert.ok(results.length > 0)
    assert.equal(results[0].title, 'Handshake Mechanics')
  })

  it('matches content and highlights search terms without regex failure', () => {
    const results = searchDocuments('chacha20 poly1305', mockDocuments)
    assert.ok(results.length > 0)
    assert.equal(results[0].title, 'Cryptographic Details')
    // Snippet is pure clean text (avoiding double-highlighting)
    assert.ok(results[0].snippet?.toLowerCase().includes('chacha20'))
    assert.ok(!results[0].snippet?.includes('<span'))
    // Direct highlight function wraps matches safely
    const highlighted = highlight(results[0].snippet!, 'chacha20 poly1305')
    assert.ok(highlighted.includes("<span class='highlight'>"))
  })

  it('correctly calculates relevance without throwing for edge cases', () => {
    assert.doesNotThrow(() => {
      const score = calculateRelevance(
        '(***)',
        'Test Title',
        'Some test content with (***) and special symbols',
        ['Heading (1)'],
        ['keyword*']
      )
      assert.ok(typeof score === 'number' && !Number.isNaN(score))
    })
  })

  it('highlights snippet with special characters safely', () => {
    const text = 'Support for C++ and ESP32 (Arduino) devices.'
    assert.doesNotThrow(() => {
      const highlighted = highlight(text, '(Arduino) C++')
      assert.ok(highlighted.includes("<span class='highlight'>"))
    })
  })
})
