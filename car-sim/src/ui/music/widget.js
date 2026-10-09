// Small self-contained "now playing" widget for the game UI (dark theme).

const CSS = `
.cmw{--cmw-bg:rgba(12,14,20,.82);--cmw-fg:#e9edf5;--cmw-dim:#8b93a7;--cmw-acc:#ff3d6e;--cmw-acc2:#28e0ff;
  font:12px/1.3 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--cmw-fg);background:var(--cmw-bg);
  border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:8px 10px;display:flex;flex-direction:column;gap:6px;
  min-width:220px;max-width:320px;box-sizing:border-box;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
  box-shadow:0 4px 18px rgba(0,0,0,.35);user-select:none}
.cmw *{box-sizing:border-box}
.cmw-top{display:flex;align-items:center;gap:8px;min-width:0}
.cmw-eq{display:flex;align-items:flex-end;gap:2px;height:16px;width:18px;flex:none}
.cmw-eq i{display:block;width:4px;height:4px;background:linear-gradient(var(--cmw-acc),var(--cmw-acc2));border-radius:1px}
.cmw.on .cmw-eq i{animation:cmw-b .8s ease-in-out infinite alternate}
.cmw.on .cmw-eq i:nth-child(2){animation-delay:-.3s}.cmw.on .cmw-eq i:nth-child(3){animation-delay:-.55s}
@keyframes cmw-b{0%{height:3px}100%{height:16px}}
.cmw-txt{min-width:0;flex:1}
.cmw-title{font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.2px}
.cmw-sub{color:var(--cmw-dim);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-transform:uppercase;letter-spacing:.6px}
.cmw-row{display:flex;align-items:center;gap:6px}
.cmw button,.cmw select{font:inherit;color:var(--cmw-fg);background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
  border-radius:6px;height:26px;padding:0 8px;cursor:pointer}
.cmw button:hover,.cmw select:hover{background:rgba(255,255,255,.14)}
.cmw button:focus-visible,.cmw select:focus-visible,.cmw input:focus-visible{outline:2px solid var(--cmw-acc2);outline-offset:1px}
.cmw button.cmw-play{width:30px;padding:0;color:var(--cmw-acc);font-size:13px}
.cmw select{flex:1;min-width:0}
.cmw select option{background:#151821;color:var(--cmw-fg)}
.cmw input[type=range]{flex:1;min-width:0;accent-color:var(--cmw-acc);height:18px}
.cmw-vol{color:var(--cmw-dim);font-size:11px;width:24px;text-align:right}
.cmw-file{display:none}
`;

const STYLE_OPTS = [
  ['auto', 'Auto mix'], ['acidBreaks', 'Acid Breaks'], ['hardcore', 'Hardcore / Gabber'], ['dnb', 'Drum & Bass'], ['breaks', 'Big Beat / Breaks'], ['garage', '2-Step Garage'], ['acid', 'Acid Techno'],
];

function injectCss() {
  if (typeof document === 'undefined' || document.getElementById('cmw-css')) return;
  const s = document.createElement('style');
  s.id = 'cmw-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Mount the music widget.
 * @param {HTMLElement} container
 * @param {ReturnType<import('./index.js').createMusicPlayer>} player
 * @returns {{ el: HTMLElement, update: () => void, destroy: () => void }}
 */
export function mountMusicWidget(container, player) {
  injectCss();
  const el = document.createElement('div');
  el.className = 'cmw';
  el.innerHTML = `
    <div class="cmw-top">
      <div class="cmw-eq" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="cmw-txt"><div class="cmw-title">Music off</div><div class="cmw-sub">tap play</div></div>
      <button class="cmw-play" title="Play / stop music" aria-label="Play music">&#9654;</button>
      <button class="cmw-next" title="Next track" aria-label="Next track">&#9197;</button>
    </div>
    <div class="cmw-row">
      <select class="cmw-style" aria-label="Music style">${STYLE_OPTS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select>
      <button class="cmw-mine" title="Play your own MP3/OGG files">My music</button>
      <input class="cmw-file" type="file" accept="audio/*,.mp3,.ogg,.m4a,.wav,.flac,.opus" multiple>
    </div>
    <div class="cmw-row">
      <span aria-hidden="true">&#128266;</span>
      <input class="cmw-volr" type="range" min="0" max="100" step="1" aria-label="Music volume">
      <span class="cmw-vol"></span>
    </div>`;
  container.appendChild(el);
  const $ = (s) => el.querySelector(s);
  const title = $('.cmw-title');
  const sub = $('.cmw-sub');
  const play = $('.cmw-play');
  const style = $('.cmw-style');
  const mine = $('.cmw-mine');
  const file = $('.cmw-file');
  const vol = $('.cmw-volr');
  const volTxt = $('.cmw-vol');
  style.value = player.style || 'auto';
  vol.value = String(Math.round((player.volume ?? 0.8) * 100));
  volTxt.textContent = vol.value;
  let userMode = false;

  function update() {
    const np = player.nowPlaying;
    const on = player.playing;
    el.classList.toggle('on', on);
    play.innerHTML = on ? '&#9632;' : '&#9654;';
    play.setAttribute('aria-label', on ? 'Stop music' : 'Play music');
    if (!on || !np) {
      title.textContent = on ? '…' : 'Music off';
      sub.textContent = on ? '' : 'tap play';
    } else {
      title.textContent = np.title;
      title.title = np.title;
      sub.textContent = np.user ? 'your music · shuffle' : `${np.styleLabel || np.style} · ${np.bpm} bpm${np.key ? ' · ' + np.key : ''}`;
    }
    mine.textContent = userMode ? 'Generated' : 'My music';
    style.disabled = userMode;
  }

  play.addEventListener('click', () => {
    if (player.playing) player.stop();
    else player.start();
    update();
  });
  $('.cmw-next').addEventListener('click', () => { if (!player.playing) player.start(); else player.next(); update(); });
  style.addEventListener('change', () => { player.setStyle(style.value); update(); });
  vol.addEventListener('input', () => { player.setVolume(vol.value / 100); volTxt.textContent = vol.value; });
  mine.addEventListener('click', () => {
    if (userMode) {
      userMode = false;
      player.useGenerated();
      update();
    } else file.click();
  });
  file.addEventListener('change', async () => {
    if (!file.files || !file.files.length) return;
    const files = Array.from(file.files);
    if (!player.playing) await player.start();
    const n = await player.loadUserTracks(files);
    userMode = n > 0;
    file.value = '';
    update();
  });
  const off = player.onTrackChange(() => update());
  update();
  return {
    el,
    update,
    destroy() { off(); el.remove(); },
  };
}
