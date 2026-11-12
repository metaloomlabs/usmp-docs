import assert from 'node:assert/strict'
import test, { describe, it } from 'node:test'

import nextConfig from '../next.config.mjs'

describe('P3 Batch 3 Phase 2: HTTP Security Headers Regression Tests', () => {
  it('defines a headers function in next.config.mjs', () => {
    assert.equal(typeof nextConfig.headers, 'function')
  })

  it('configures global security headers matching /:path*', async () => {
    const rules = await nextConfig.headers()
    assert.ok(Array.isArray(rules), 'Expected headers to return an array of route rules')

    const globalRule = rules.find((rule: { source: string }) => rule.source === '/:path*')
    assert.ok(globalRule, 'Global route rule /:path* must be defined')
    assert.ok(Array.isArray(globalRule.headers), 'Headers list must be an array')

    const headersMap = new Map<string, string>(
      globalRule.headers.map((h: { key: string; value: unknown }) => [h.key, String(h.value)])
    )

    // 1. X-Content-Type-Options
    assert.equal(
      headersMap.get('X-Content-Type-Options'),
      'nosniff',
      'X-Content-Type-Options must be set to nosniff'
    )

    // 2. X-Frame-Options
    assert.equal(headersMap.get('X-Frame-Options'), 'DENY', 'X-Frame-Options must be set to DENY')

    // 3. Referrer-Policy
    assert.equal(
      headersMap.get('Referrer-Policy'),
      'strict-origin-when-cross-origin',
      'Referrer-Policy must be strict-origin-when-cross-origin'
    )

    // 4. Permissions-Policy
    const permissionsPolicy = headersMap.get('Permissions-Policy')
    assert.ok(permissionsPolicy, 'Permissions-Policy must be set')
    assert.ok(permissionsPolicy.includes('camera=()'), 'Camera must be restricted')
    assert.ok(permissionsPolicy.includes('microphone=()'), 'Microphone must be restricted')
    assert.ok(permissionsPolicy.includes('geolocation=()'), 'Geolocation must be restricted')
    assert.ok(
      permissionsPolicy.includes('browsing-topics=()'),
      'Browsing topics must be restricted'
    )

    // 5. Strict-Transport-Security (HSTS): left to Vercel platform, not duplicated in next.config.mjs
    assert.equal(
      headersMap.get('Strict-Transport-Security'),
      undefined,
      'Strict-Transport-Security should not be duplicated at app level when supplied by Vercel'
    )

    // 6. Content-Security-Policy-Report-Only (Must not be enforcing in this phase)
    assert.equal(
      headersMap.get('Content-Security-Policy'),
      undefined,
      'Content-Security-Policy must NOT be enforced in Phase 2'
    )

    const csp = headersMap.get('Content-Security-Policy-Report-Only')
    assert.ok(csp, 'Content-Security-Policy-Report-Only must be configured')
    assert.ok(csp.includes("default-src 'self'"), 'CSP must define default-src')
    assert.ok(csp.includes("script-src 'self' 'unsafe-inline'"), 'CSP must allow Next.js scripts')
    assert.ok(csp.includes("style-src 'self' 'unsafe-inline'"), 'CSP must allow Next.js styles')
    assert.ok(csp.includes("img-src 'self' data: blob:"), 'CSP must allow local & Mermaid images')
    assert.ok(csp.includes("font-src 'self' data:"), 'CSP must allow KaTeX & local fonts')
    assert.ok(csp.includes("connect-src 'self'"), 'CSP must allow client search index connect')
    assert.ok(csp.includes("frame-ancestors 'none'"), 'CSP must prevent framing')
    assert.ok(csp.includes("base-uri 'self'"), 'CSP must restrict base-uri')
    assert.ok(csp.includes("form-action 'self'"), 'CSP must restrict form-action')
    assert.ok(csp.includes("object-src 'none'"), 'CSP must disable plugins and objects')

    // Strictly ensure unsafe-eval is NOT allowed
    assert.equal(
      csp.includes("'unsafe-eval'"),
      false,
      'CSP must not allow unsafe-eval in static production documentation'
    )
  })
})
