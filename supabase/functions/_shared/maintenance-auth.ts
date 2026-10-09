// Maintenance jobs require the server-only service-role credential, not an anon JWT.
export async function authorizeMaintenance(request: Request, serviceKey: string | undefined): Promise<Response | null> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'method_not_allowed' }, { status: 405, headers: { Allow: 'POST' } });
  }
  const authorization = request.headers.get('authorization') ?? '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!serviceKey || !token) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const encoder = new TextEncoder();
  const [actual, expected] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(token)),
    crypto.subtle.digest('SHA-256', encoder.encode(serviceKey)),
  ]);
  const a = new Uint8Array(actual);
  const b = new Uint8Array(expected);
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0 ? null : Response.json({ error: 'unauthorized' }, { status: 401 });
}
