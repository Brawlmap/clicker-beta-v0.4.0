// ── Multiplier Minigame ───────────────────────────────────────────────────────
// Each click adds +0.0000000001x to a multiplier that boosts clickPower.
// Upgrades cost multiplier currency. Persists through rebirths.
// Extra upgrades unlock based on rebirthCount.

let clickMultiplier = 1.0;          // the actual multiplier applied to clickPower
let multCurrency    = 0.0;          // accumulated multiplier "spent" as currency (= clickMultiplier - 1)

// How much each click adds to the multiplier
const MULT_PER_CLICK = 0.0000000001;

// ── Base upgrades (always available) ─────────────────────────────────────────
const multUpgrades = [
  {
    id: 'mu1',
    name: 'click boost i',
    desc: 'each click gives 2x more multiplier',
    cost: 0.000000001,
    level: 0,
    maxLevel: 1,
    effect: 'clickRate',
    value: 2,
    rebirthRequired: 0,
  },
  {
    id: 'mu2',
    name: 'click boost ii',
    desc: 'each click gives 5x more multiplier',
    cost: 0.00000005,
    level: 0,
    maxLevel: 1,
    effect: 'clickRate',
    value: 5,
    rebirthRequired: 0,
  },
  {
    id: 'mu3',
    name: 'click boost iii',
    desc: 'each click gives 10x more multiplier',
    cost: 0.0000001,
    level: 0,
    maxLevel: 1,
    effect: 'clickRate',
    value: 10,
    rebirthRequired: 0,
  },
  {
    id: 'mu4',
    name: 'multiplier amp',
    desc: 'multiplier itself is 3x stronger',
    cost: 0.000008,
    level: 0,
    maxLevel: 1,
    effect: 'multStrength',
    value: 3,
    rebirthRequired: 0,
  },
  {
    id: 'mu5',
    name: 'click surge',
    desc: 'each click gives 25x more multiplier',
    cost: 0.00001,
    level: 0,
    maxLevel: 1,
    effect: 'clickRate',
    value: 25,
    rebirthRequired: 0,
  },
  // ── Rebirth-gated upgrades ─────────────────────────────────────────────────
  {
    id: 'mu_rb1',
    name: 'reborn boost i',
    desc: 'multiplier is 1.5x stronger',
    cost: 0.00001,
    level: 0,
    maxLevel: 1,
    effect: 'multStrength',
    value: 1.5,
    rebirthRequired: 1,
  },
  {
    id: 'mu_rb2',
    name: 'click frenzy',
    desc: 'each click gives 100x more multiplier',
    cost: 0.00005,
    level: 0,
    maxLevel: 1,
    effect: 'clickRate',
    value: 100,
    rebirthRequired: 3,
  },
  {
    id: 'mu_rb3',
    name: 'reborn boost ii',
    desc: 'multiplier is 3x stronger',
    cost: 0.0001,
    level: 0,
    maxLevel: 1,
    effect: 'multStrength',
    value: 3,
    rebirthRequired: 5,
  },
  {
    id: 'mu_rb4',
    name: 'hyper click',
    desc: 'each click gives 4x more multiplier',
    cost: 0.0005,
    level: 0,
    maxLevel: 1,
    effect: 'clickRate',
    value: 4,
    rebirthRequired: 10,
  },
  {
    id: 'mu_rb5',
    name: 'transcendence',
    desc: 'multiplier is 3x stronger',
    cost: 0.001,
    level: 0,
    maxLevel: 1,
    effect: 'multStrength',
    value: 3,
    rebirthRequired: 20,
  },
];

// ── Computed helpers ──────────────────────────────────────────────────────────

// Total clickRate multiplier from purchased upgrades
function getMultClickRate() {
  return multUpgrades
    .filter(u => u.level > 0 && u.effect === 'clickRate')
    .reduce((acc, u) => acc * u.value, 1);
}

// Total strength multiplier (how much the multiplier boosts clickPower)
function getMultStrength() {
  return multUpgrades
    .filter(u => u.level > 0 && u.effect === 'multStrength')
    .reduce((acc, u) => acc * u.value, 1);
}

// The effective click power multiplier applied to clickPower
function getEffectiveMultiplier() {
  // (clickMultiplier - 1) is scaled by strength, then added back to base 1
  return 1 + (clickMultiplier - 1) * getMultStrength();
}

