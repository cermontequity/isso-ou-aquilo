// Helpers compartilhados entre o painel e a página de votação

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body && JSON.stringify(body),
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.details?.[0]?.message || data.error), { status: res.status });
  return data;
}

function timeLeft(expiresAt) {
  const s = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function resultHtml(poll) {
  const { result: r } = poll;
  const bar = (key, color) => `
    <div class="bar">
      <div class="label"><span>${esc(poll['option' + key])}</span><strong>${r[key].percent}%</strong></div>
      <div class="track"><div class="fill" style="width:${r[key].percent}%;background:var(${color})"></div></div>
    </div>`;
  const winner = r.total === 0 ? 'Ninguém votou' : r.winner === 'TIE' ? 'Empate!' : `Venceu: ${esc(poll['option' + r.winner])}`;
  return `${bar('A', '--a')}${bar('B', '--b')}<p class="winner">${winner} <span class="muted">· ${r.total} voto(s)</span></p>`;
}
