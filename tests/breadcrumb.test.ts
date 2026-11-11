import assert from 'node:assert/strict'
import test, { describe, it } from 'node:test'

import { isRouteRoutable } from '../lib/pageroutes'

describe('isRouteRoutable - P0 Breadcrumb Navigation Regression Tests', () => {
  it('correctly marks category roots with noLink: true as non-routable', () => {
    assert.equal(isRouteRoutable('/getting-started'), false)
    assert.equal(isRouteRoutable('/ports'), false)
    assert.equal(isRouteRoutable('/sdk'), false)
    assert.equal(isRouteRoutable('/protocol'), false)
    assert.equal(isRouteRoutable('/security'), false)
    assert.equal(isRouteRoutable('/tools'), false)
    assert.equal(isRouteRoutable('/troubleshooting'), false)
    assert.equal(isRouteRoutable('/examples'), false)
  })

  it('correctly marks actual documentation pages as routable', () => {
    assert.equal(isRouteRoutable('/getting-started/what-is-usmp'), true)
    assert.equal(isRouteRoutable('/getting-started/installation'), true)
    assert.equal(isRouteRoutable('/getting-started/tutorial-tcp'), true)
    assert.equal(isRouteRoutable('/getting-started/tutorial-udp'), true)
    assert.equal(isRouteRoutable('/getting-started/production-hardening'), true)
    assert.equal(isRouteRoutable('/protocol/overview'), true)
    assert.equal(isRouteRoutable('/protocol/frame-format'), true)
    assert.equal(isRouteRoutable('/protocol/handshake'), true)
    assert.equal(isRouteRoutable('/protocol/encryption'), true)
    assert.equal(isRouteRoutable('/ports/esp32'), true)
    assert.equal(isRouteRoutable('/ports/arduino'), true)
    assert.equal(isRouteRoutable('/sdk/python'), true)
    assert.equal(isRouteRoutable('/sdk/server'), true)
    assert.equal(isRouteRoutable('/spec'), true)
  })

  it('marks unknown or non-existent routes as non-routable', () => {
    assert.equal(isRouteRoutable('/nonexistent'), false)
    assert.equal(isRouteRoutable('/getting-started/fake-doc'), false)
    assert.equal(isRouteRoutable(''), false)
  })

  it('normalizes paths without leading slash gracefully', () => {
    assert.equal(isRouteRoutable('getting-started'), false)
    assert.equal(isRouteRoutable('getting-started/installation'), true)
  })
})
