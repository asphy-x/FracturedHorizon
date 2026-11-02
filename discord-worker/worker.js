// Cloudflare Worker: proxy to Discord Webhook. NEVER publish the webhook secret.
// Cloudflare dashboard -> Worker -> Settings -> Variables and Secrets:
//   DISCORD_WEBHOOK_URL (Secret), ALLOWED_ORIGIN (Text, e.g. https://username.github.io)
const allowedFields = {
  player: 'ชื่อผู้เล่น', name: 'ชื่อตัวละคร', pronoun: 'สรรพนาม',
  look: 'รูปลักษณ์', personality: 'บุคลิก', combat: 'แนวทางต่อสู้',
  abilities: 'สกิลเริ่มต้น', fragment: 'เศษความทรงจำ', goal: 'เป้าหมาย'
};
const jsonHeaders = origin => ({
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Vary': 'Origin'
});
export default {
  async fetch(request, env) {
    const allowed = (env.ALLOWED_ORIGIN || '').replace(/\/$/, '');
    const origin = request.headers.get('Origin') || '';
    if (!allowed || origin !== allowed) return new Response('Forbidden origin', { status: 403 });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: jsonHeaders(origin) });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: jsonHeaders(origin) });
    if (!env.DISCORD_WEBHOOK_URL) return new Response('Webhook not configured', { status: 503, headers: jsonHeaders(origin) });
    if (!(request.headers.get('Content-Type') || '').startsWith('application/json'))
      return new Response('JSON required', { status: 415, headers: jsonHeaders(origin) });
    if (Number(request.headers.get('Content-Length') || 0) > 12_000)
      return new Response('Too large', { status: 413, headers: jsonHeaders(origin) });
    let info;
    try {
      const raw = await request.text();
      if (raw.length > 12_000) return new Response('Too large', { status: 413, headers: jsonHeaders(origin) });
      info = JSON.parse(raw);
      if (!info || typeof info !== 'object' || Array.isArray(info)) throw new Error('Invalid');
    } catch (_) { return new Response('Invalid JSON', { status: 400, headers: jsonHeaders(origin) }); }
    const fields = Object.entries(allowedFields).map(([k, label]) => ({
      name: label,
      value: String(typeof info[k] === 'string' ? info[k] : 'ไม่ระบุ').slice(0, 500) || 'ไม่ระบุ',
      inline: ['player', 'name', 'pronoun'].includes(k)
    }));
    const message = {
      username: 'VEYRA — Vestige Registry',
      allowed_mentions: { parse: [] },
      embeds: [{
        title: 'FRACTURED HORIZON — New Concept Sheet',
        description: 'แบบฟอร์มผู้เล่น (ไม่รวมข้อมูลขอบเขตเนื้อเรื่องส่วนตัว)',
        color: 7240831,
        fields,
        footer: { text: 'Source: ' + String(info.sourceAction || 'save').slice(0, 30) },
        timestamp: new Date().toISOString()
      }]
    };
    const response = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    return new Response(JSON.stringify({ ok: response.ok }), {
      status: response.ok ? 200 : 502, headers: jsonHeaders(origin)
    });
  }
};
