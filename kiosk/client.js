(() => {
  let sending = false;
  async function heartbeat() {
    if (sending) return;
    sending = true;
    try {
      const title = document.querySelector('#title')?.textContent?.trim();
      const progress = document.querySelector('#slideProgress')?.textContent;
      if (!title || !progress) return;
      const response = await fetch('/__kiosk/heartbeat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ progress }), cache: 'no-store' });
      const state = await response.json();
      if (state.version && state.version !== window.__kioskVersion) location.reload();
      const pause = document.querySelector('#pauseToggle');
      if (pause?.getAttribute('aria-label') === 'Diashow fortsetzen') pause.click();
    } catch {} finally { sending = false; }
  }
  heartbeat(); setInterval(heartbeat, 10000);
})();
