/* VEYRA / AUTHORIZATION SEQUENCE
 * แอนิเมชันตกแต่งก่อนหน้า Character Form เท่านั้น ไม่ใช่ระบบล็อกอิน
 * คลิก "เข้าสู่แบบฟอร์ม" ช่วยเริ่มเพลงบนเบราว์เซอร์ที่บล็อก autoplay
 */
(() => {
  const gate = document.getElementById('authGate');
  const headline = document.getElementById('authHeadline');
  const message = document.getElementById('authMessage');
  const enter = document.getElementById('authContinue');
  const skip = document.getElementById('authSkip');
  const audio = document.getElementById('backgroundAudio');
  if (!gate) return;
  let closed = false;

  function beginMusic() {
    if (!audio || !audio.paused) return;
    audio.play().catch(() => { /* autoplay blocked or file not yet supplied */ });
  }
  function openForm() {
    if (closed) return;
    closed = true;
    beginMusic();
    gate.classList.add('auth-dismissed');
    gate.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => { gate.hidden = true; }, 620);
  }
  window.setTimeout(() => {
    if (closed) return;
    headline.textContent = 'AUTHORIZATION COMPLETE';
    message.textContent = 'ยืนยันการเข้าถึงสำเร็จ // ยินดีต้อนรับ Vestige';
    gate.classList.add('auth-complete');
  }, 2300);
  enter.addEventListener('click', openForm);
  skip.addEventListener('click', openForm);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !closed) openForm();
  });
})();
