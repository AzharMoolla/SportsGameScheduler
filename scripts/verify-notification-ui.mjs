import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import vm from 'node:vm'

const handlers = new Map()
const shown = []
const navigated = []
const opened = []
let focused = false
const client = { url: 'https://silbosports.com/my-schedule', navigate: async url => { navigated.push(url); return client }, focus: async () => { focused = true; return client } }
const context = vm.createContext({
  URL,
  self: { location: new URL('https://silbosports.com'), addEventListener: (name, fn) => handlers.set(name, fn), registration: { showNotification: async (title, options) => shown.push({ title, options }) } },
  clients: { matchAll: async () => [client], openWindow: async url => opened.push(url) },
})
vm.runInContext(await fs.readFile('public/sw.js', 'utf8'), context)
let pending
handlers.get('push')({ data: { json: () => ({ title: 'Event alert', body: '7:00 PM EDT', url: 'https://evil.example/events/1', tag: 'event-1' }) }, waitUntil: promise => { pending = promise } })
await pending
assert.equal(shown[0].options.data.url, 'https://silbosports.com/settings/alerts')
assert.equal(shown[0].options.badge, '/assets/brand/notification-badge.png')
handlers.get('notificationclick')({ notification: { data: { url: '/events/example-event' }, close: () => {} }, waitUntil: promise => { pending = promise } })
await pending
assert.equal(navigated[0], 'https://silbosports.com/events/example-event')
assert.equal(focused, true)
assert.equal(opened.length, 0)
console.log('Push display and safe event navigation passed; no push notification sent.')
