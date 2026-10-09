import { describe, expect, it } from 'vitest'
import { authorizeMaintenance } from '../../../supabase/functions/_shared/maintenance-auth.ts'

function request(token?: string, method = 'POST') {
  return new Request('https://example.test/job', { method, headers: token ? { Authorization: `Bearer ${token}` } : {} })
}

describe('maintenance authorization', () => {
  it('rejects missing credentials and missing server configuration', async () => {
    expect((await authorizeMaintenance(request(), 'server-only'))?.status).toBe(401)
    expect((await authorizeMaintenance(request('server-only'), undefined))?.status).toBe(401)
  })
  it('rejects public keys and user credentials', async () => {
    expect((await authorizeMaintenance(request('public-anon-key'), 'server-only'))?.status).toBe(401)
    expect((await authorizeMaintenance(request('user-jwt'), 'server-only'))?.status).toBe(401)
  })
  it('accepts only the configured server credential', async () => {
    expect(await authorizeMaintenance(request('server-only'), 'server-only')).toBeNull()
    expect((await authorizeMaintenance(request('server-only-extra'), 'server-only'))?.status).toBe(401)
  })
  it('rejects accidental reads even with valid credentials', async () => {
    expect((await authorizeMaintenance(request('server-only', 'GET'), 'server-only'))?.status).toBe(405)
  })
})