// Gain mult currency on every manual click
function gainMultiplierOnClick() {
  const gain = MULT_PER_CLICK * getMultClickRate();
  clickMultiplier += gain;
  multCurrency    += gain;
}

// ── Buy upgrade ───────────────────────────────────────────────────────────────
function buyMultUpgrade(id) {
  const upg = multUpgrades.find(u => u.id === id);
  if (!upg || upg.level >= upg.maxLevel) return;
  if (rebirthCount < upg.rebirthRequired) return;
  if (multCurrency < upg.cost) return;

  multCurrency -= upg.cost;
  upg.level++;

  renderMultMinigame();
  updateDisplay(); // refresh click power display
  if (typeof saveGame === 'function') saveGame();
}

// ── Format multiplier nicely ──────────────────────────────────────────────────
function formatMult(n) {
  if (n >= 1e9)  return (n / 1e9).toFixed(3)  + 'B';
  if (n >= 1e6)  return (n / 1e6).toFixed(3)  + 'M';
  if (n >= 1e3)  return (n / 1e3).toFixed(3)  + 'K';
  if (n >= 1)    return n.toFixed(4);
  // show small numbers in scientific-ish with enough precision
  if (n >= 1e-4) return n.toFixed(10).replace(/0+$/, '');
  return n.toExponential(3);
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderMultMinigame() {
  const container = document.getElementById('mult-minigame');
  if (!container) return;

  const effectiveMult = getEffectiveMultiplier();
  const strength      = getMultStrength();
  const clickRate     = getMultClickRate();

  const visibleUpgrades = multUpgrades.filter(u => rebirthCount >= u.rebirthRequired);
  const lockedCount     = multUpgrades.filter(u => rebirthCount < u.rebirthRequired).length;

  const upgradeCards = visibleUpgrades.map(upg => {
    const maxed    = upg.level >= upg.maxLevel;
    const canAfford = multCurrency >= upg.cost;
    const locked   = rebirthCount < upg.rebirthRequired;
    let cardClass  = 'mu-card';
    if (maxed) cardClass += ' mu-maxed';
    else if (!canAfford) cardClass += ' mu-locked';

    return `
      <div class="${cardClass}">
        <div class="mu-name">${upg.name}</div>
        <div class="mu-desc">${upg.desc}</div>
        <div class="mu-cost">${maxed ? 'maxed' : formatMult(upg.cost) + 'x'}</div>
        <button class="mu-btn ${maxed ? 'mu-btn-maxed' : canAfford ? 'mu-btn-buy' : ''}"
          ${maxed || !canAfford ? 'disabled' : ''}
          onclick="buyMultUpgrade('${upg.id}')">
          ${maxed ? '✓' : 'buy'}
        </button>
      </div>
    `;
  }).join('');

  const lockedHint = lockedCount > 0
    ? `<div class="mu-locked-hint">🔒 ${lockedCount} more upgrade${lockedCount > 1 ? 's' : ''} unlock with rebirths</div>`
    : '';

  container.innerHTML = `
    <div class="mu-header">
      <div class="mu-stat-row">
        <span class="mu-label">multiplier</span>
        <span class="mu-value mu-value-main">${formatMult(effectiveMult)}x</span>
      </div>
      <div class="mu-stat-row">
        <span class="mu-label">currency</span>
        <span class="mu-value">${formatMult(multCurrency)}x</span>
      </div>
      <div class="mu-stat-row">
        <span class="mu-label">per click</span>
        <span class="mu-value">+${formatMult(MULT_PER_CLICK * clickRate)}x</span>
      </div>
      ${strength > 1 ? `<div class="mu-stat-row"><span class="mu-label">strength</span><span class="mu-value">${formatMult(strength)}x</span></div>` : ''}
    </div>
    <div class="mu-upgrades">
      ${upgradeCards}
    </div>
    ${lockedHint}
  `;
}

// ── Reset on rebirth ──────────────────────────────────────────────────────────
function resetMultMinigame() {
  clickMultiplier = 1.0;
  multCurrency    = 0.0;
  multUpgrades.forEach(u => u.level = 0);
  renderMultMinigame();
}