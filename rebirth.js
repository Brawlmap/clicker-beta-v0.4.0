let rebirthCount = 0;
const REBIRTH_COST = 1_000_000;

// ── Rebirth upgrades ────────────────────────────────────────────────────────

const rebirthUpgrades = {

  insaneCps: {
    id: 'insaneCps',
    title: '🔥 insane cps',
    maxLevel: 5,
    level: 0,
    costs:  [1, 2, 15, 25, 50],
    descs:  [
      '+1.2x total cps speed',
      '+1.4x total cps speed',
      '+1.6x total cps speed',
      '+1.8x total cps speed',
      '+2.0x total cps speed',
    ],
    // multiplier applied to cps
    getMultiplier() {
      const mults = [1, 1.2, 1.4, 1.6, 1.8, 2.0];
      return mults[this.level];
    },
  },

  multiRebirth: {
    id: 'multiRebirth',
    title: '⚡ rebirth increased',
    maxLevel: 3,
    level: 0,
    costs:  [2, 8, 16],
    descs:  [
      'increases rebirth: 2x',
      'increases rebirth: 3x',
      'increases rebirth: 4x',
    ],
    getMultiplier() {
      return this.level + 1; // 1x, 2x, 3x, 4x
    },
  },

  RBcaling: {
    id: 'RBcaling',
    title: '📈 rebirth gain scaling',
    maxLevel: 7,
    level: 0,
    costs:  [7, 20, 75, 250, 1250, 12000, 5000000],
    descs:  [
      '3 rebirths per 3M clicks',
      '7 rebirths per 7M clicks',
      '15 rebirths per 15M clicks',
      '50 rebirths per 50M clicks',
      '1K rebirths per 1B clicks',
      '250K rebirths per 250B clicks',
      '100M rebirths per 100T clicks'

    ],
    // returns {RB, threshold} for the current level
    getScaling() {
      const table = [
        { RB: 1, threshold: 1_000_000 },   // level 0 – base (not purchased)
        { RB: 3, threshold: 3_000_000 },   // level 1
        { RB: 7, threshold: 7_000_000 },   // level 2
        { RB: 15, threshold: 15_000_000 }, // level 3
        { RB: 50, threshold: 50_000_000 }, // level 4
        { RB: 1000, threshold: 1_000_000_000 }, // level 5
        { RB: 250000, threshold: 250_000_000_000 }, // level 6
        { RB: 100000000000, threshold: 100_000_000_000_000 },           // level 7 (special case)
      ];
      return table[this.level];
    },
  },

//
  rebirthCpsMult: {
    id: 'rebirthCpsMult',
    title: '🚀 rebirth gives cps multiplier',
    maxLevel: 1,
    level: 0,
    costs: [500],
    descs: ['+0.1x total cps per 10K current rebirths (max 50x)'],
    getMultiplier() {
      if (this.level === 0) return 1;
      // +0.1x per 10K rebirths, hard capped at 50x total
      return Math.min(50, 1 + (rebirthCount / 10_000) * 0.01);
    }
  },

  returnedClicks: {
    id: 'returnedClicks',
    title: '🖱️ returned clicks after rebirth',
    maxLevel: 5,
    level: 0,
    costs: [5, 12, 25, 60, 100],
    descs: [
      'get some of your clicks back every time you rebirth. start with 50 clicks after every rebirth',
      'start with 1,000 clicks after every rebirth',
      'start with 10,000 clicks after every rebirth',
      'start with 100,000 clicks after every rebirth',
      'start with 500,000 clicks after every rebirth',
    ],
    getReturnedClicks() {
      const table = [0, 50, 1_000, 10_000, 100_000, 500_000];
      return table[this.level];
    },
  },

  clickPowerRB: {
    id: 'clickPowerRB',
    title: '👆 click power boost',
    maxLevel: 6,
    level: 0,
    costs: [3, 10, 30, 100, 500, 2000],
    descs: [
      'each manual click is 2x stronger',
      'each manual click is 4x stronger',
      'each manual click is 8x stronger',
      'each manual click is 16x stronger',
      'each manual click is 32x stronger',
      'each manual click is 64x stronger',
    ],
    getMultiplier() {
      return Math.pow(2, this.level); // 1, 2, 4, 8, 16, 32, 64
    },
  },

  rebirthStackCps: {
    id: 'rebirthStackCps',
    title: '📦 rebirth stack',
    maxLevel: 5,
    level: 0,
    costs: [15, 50, 200, 1000, 5000],
    descs: [
      'each rebirth adds +1 flat cps (stacks forever)',
      'each rebirth adds +5 flat cps (stacks forever)',
      'each rebirth adds +25 flat cps (stacks forever)',
      'each rebirth adds +100 flat cps (stacks forever)',
      'each rebirth adds +500 flat cps (stacks forever)',
    ],
    getFlatCpsPerRebirth() {
      const table = [0, 1, 5, 25, 100, 500];
      return table[this.level];
    },
  },

  // ── Late-game upgrades (high cost, massive impact) ─────────────────────────

  megaCps: {
    id: 'megaCps',
    title: '💥 mega cps',
    maxLevel: 5,
    level: 0,
    costs: [250_000, 1_000_000, 5_000_000, 200_000_000, 10_000_000_000],
    descs: [
      '2x total cps',
      '4x total cps',
      '8x total cps',
      '16x total cps',
      '32x total cps',
    ],
    getMultiplier() {
      const mults = [1, 2, 4, 8, 16, 32];
      return mults[this.level];
    },
  },

  rebirthSurge: {
    id: 'rebirthSurge',
    title: '🌊 rebirth surge',
    maxLevel: 5,
    level: 0,
    costs: [1_000_000, 125_000_000, 950_000_000, 1_500_000_000, 250_000_000_000],
    descs: [
      '2x rebirth coin gain',
      '4x rebirth coin gain',
      '8x rebirth coin gain',
      '16x rebirth coin gain',
      '32x rebirth coin gain',
    ],
    getMultiplier() {
      const mults = [1, 2, 4, 8, 16, 32];
      return mults[this.level];
    },
  },

  clickStorm: {
    id: 'clickStorm',
    title: '⚡ click storm',
    maxLevel: 4,
    level: 0,
    costs: [75_000, 500_000, 3_000_000, 20_000_000],
    descs: [
      'clicks also generate 1% of your cps instantly',
      'clicks also generate 2% of your cps instantly',
      'clicks also generate 5% of your cps instantly',
      'clicks also generate 10% of your cps instantly',
    ],
    getClickCpsBonus() {
      const table = [0, 0.01, 0.02, 0.05, 0.10];
      return table[this.level];
    },
  },

  ascensionFuel: {
    id: 'ascensionFuel',
    title: '🌟 ascension fuel',
    maxLevel: 4,
    level: 0,
    costs: [10_000_100_000, 25_000_100_000, 250_000_100_000, 1_000_000_000_000],
    descs: [
      'rebirth coins accumulate 25x faster toward ascension',
      'rebirth coins accumulate 100x faster toward ascension',
      'rebirth coins accumulate 250x faster toward ascension',
      'rebirth coins accumulate 500x faster toward ascension',
    ],
    getMultiplier() {
      const mults = [1, 2, 5, 10, 25];
      return mults[this.level];
    },
  },
};

