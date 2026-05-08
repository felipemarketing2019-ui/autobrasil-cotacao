// Cloudflare Pages Function — lê geolocalização dos headers do Cloudflare
// Disponível em GET /geo — chamado silenciosamente pelo script.js
export async function onRequest({ request }) {
  const cf = request.cf || {};
  const ip = request.headers.get('CF-Connecting-IP') || '';

  const data = {
    ip,
    cidade:  cf.city         || '',
    estado:  cf.region       || '',
    pais:    cf.country      || '',
    cep:     cf.postalCode   || '',
    lat:     cf.latitude     || '',
    lon:     cf.longitude    || '',
    fuso:    cf.timezone     || '',
  };

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
