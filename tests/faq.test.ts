import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { FAQS } from '../components/landing/faq-data'

describe('FAQ Single Source of Truth - P2 Regression Tests', () => {
  it('contains exactly 5 canonical FAQ items', () => {
    assert.strictEqual(FAQS.length, 5)
  })

  it('each FAQ item has valid question and answer text', () => {
    for (const item of FAQS) {
      assert.strictEqual(typeof item.question, 'string')
      assert.ok(item.question.trim().length > 10, 'Question should be meaningful')
      assert.strictEqual(typeof item.answer, 'string')
      assert.ok(item.answer.trim().length > 20, 'Answer should be meaningful')
    }
  })

  it('contains the essential security and protocol questions', () => {
    const questions = FAQS.map((f) => f.question)
    assert.ok(questions.includes('Why not just use TLS / DTLS?'))
    assert.ok(questions.includes('Is it secure without asymmetric certificates?'))
    assert.ok(questions.includes('How should I provision the PSK in production?'))
    assert.ok(questions.includes('What is the battery/power consumption impact?'))
    assert.ok(questions.includes('Does it support packet fragmentation?'))
  })

  it('maps cleanly into valid schema.org FAQPage structured data entities', () => {
    const mainEntity = FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    }))

    assert.strictEqual(mainEntity.length, 5)
    assert.strictEqual(mainEntity[0]['@type'], 'Question')
    assert.strictEqual(mainEntity[0].acceptedAnswer['@type'], 'Answer')
    assert.strictEqual(mainEntity[0].name, 'Why not just use TLS / DTLS?')
    assert.ok(mainEntity[0].acceptedAnswer.text.includes('112 bytes of persistent RAM'))
  })
})