// ── rebirthCpsMult ─────────────────────────────────────────────────────────────────

function updateCps() {
  let baseCps = 0;
  shopItems.forEach(item => {
    baseCps += item.count * item.cps;
  });

  // apply standard rebirth upgrade multiplier (insaneCps)
  let multiplier = rebirthUpgrades.insaneCps.getMultiplier();

  // mega cps late-game multiplier
  multiplier *= rebirthUpgrades.megaCps.getMultiplier();

  // apply the new dynamic rebirth multiplier!
  if (rebirthUpgrades.rebirthCpsMult.level > 0) {
    multiplier *= rebirthUpgrades.rebirthCpsMult.getMultiplier();
  }

  // apply ascension global cps multiplier
  const ascCpsMult = (typeof getAscensionCpsMult === 'function') ? getAscensionCpsMult() : 1;
  multiplier *= ascCpsMult;

  cps = baseCps * multiplier;

  // add flat cps from rebirth stack upgrade (stacks with rebirthCount)
  if (typeof rebirthUpgrades.rebirthStackCps !== 'undefined') {
    cps += rebirthUpgrades.rebirthStackCps.getFlatCpsPerRebirth() * rebirthCount;
  }

  // safety: cap at MAX_VALUE, never NaN or Infinity
  if (!isFinite(cps) || isNaN(cps)) cps = Number.MAX_VALUE;
  else cps = Math.min(cps, Number.MAX_VALUE);

  if (cpsDisplay) cpsDisplay.textContent = formatNum(cps);
}

