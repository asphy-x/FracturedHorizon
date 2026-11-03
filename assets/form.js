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
  catch (_) { status.textContent = 'ไม่สามารถบันทึกอัตโนมัติได้ กรุณาใช้ปุ่มบันทึก PDF'; }
});
form.addEventListener('reset', () => {
  localStorage.removeItem(key);
  consent.checked = false;
  status.textContent = 'ล้างข้อมูลแล้ว';
});

// ส่งเฉพาะช่องข้อมูลทั่วไปเท่านั้น ไม่ส่งขอบเขตส่วนตัว
async function sendToGM() {
  if (!consent.checked) {
    return { sent: false, message: 'ไม่ได้ส่ง Discord เนื่องจากยังไม่ติ๊กยินยอม (PDF ยังบันทึกได้ตามปกติ)' };
  }
  const endpoint = window.VEYRA_DISCORD_ENDPOINT || '';
  if (!endpoint || endpoint.includes('YOUR-WORKER')) {
    return { sent: false, message: 'ยังไม่ได้ตั้งค่า Worker URL — โปรดแจ้ง GM' };
  }
  const { boundaries, ...shareable } = data();
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...shareable, sourceAction: 'save-pdf' }),
      mode: 'cors'
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return { sent: true, message: 'ส่ง Concept Sheet เข้า Discord สำเร็จ ✓' };
  } catch (error) {
    console.warn('Discord submission error:', error);
    return { sent: false, message: 'ส่ง Discord ไม่สำเร็จ โปรดลองอีกครั้งหรือติดต่อ GM (PDF ยังคงบันทึกได้)' };
  }
}

// ใช้ CSS @media print และหน้าต่างพิมพ์ของเบราว์เซอร์ รองรับภาษาไทย
// หมายเหตุ: เบราว์เซอร์ไม่อนุญาตให้เว็บบังคับเซฟไฟล์โดยข้าม Print Dialog
const printable = document.getElementById('pdfSheet');
function textNode(tag, value, className = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = value;
  return el;
}
function buildPrintSheet() {
  printable.replaceChildren();
  printable.append(textNode('div', 'FRACTURED HORIZON / VEYRA', 'pdf-kicker'));
  printable.append(textNode('h1', 'VESTIGE — CHARACTER CONCEPT'));
  printable.append(textNode('p', 'แนวคิดตัวละครก่อนเริ่มแคมเปญ • ข้อมูลที่กรอกโดยผู้เล่น', 'pdf-subtitle'));
  const values = data();
  Object.entries(labels).forEach(([field, label]) => {
    const section = document.createElement('section');
    section.className = 'pdf-field';
    section.append(textNode('h2', label));
    section.append(textNode('p', values[field] || '—'));
    printable.append(section);
  });
  printable.append(textNode('p', 'FRACTURED HORIZON • A TALE OF VEYRA', 'pdf-footer'));
}

const saveButton = document.getElementById('savePdfSend');
let submitting = false;
saveButton.addEventListener('click', () => {
  if (submitting) return;
  buildPrintSheet();
  // เปิด Print Dialog ทันทีจากการคลิก เพื่อให้เบราว์เซอร์ไม่บล็อก
  // ผู้เล่นเลือกปลายทาง Save as PDF และกด Save เอง
  status.textContent = 'เลือก Save as PDF / บันทึกเป็น PDF ในหน้าต่างที่เปิดขึ้น';
  window.print();
  if (consent.checked) {
    submitting = true;
    saveButton.disabled = true;
    status.textContent = 'กำลังส่งข้อมูลให้ GM ทาง Discord...';
    void sendToGM().then(result => { status.textContent = result.message; })
      .finally(() => { submitting = false; saveButton.disabled = false; });
  } else {
    status.textContent = 'เปิดหน้าบันทึก PDF แล้ว — ไม่ได้ส่ง Discord เพราะยังไม่ติ๊กยินยอม';
  }
});
