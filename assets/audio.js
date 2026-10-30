/* FRACTURED HORIZON — Shared audio controls for Prelude and Character Form.
 * Place your own music at assets/audio/bgm.mp3 and assets/audio/form.mp3.
 * Both pages use this file. The Prelude has a Sound Gate; the form does not.
 */
(() => {
  'use strict';

  const audio = document.getElementById('backgroundAudio');
  const toggle = document.getElementById('audioToggle');
  const volume = document.getElementById('audioVolume');
  if (!audio) return;

  // Audio controls are initialized on BOTH pages, regardless of Sound Gate.
  audio.loop = true;
  if (volume) {
    const startingVolume = Number(volume.value);
    audio.volume = Number.isFinite(startingVolume)
      ? Math.max(0, Math.min(1, startingVolume / 100)) : 0.4;
    volume.addEventListener('input', () => {
      audio.volume = Math.max(0, Math.min(1, Number(volume.value) / 100));
    });
    volume.addEventListener('change', () => {
      audio.volume = Math.max(0, Math.min(1, Number(volume.value) / 100));
    });
  }

  function syncButton() {
    if (!toggle) return;
    const playing = !audio.paused;
    toggle.textContent = playing ? '♫ หยุดเพลง' : '♫ เปิดเพลง';
    toggle.setAttribute('aria-pressed', String(playing));
  }

  async function playMusic() {
    try {
      await audio.play();
      syncButton();
      return true;
    } catch (error) {
      syncButton();
      return false; // Empty MP3 or blocked autoplay: show fallback in Gate.
    }
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      if (!audio.paused) {
        audio.pause();
        syncButton();
      } else {
        void playMusic();
      }
    });
  }
  audio.addEventListener('play', syncButton);
  audio.addEventListener('pause', syncButton);
  syncButton();

  // The Sound Gate exists only on index.html.
  const gate = document.getElementById('soundGate');
  const enter = document.getElementById('soundGateEnter');
  const skip = document.getElementById('soundGateSkip');
  const status = document.getElementById('soundGateStatus');
  const app = document.getElementById('app');
  if (!gate || !enter || !skip || !app) return;

  let revealed = false;
  function revealWebsite() {
    if (revealed) return;
    revealed = true;
    gate.classList.add('sound-gate-exit');
    gate.setAttribute('aria-hidden', 'true');
    app.removeAttribute('inert');
    const firstAction = document.querySelector('#content [data-go]');
    if (firstAction) firstAction.focus({ preventScroll: true });
    window.setTimeout(() => gate.remove(), 650);
  }

  enter.addEventListener('click', () => {
    enter.disabled = true;
    if (status) status.textContent = 'กำลังเริ่มเสียงประกอบ...';
    // Calling play() synchronously in the click event enables sound on browsers
    // that allow audio after a direct user gesture.
    const result = audio.play();
    Promise.resolve(result).then(() => {
      syncButton();
      revealWebsite();
    }).catch(() => {
      if (status) status.textContent = 'ยังเล่นเพลงไม่ได้ กรุณาใส่ไฟล์ MP3 ที่ assets/audio/bgm.mp3 หรือเข้าสู่เว็บไซต์โดยไม่มีเสียง';
      enter.disabled = false;
      enter.textContent = '♫ ลองเปิดเสียงอีกครั้ง';
      skip.hidden = false;
    });
  });

  skip.addEventListener('click', revealWebsite);
})();