// ── returns {RB, threshold} ─────────────────────────────────────────────────────────────────

function getEffectiveRebirthCost() {
  const mult = (typeof getAscensionRebirthCostMult === 'function') ? getAscensionRebirthCostMult() : 1;
  return Math.max(1, Math.floor(REBIRTH_COST * mult));
}

function getRebirthRB() {
  const effectiveCost = getEffectiveRebirthCost();
  if (clickCount < effectiveCost) return 0;

  // ── Ascension infinite scaling override ───────────────────────────────────
  // Gives 1 RB per 1M clicks with NO cap — stronger than rebirth gain scaling
  if (typeof getAscensionInfiniteScaling === 'function' && getAscensionInfiniteScaling()) {
    const rb = Math.floor(clickCount / 1_000_000);
    const multiplier = rebirthUpgrades.multiRebirth.getMultiplier();
    const achBonus   = (typeof achievementRebirthBonus !== 'undefined') ? achievementRebirthBonus : 0;
    const ascBonus   = (typeof getAscensionRebirthMult === 'function') ? getAscensionRebirthMult() : 1;
    const surgeMult  = rebirthUpgrades.rebirthSurge.getMultiplier();
    const fuelMult   = rebirthUpgrades.ascensionFuel.getMultiplier();
    return Math.floor(rb * multiplier * (1 + achBonus) * ascBonus * surgeMult * fuelMult);
  }

  const scaling = rebirthUpgrades.RBcaling;
  const multiplier = rebirthUpgrades.multiRebirth.getMultiplier();
  const maxRebirthsByLevel = [1, 3, 7, 15, 50, 1000, 250000, 100000000];
  const maxRebirths = maxRebirthsByLevel[scaling.level] || 1;
  const baseRebirths = Math.min(Math.floor(clickCount / effectiveCost), maxRebirths);

  let rb;
  if (scaling.level === 0) {
    rb = baseRebirths >= 1 ? baseRebirths * multiplier : 0;
  } else {
    rb = baseRebirths * multiplier;
  }

  // Apply achievement rebirth bonus
  const achBonus = (typeof achievementRebirthBonus !== 'undefined') ? achievementRebirthBonus : 0;
  // Apply ascension rebirth scaling bonus
  const ascBonus = (typeof getAscensionRebirthMult === 'function') ? getAscensionRebirthMult() : 1;
  // Apply rebirthSurge and ascensionFuel late-game multipliers
  const surgeMult = rebirthUpgrades.rebirthSurge.getMultiplier();
  const fuelMult  = rebirthUpgrades.ascensionFuel.getMultiplier();
  return Math.floor(rb * (1 + achBonus) * ascBonus * surgeMult * fuelMult);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function updateRebirthCenter() {
  const container = document.getElementById('rebirth-items');
  if (!container) return;

  const card = container.querySelector('.rebirth-card');
  if (!card) return;

  const canRebirth = clickCount >= getEffectiveRebirthCost();
  const RBOnRebirth = canRebirth ? getRebirthRB() : 0;
  const scaling = rebirthUpgrades.RBcaling.getScaling();

  const button = card.querySelector('.rebirth-btn');
  const costLabel = card.querySelector('.rebirth-cost-label');
  const gainLabel = card.querySelector('.rebirth-gain-label');
  const ownedLabel = card.querySelector('.rebirth-owned');

  if (button) {
    button.classList.toggle('rebirth-buyable', canRebirth);
    button.disabled = !canRebirth;
  }

  if (costLabel) {
    const targetClicks = canRebirth ? clickCount : scaling.threshold;
    const targetRB = canRebirth ? RBOnRebirth : scaling.RB;
    costLabel.textContent = `need ${formatNum(targetClicks)} clicks for ${formatNum(targetRB)} rebirth${formatNum(targetRB) !== '1' ? 's' : ''}`;
  }

  if (gainLabel) {
    gainLabel.innerHTML = canRebirth ? `you will gain: <b>${formatNum(RBOnRebirth)}</b> RB` : '';
  }

  if (ownedLabel) {
    ownedLabel.textContent = `rebirths: ${formatNum(rebirthCount)}`;
  }
}

// ── Core rebirth ─────────────────────────────────────────────────────────────

function doRebirth() {
  if (clickCount < getEffectiveRebirthCost()) return;

  const RB = getRebirthRB();
  rebirthCount += RB;

  // return some clicks based on upgrade level
  const returned = rebirthUpgrades.returnedClicks.getReturnedClicks();
  clickCount = returned;
  shopItems.forEach(i => i.count = 0);

  updateCps();
  updateDisplay();
  renderRebirthShop();
  if (typeof saveGame === 'function') saveGame();
}

function updateRebirthDisplay() {
  const el = document.getElementById('rebirth-display');
  if (el) el.textContent = rebirthCount;
}

// ── Buying upgrades ──────────────────────────────────────────────────────────

function buyRebirthUpgrade(id) {
  const upg = rebirthUpgrades[id];
  if (!upg || upg.level >= upg.maxLevel) return;

  // determine how many we want to buy
  let countToBuy = (buyMultiplier === 'max') ? (upg.maxLevel - upg.level) : buyMultiplier;
  
  for (let i = 0; i < countToBuy; i++) {
    if (upg.level >= upg.maxLevel) break;
    const cost = upg.costs[upg.level];
    if (rebirthCount < cost) break;

    rebirthCount -= cost;
    upg.level++;
  }

  if (id === 'insaneCps') updateCps();
  updateDisplay();
  renderRebirthShop();
}

// ── Render ───────────────────────────────────────────────────────────────────

function renderRebirthShop() {
  const container = document.getElementById('rebirth-items');
  if (!container) return;

  const canRebirth  = clickCount >= getEffectiveRebirthCost();
  const RBOnRebirth = canRebirth ? getRebirthRB() : 0;
  const scaling = rebirthUpgrades.RBcaling.getScaling();

  // ── upgrade cards ──────────────────────────────────────────────────────────
  const upgradeCards = Object.values(rebirthUpgrades).map(upg => {
    const maxed = upg.level >= upg.maxLevel;
    
    // logic to calculate how many levels you can actually afford/buy
    let levelsToBuy = 0;
    let totalCost = 0;
    let tempLevel = upg.level;
    
    // determine the limit based on multiplier
    let limit = (buyMultiplier === 'max') ? (upg.maxLevel - upg.level) : buyMultiplier;

    for (let i = 0; i < limit; i++) {
      if (tempLevel < upg.maxLevel) {
        let nextCost = upg.costs[tempLevel];
        // only add to total if we can actually afford it with current rebirthCount
        if (buyMultiplier === 'max') {
           if (totalCost + nextCost <= rebirthCount) {
             totalCost += nextCost;
             levelsToBuy++;
             tempLevel++;
           } else { break; }
        } else {
           // for 10x, 25x, etc., we just sum the costs of the next N levels
           totalCost += nextCost;
           levelsToBuy++;
           tempLevel++;
        }
      }
    }

    const canBuy = !maxed && rebirthCount >= totalCost && levelsToBuy > 0;
    const btnClass = maxed ? 'rb-upg-btn maxed' : canBuy ? 'rb-upg-btn buyable' : 'rb-upg-btn';
    
    // this makes the button text dynamic!
    const btnLabel = maxed ? 'maxed' : `buy ${levelsToBuy} (${formatNum(totalCost)} RB)`;

    return `
      <div class="rb-upg-card">
        <div class="rb-upg-title">${upg.title}</div>
        <div class="rb-upg-desc">${maxed ? '(maxed)' : upg.descs[upg.level]}</div>
        <button class="${btnClass}" ${maxed ? 'disabled' : ''}
          onclick="buyRebirthUpgrade('${upg.id}')">
          ${btnLabel}
        </button>
        <div class="rb-upg-level">level: ${upg.level}/${upg.maxLevel}</div>
      </div>
    `;
  }).join('');

  // ── rebirth center card ────────────────────────────────────────────────────
  const returned = rebirthUpgrades.returnedClicks.getReturnedClicks();
  const rebirthCard = `
    <div class="rebirth-card">
      <div class="rebirth-title">✨ rebirth</div>
      <div class="rebirth-desc">
        reset all clicks &amp; shop items<br>
        scaling rewards based on rebirth gain tier
      </div>
      <div class="rebirth-cost-label">
        need ${formatNum(scaling.threshold)} clicks for ${formatNum(scaling.RB)} rebirth${scaling.RB > 1 ? 's' : ''}
      </div>
      ${canRebirth ? `<div class="rebirth-gain-label">you will gain: <b>${formatNum(RBOnRebirth)}</b> RB</div>` : '<div class="rebirth-gain-label"></div>'}
      ${returned > 0 ? `<div class="rebirth-gain-label" style="color:#a78bfa;">you'll keep: <b>${formatNum(returned)}</b> clicks</div>` : ''}
      <div class="rebirth-owned">rebirths: ${formatNum(rebirthCount)}</div>
      <button class="rebirth-btn ${canRebirth ? 'rebirth-buyable' : ''}" ${canRebirth ? '' : 'disabled'} onclick="doRebirth()">
        REBIRTH
      </button>
    </div>
  `;

  container.innerHTML = `
    <div class="rb-section-label">PERMANENT UPGRADES</div>
    <div class="rb-upg-grid">${upgradeCards}</div>
    <div class="rb-section-label" style="margin-top:24px;">REBIRTH CENTER</div>
    ${rebirthCard}
    <div class="rb-section-label" style="margin-top:24px;">AUTO REBIRTH</div>
    <div id="auto-rebirth-section"></div>
    <div class="rb-section-label" style="margin-top:24px;">AUTO-BUY</div>
    <div id="auto-buy-section" class="ab-grid"></div>
  `;

  updateRebirthDisplay();
  updateRebirthCenter();
  renderAutoRebirthSection();
  renderAutoBuySection();
}

  // ── setmultiplier ───────────────────────────────────────────────────────────

function buyRebirthUpgrade(id) {
  const upg = rebirthUpgrades[id];
  if (!upg || upg.level >= upg.maxLevel) return;

  // determine how many we want to buy
  let countToBuy = (buyMultiplier === 'max') ? (upg.maxLevel - upg.level) : buyMultiplier;
  
  for (let i = 0; i < countToBuy; i++) {
    if (upg.level >= upg.maxLevel) break;
    const cost = upg.costs[upg.level];
    if (rebirthCount < cost) break;

    rebirthCount -= cost;
    upg.level++;
  }

  if (id === 'insaneCps') updateCps();
  updateDisplay();
  renderRebirthShop();
  if (typeof saveGame === 'function') saveGame();
}

// inside renderRebirthShop, change the upgradeCards mapping:
const upgradeCards = Object.values(rebirthUpgrades).map(upg => {
    const maxed = upg.level >= upg.maxLevel;
    
    // logic to calculate how many levels you can actually afford/buy
    let levelsToBuy = 0;
    let totalCost = 0;
    let tempLevel = upg.level;
    
    // determine the limit based on multiplier
    let limit = (buyMultiplier === 'max') ? (upg.maxLevel - upg.level) : buyMultiplier;

    for (let i = 0; i < limit; i++) {
      if (tempLevel < upg.maxLevel) {
        let nextCost = upg.costs[tempLevel];
        // only add to total if we can actually afford it with current rebirthCount
        if (buyMultiplier === 'max') {
           if (totalCost + nextCost <= rebirthCount) {
             totalCost += nextCost;
             levelsToBuy++;
             tempLevel++;
           } else { break; }
        } else {
           // for 10x, 25x, etc., we just sum the costs of the next N levels
           totalCost += nextCost;
           levelsToBuy++;
           tempLevel++;
        }
      }
    }

    const canBuy = !maxed && rebirthCount >= totalCost && levelsToBuy > 0;
    const btnClass = maxed ? 'rb-upg-btn maxed' : canBuy ? 'rb-upg-btn buyable' : 'rb-upg-btn';
    
    // this makes the button text dynamic!
    const btnLabel = maxed ? 'maxed' : `buy ${levelsToBuy} (${formatNum(totalCost)} RB)`;

    return `
      <div class="rb-upg-card">
        <div class="rb-upg-title">${upg.title}</div>
        <div class="rb-upg-desc">${maxed ? '(maxed)' : upg.descs[upg.level]}</div>
        <button class="${btnClass}" ${maxed ? 'disabled' : ''}
          onclick="buyRebirthUpgrade('${upg.id}')">
          ${btnLabel}
        </button>
        <div class="rb-upg-level">level: ${upg.level}/${upg.maxLevel}</div>
      </div>
    `;
  }).join('');
// ── Auto-Buy System ───────────────────────────────────────────────────────────

const AUTO_BUY_UPGRADES = [
  { tierId: 't1',  tierName: 'tier 1',  rbCost: 1    },
  { tierId: 't2',  tierName: 'tier 2',  rbCost: 2    },
  { tierId: 't3',  tierName: 'tier 3',  rbCost: 5    },
  { tierId: 't4',  tierName: 'tier 4',  rbCost: 10   },
  { tierId: 't5',  tierName: 'tier 5',  rbCost: 25   },
  { tierId: 't6',  tierName: 'tier 6',  rbCost: 50   },
  { tierId: 't7',  tierName: 'tier 7',  rbCost: 100  },
  { tierId: 't8',  tierName: 'tier 8',  rbCost: 150  },
  { tierId: 't9',  tierName: 'tier 9',  rbCost: 200  },
  { tierId: 't10', tierName: 'tier 10', rbCost: 300  },
  { tierId: 't11', tierName: 'tier 11', rbCost: 500  },
  { tierId: 't12', tierName: 'tier 12', rbCost: 1000 },
];

// which tiers are unlocked (purchased) and which are toggled on
const autoBuyUnlocked = {}; // tierId -> true/false
const autoBuyEnabled  = {}; // tierId -> true/false
AUTO_BUY_UPGRADES.forEach(u => {
  autoBuyUnlocked[u.tierId] = false;
  autoBuyEnabled[u.tierId]  = true; // default on when unlocked
});

function buyAutoBuyUpgrade(tierId) {
  const upg = AUTO_BUY_UPGRADES.find(u => u.tierId === tierId);
  if (!upg || autoBuyUnlocked[tierId]) return;
  if (rebirthCount < upg.rbCost) return;
  rebirthCount -= upg.rbCost;
  autoBuyUnlocked[tierId] = true;
  updateDisplay();
  renderRebirthShop();
  if (typeof saveGame === 'function') saveGame();
}

function toggleAutoBuy(tierId) {
  if (!autoBuyUnlocked[tierId]) return;
  autoBuyEnabled[tierId] = !autoBuyEnabled[tierId];
  renderAutoBuySection();
  if (typeof saveGame === 'function') saveGame();
}

// ── Tick: buy 1x of each enabled tier every second ───────────────────────────
setInterval(() => {
  let anyBought = false;
  AUTO_BUY_UPGRADES.forEach(upg => {
    if (!autoBuyUnlocked[upg.tierId]) return;
    if (!autoBuyEnabled[upg.tierId]) return;
    const item = shopItems.find(i => i.id === upg.tierId);
    if (!item) return;
    const cost = Math.floor(item.baseCost * Math.pow(1.15, item.count));
    if (clickCount >= cost) {
      clickCount -= cost;
      item.count += 1;
      anyBought = true;
    }
  });
  if (anyBought) {
    updateCps();
    updateDisplay();
  }
}, 1000);

// ── Render auto-buy section (called inside renderRebirthShop) ─────────────────
function renderAutoBuySection() {
  const container = document.getElementById('auto-buy-section');
  if (!container) return;

  const unlockedAny = AUTO_BUY_UPGRADES.some(u => autoBuyUnlocked[u.tierId]);

  const cards = AUTO_BUY_UPGRADES.map((upg, i) => {
    const unlocked = autoBuyUnlocked[upg.tierId];
    const enabled  = autoBuyEnabled[upg.tierId];
    // only show next locked if previous is unlocked (or it's t1)
    const prevUnlocked = i === 0 || autoBuyUnlocked[AUTO_BUY_UPGRADES[i - 1].tierId];
    const visible = unlocked || prevUnlocked;
    if (!visible) return '';

    if (!unlocked) {
      const canAfford = rebirthCount >= upg.rbCost;
      return `
        <div class="ab-card ab-locked">
          <div class="ab-tier-name">${upg.tierName}</div>
          <button class="ab-unlock-btn ${canAfford ? 'ab-can-afford' : ''}"
            ${canAfford ? '' : 'disabled'}
            onclick="buyAutoBuyUpgrade('${upg.tierId}')">
            unlock (${formatNum(upg.rbCost)} RB)
          </button>
        </div>
      `;
    }

    return `
      <div class="ab-card ab-unlocked">
        <div class="ab-tier-name">${upg.tierName}</div>
        <button class="ab-toggle ${enabled ? 'ab-on' : 'ab-off'}"
          onclick="toggleAutoBuy('${upg.tierId}')">
          ⚙️ ${enabled ? 'on' : 'off'}
        </button>
      </div>
    `;
  }).join('');

  const anyUnlocked = AUTO_BUY_UPGRADES.some(u => autoBuyUnlocked[u.tierId]);
  const anyOn  = AUTO_BUY_UPGRADES.some(u => autoBuyUnlocked[u.tierId] && autoBuyEnabled[u.tierId]);
  const anyOff = AUTO_BUY_UPGRADES.some(u => autoBuyUnlocked[u.tierId] && !autoBuyEnabled[u.tierId]);

  const controls = anyUnlocked ? `
    <div class="ab-controls">
      ${anyOn  ? `<button class="ab-ctrl-btn ab-ctrl-off" onclick="setAllAutoBuy(false)">⚙️ turn all off</button>` : ''}
      ${anyOff ? `<button class="ab-ctrl-btn ab-ctrl-on"  onclick="setAllAutoBuy(true)">⚙️ turn all on</button>`  : ''}
    </div>
  ` : '';

  container.innerHTML = (controls + (cards || '<div class="ab-empty">unlock auto-buy for tier 1 first</div>'));
}

function setAllAutoBuy(val) {
  AUTO_BUY_UPGRADES.forEach(u => {
    if (autoBuyUnlocked[u.tierId]) autoBuyEnabled[u.tierId] = val;
  });
  renderAutoBuySection();
}

// ── Auto-Rebirth System ───────────────────────────────────────────────────────

const AUTO_REBIRTH_THRESHOLDS = [
  { label: '1M',   value: 1_000_000      },
  { label: '5M',   value: 5_000_000      },
  { label: '10M',  value: 10_000_000     },
  { label: '50M',  value: 50_000_000     },
  { label: '100M', value: 100_000_000    },
  { label: '500M', value: 500_000_000    },
  { label: '1B',   value: 1_000_000_000  },
  { label: '5B',   value: 5_000_000_000  },
  { label: '10B',  value: 10_000_000_000 },
];

let autoRebirthUnlocked  = false;
let autoRebirthEnabled   = false;
let autoRebirthThreshold = 1_000_000; // default 1M

const AUTO_REBIRTH_COST = 150;

function buyAutoRebirth() {
  if (autoRebirthUnlocked) return;
  if (rebirthCount < AUTO_REBIRTH_COST) return;
  rebirthCount -= AUTO_REBIRTH_COST;
  autoRebirthUnlocked = true;
  autoRebirthEnabled  = true;
  updateDisplay();
  renderRebirthShop();
  if (typeof saveGame === 'function') saveGame();
}

function toggleAutoRebirth() {
  if (!autoRebirthUnlocked) return;
  autoRebirthEnabled = !autoRebirthEnabled;
  renderAutoRebirthSection();
  if (typeof saveGame === 'function') saveGame();
}

function setAutoRebirthThreshold(val) {
  autoRebirthThreshold = val;
  renderAutoRebirthSection();
  if (typeof saveGame === 'function') saveGame();
}

// Parse user input: "1M", "2.5K", "1000000", etc.
function parseThresholdInput(input) {
  const str = input.trim().toUpperCase();
  if (!str) return null;
  
  const multipliers = {
    'K': 1_000,
    'M': 1_000_000,
    'B': 1_000_000_000,
    'T': 1_000_000_000_000,
    'QD': 1_000_000_000_000_000,  // 1e15
    'QI': 1_000_000_000_000_000_000,  // 1e18
    'Sx': 1_000_000_000_000_000_000_000,  // 1e21
    'Sp': 1_000_000_000_000_000_000_000_000,  // 1e24
    'Oc': 1_000_000_000_000_000_000_000_000_000,  // 1e27
    'No': 1_000_000_000_000_000_000_000_000_000_000,  // 1e30
    'De': 1_000_000_000_000_000_000_000_000_000_000_000,  // 1e33
    'UnDe': 1_000_000_000_000_000_000_000_000_000_000_000_000,  // 1e36
    'DuDe': 1_000_000_000_000_000_000_000_000_000_000_000_000_000,  // 1e39
    'TrDe': 1_000_000_000_000_000_000_000_000_000_000_000_000_000_000,  // 1e42
    'QuDe': 1_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000,  // 1e45
    'SxDe': 1_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000,  // 1e48
    'SpDe': 1_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000,  // 1e51
    'OcDe': 1_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000,  // 1e54
    'NoDe': 1_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000,  // 1e57
    'Vi': 1_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000,  // 1e60
  };
  
  // Check for 2-character suffixes first
  if (str.length >= 3) {
    const lastTwo = str.slice(-2);
    if (multipliers[lastTwo]) {
      const num = parseFloat(str.slice(0, -2));
      if (!isNaN(num) && num > 0) {
        return Math.floor(num * multipliers[lastTwo]);
      }
    }
  }
  
  // Check for 1-character suffixes
  const lastChar = str[str.length - 1];
  if (multipliers[lastChar]) {
    const num = parseFloat(str.slice(0, -1));
    if (!isNaN(num) && num > 0) {
      return Math.floor(num * multipliers[lastChar]);
    }
  }
  
  // Plain number
  const num = parseFloat(str);
  if (!isNaN(num) && num > 0) {
    return Math.floor(num);
  }
  
  return null;
}

function applyCustomThreshold() {
  const input = document.getElementById('ar-custom-input');
  if (!input) return;
  const val = parseThresholdInput(input.value);
  if (val !== null) {
    autoRebirthThreshold = val;
    renderAutoRebirthSection();
  } else {
    input.value = '';
  }
}

// ── Tick: check auto-rebirth every second ────────────────────────────────────
setInterval(() => {
  if (!autoRebirthUnlocked || !autoRebirthEnabled) return;
  if (clickCount >= autoRebirthThreshold && clickCount >= getEffectiveRebirthCost()) {
    doRebirth();
  }
}, 1000);

// ── Render ───────────────────────────────────────────────────────────────────
function renderAutoRebirthSection() {
  const container = document.getElementById('auto-rebirth-section');
  if (!container) return;

  if (!autoRebirthUnlocked) {
    const canAfford = rebirthCount >= AUTO_REBIRTH_COST;
    container.innerHTML = `
      <div class="ar-card ar-locked">
        <div class="ar-title">♻️ auto rebirth</div>
        <div class="ar-desc">automatically rebirth when reaching a set click threshold</div>
        <button class="ar-unlock-btn ${canAfford ? 'ar-can-afford' : ''}"
          ${canAfford ? '' : 'disabled'}
          onclick="buyAutoRebirth()">
          unlock (${AUTO_REBIRTH_COST} RB)
        </button>
      </div>
    `;
    return;
  }

  const currentDisplay = formatNum(autoRebirthThreshold);

  container.innerHTML = `
    <div class="ar-card">
      <div class="ar-header">
        <div class="ar-title">♻️ auto rebirth</div>
        <button class="ar-toggle ${autoRebirthEnabled ? 'ar-on' : 'ar-off'}"
          onclick="toggleAutoRebirth()">
          ⚙️ ${autoRebirthEnabled ? 'on' : 'off'}
        </button>
      </div>
      <div class="ar-desc">rebirth automatically at <b>${currentDisplay} clicks</b></div>
      <div class="ar-thresh-input-group">
        <input type="text" id="ar-custom-input" class="ar-custom-input" 
          placeholder="e.g., 1M, 2.5QD, 1000000"
          onkeypress="if(event.key==='Enter') applyCustomThreshold()">
        <button class="ar-apply-btn" onclick="applyCustomThreshold()">set</button>
      </div>
    </div>
  `;
}