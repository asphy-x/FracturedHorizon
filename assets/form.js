// FRACTURED HORIZON — Vestige Concept Form
// แก้ URL ตัวกลางที่ assets/discord-config.js (อย่าใส่ Discord webhook ในเว็บสาธารณะ)
const form = document.getElementById('sheet');
const status = document.getElementById('status');
const consent = document.getElementById('discordConsent');
const key = 'veyra-vestige-concept-v1';
const labels = {
  player: 'ชื่อผู้เล่น', name: 'ชื่อตัวละครปัจจุบัน', pronoun: 'สรรพนาม',
  look: 'รูปลักษณ์', personality: 'นิสัย', combat: 'แนวทางต่อสู้',
  abilities: 'สกิล/พลังเริ่มต้น', fragment: 'เศษความทรงจำ',
  goal: 'เป้าหมายหลังตื่นขึ้น', boundaries: 'ขอบเขตเนื้อเรื่อง (ส่วนตัวสำหรับ GM)'
};

function data() {
  // ไม่ใส่ checkbox ใน Character Sheet
  return Object.fromEntries(new FormData(form).entries());
}

try {
  const saved = JSON.parse(localStorage.getItem(key) || '{}');
  Object.entries(saved).forEach(([field, value]) => {
    if (form.elements[field]) form.elements[field].value = value;
  });
} catch (_) { /* ไม่มีข้อมูลที่บันทึกไว้ */ }

form.addEventListener('input', () => {
  try { localStorage.setItem(key, JSON.stringify(data())); }
  catch (_) { status.textContent = 'ไม่สามารถบันทึกอัตโนมัติได้ กรุณาดาวน์โหลดไฟล์แทน'; }
});
form.addEventListener('reset', () => {
  localStorage.removeItem(key);
  consent.checked = false;
  status.textContent = 'ล้างข้อมูลแล้ว';
});

async function sendToGM(action) {
  if (!consent.checked) {
    status.textContent = 'บันทึกบนเครื่องสำเร็จ — ไม่ส่ง Discord เพราะยังไม่ได้ให้ความยินยอม';
    return;
  }
  const endpoint = window.VEYRA_DISCORD_ENDPOINT || '';
  if (!endpoint || endpoint.includes('YOUR-WORKER')) {
    status.textContent = 'บันทึกบนเครื่องสำเร็จ — GM ยังไม่ได้ตั้งค่า Discord Endpoint';
    return;
  }
  // หลีกเลี่ยงการส่ง boundaries ที่อาจเป็นข้อมูลอ่อนไหวไป Discord
  const { boundaries, ...shareable } = data();
  status.textContent = 'กำลังส่ง Concept Sheet ให้ GM ทาง Discord...';
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...shareable, sourceAction: action }),
      mode: 'cors'
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    status.textContent = 'บันทึกสำเร็จ และส่ง Concept Sheet ให้ GM ทาง Discord แล้ว ✓';
  } catch (error) {
    status.textContent = 'บันทึกบนเครื่องสำเร็จ แต่ส่ง Discord ไม่สำเร็จ — โปรดแจ้ง GM หรือส่งไฟล์ JSON ให้แทน';
    console.warn('Discord submission error:', error);
  }
}

function downloadJSON() {
  const payload = { project: 'FRACTURED HORIZON', type: 'Vestige Character Concept', version: '1.1', ...data() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'Vestige_' + (payload.name || 'Concept').replace(/[^\p{L}\p{N}_-]/gu, '_') + '.json';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.getElementById('save').addEventListener('click', () => {
  downloadJSON();
  void sendToGM('download-json');
});

document.getElementById('copy').addEventListener('click', async () => {
  const value = 'FRACTURED HORIZON — VESTIGE CONCEPT\n\n' +
    Object.entries(data()).map(([field, text]) => `${labels[field] || field}:\n${text || 'ไม่ระบุ'}`).join('\n\n');
  try {
    await navigator.clipboard.writeText(value);
  } catch (_) {
    const box = document.createElement('textarea');
    box.value = value;
    document.body.append(box);
    box.select();
    document.execCommand('copy');
    box.remove();
  }
  status.textContent = 'คัดลอกข้อมูลแล้ว';
  void sendToGM('copy-text');
});

document.getElementById('print').addEventListener('click', () => {
  window.print();
  void sendToGM('print-pdf');
});
