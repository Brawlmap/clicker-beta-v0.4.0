// ── Ascension System ──────────────────────────────────────────────────────────
// Requirement: 1,000,000,000 (1B) rebirths
// Resets: clicks, shop, rebirth count, rebirth upgrades, auto-buy, auto-rebirth
// Keeps: ascension count, ascension upgrades, multiplier minigame
// Currency: Ascension Shards (AS)

const ASCENSION_COST = 1_000_000_000; // 1B rebirths

let ascensionCount = 0;
let ascensionShards = 0; // currency for the ascension shop

// ── Ascension upgrades ─────────────────────────────────────────────────────────
const ascensionUpgrades = {

  globalCps: {
    id: 'globalCps',
    title: '⚡ cps amplifier',
    maxLevel: 10,
    level: 0,
    costs: [1, 2, 4, 8, 15, 25, 40, 60, 85, 120],
    descs: Array.from({ length: 10 }, (_, i) =>
      `+${(i + 1) * 100}% total cps`
    ),
    getMultiplier() {
      return 1 + this.level * 1; // +100% cps per level
    },
  },

  clickPowerBoost: {
    id: 'clickPowerBoost',
    title: '👆 click power',
    maxLevel: 10,
    level: 0,
    costs: [1, 2, 4, 8, 15, 25, 40, 60, 85, 120],
    descs: Array.from({ length: 10 }, (_, i) =>
      `+${(i + 1) * 100}% click power`
    ),
    getMultiplier() {
      return 1 + this.level * 1.0; // +100% (2x) per level
    },
  },

  shopDiscount: {
    id: 'shopDiscount',
    title: '🏷️ shop discount',
    maxLevel: 5,
    level: 0,
    costs: [1, 5, 12, 30, 75],
    descs: [
      '10% cheaper shop items',
      '15% cheaper shop items',
      '20% cheaper shop items',
      '35% cheaper shop items',
      '50% cheaper shop items',
    ],
    getDiscount() {
      const table = [0, 0.10, 0.15, 0.20, 0.35, 0.50];
      return table[this.level];
    },
  },

  startingRebirths: {
    id: 'startingRebirths',
    title: '♻️ head start',
    maxLevel: 8,
    level: 0,
    costs: [3, 7, 15, 30, 60, 120, 250, 500],
    descs: [
      'start each run with 10 rebirths',
      'start each run with 50 rebirths',
      'start each run with 1,000 rebirths',
      'start each run with 5,000 rebirths',
      'start each run with 10,000 rebirths',
      'start each run with 20,000 rebirths',
      'start each run with 150,000 rebirths',
      'start each run with 750,000 rebirths',
    ],
    getStartingRebirths() {
      const table = [0, 10, 50, 1_000, 5_000, 10_000, 20_000, 150_000, 750_000];
      return table[this.level];
    },
  },

  rebirthScaling: {
    id: 'rebirthScaling',
    title: '📈 rebirth power',
    maxLevel: 8,
    level: 0,
    costs: [1, 5, 10, 20, 45, 90, 180, 400],
    descs: Array.from({ length: 8 }, (_, i) =>
      `+${(i + 1) * 100}% rebirth gain`
    ),
    getMultiplier() {
      return 1 + this.level * 1.00;
    },
  },

  ascShardBoost: {
    id: 'ascShardBoost',
    title: '💎 shard amplifier',
    maxLevel: 5,
    level: 0,
    costs: [5, 15, 40, 100, 250],
    descs: [
      'gain +1 extra shard per ascension',
      'gain +2 extra shards per ascension',
      'gain +4 extra shards per ascension',
      'gain +8 extra shards per ascension',
      'gain +16 extra shards per ascension',
    ],
    getBonusShards() {
      const table = [0, 1, 2, 4, 8, 16];
      return table[this.level];
    },
  },

  ascCpsOnAscend: {
    id: 'ascCpsOnAscend',
    title: '🔥 ascension legacy',
    maxLevel: 6,
    level: 0,
    costs: [3, 10, 25, 60, 150, 400],
    descs: Array.from({ length: 6 }, (_, i) =>
      `each ascension adds ${[10,20,30,50,70,100][i]}% bonus cps (stacks)`
    ),
    getBonusPerAscension() {
      const table = [0, 0.5, 1.0, 2.0, 4.0, 8.0, 16.0];
      return table[this.level];
    },
    getTotalBonus() {
      return this.getBonusPerAscension() * ascensionCount;
    },
  },

  ascClickFrenzy: {
    id: 'ascClickFrenzy',
    title: '👊 click frenzy',
    maxLevel: 5,
    level: 0,
    costs: [4, 12, 35, 90, 220],
    descs: Array.from({ length: 5 }, (_, i) =>
      `+${[100,200,400,800,1600][i]}% click power`
    ),
    getMultiplier() {
      const mults = [1, 2, 3, 5, 9, 17];
      return mults[this.level];
    },
  },

  ascRebirthCostReduce: {
    id: 'ascRebirthCostReduce',
    title: '⚡ rebirth threshold',
    maxLevel: 4,
    level: 0,
    costs: [8, 25, 75, 200],
    descs: [
      'rebirth requires 25% fewer clicks',
      'rebirth requires 50% fewer clicks',
      'rebirth requires 75% fewer clicks',
      'rebirth requires 90% fewer clicks',
    ],
    getThresholdMult() {
      const table = [1.0, 0.75, 0.50, 0.25, 0.10];
      return table[this.level];
    },
  },

  ascRebirthStack: {
    id: 'ascRebirthStack',
    title: '🌀 ascension momentum',
    maxLevel: 5,
    level: 0,
    costs: [6, 20, 55, 140, 350],
    descs: [
      'each ascension adds +5% rebirth gain (stacks)',
      'each ascension adds +10% rebirth gain (stacks)',
      'each ascension adds +20% rebirth gain (stacks)',
      'each ascension adds +30% rebirth gain (stacks)',
      'each ascension adds +50% rebirth gain (stacks)',
    ],
    getBonusPerAscension() {
      const table = [0, 0.05, 0.10, 0.20, 0.30, 0.50];
      return table[this.level];
    },
    getTotalBonus() {
      // stacks multiplicatively with ascension count
      return this.getBonusPerAscension() * ascensionCount;
    },
  },

  ascInfiniteScaling: {
    id: 'ascInfiniteScaling',
    title: '♾️ infinite scaling',
    maxLevel: 1,
    level: 0,
    costs: [100],
    descs: [
      'inf rebirths per 1M clicks - 1 rebirth per every 1M clicks, no cap (e.g. 17M clicks = 17 RB × all multipliers)',
    ],
    isUnlocked() {
      return this.level >= 1;
    },
  },
};

// ── Shards awarded per ascension (scales with ascension count) ─────────────────
function getShardsOnAscension() {
  const base = Math.floor(1 + ascensionCount * 2);
  const bonus = ascensionUpgrades.ascShardBoost.getBonusShards();
  return base + bonus;
}

// ── Can we ascend? ─────────────────────────────────────────────────────────────
function canAscend() {
  return rebirthCount >= ASCENSION_COST;
}

// ── Do the ascension ──────────────────────────────────────────────────────────
function doAscension() {
  if (!canAscend()) return;

  const shardsGained = getShardsOnAscension();

  // Full wipe
  clickCount       = 0;
  clickPower       = 1;
  shopItems.forEach(i => i.count = 0);
  rebirthCount     = 0;

  // Reset rebirth upgrades
  Object.values(rebirthUpgrades).forEach(u => u.level = 0);

  // Reset auto-buy
  if (typeof autoBuyUnlocked !== 'undefined') {
    Object.keys(autoBuyUnlocked).forEach(k => {
      autoBuyUnlocked[k] = false;
      autoBuyEnabled[k]  = true;
    });
  }

  // Reset auto-rebirth
  if (typeof autoRebirthUnlocked !== 'undefined') {
    autoRebirthUnlocked  = false;
    autoRebirthEnabled   = false;
    autoRebirthThreshold = 1_000_000;
  }

  // Apply starting rebirths from upgrade
  rebirthCount = ascensionUpgrades.startingRebirths.getStartingRebirths();

  // Gain shards & increment count
  ascensionShards += shardsGained;
  ascensionCount++;

  updateCps();
  updateDisplay();
  renderRebirthShop();
  renderAscensionShop();
  if (typeof renderAchievements === 'function') renderAchievements();

  // Show dramatic toast
  showAscensionToast(shardsGained);
  if (typeof saveGame === 'function') saveGame();
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showAscensionToast(shards) {
  const toast = document.createElement('div');
  toast.className = 'asc-toast';
  toast.innerHTML = `
    <div class="asc-toast-icon">🌟</div>
    <div class="asc-toast-text">
      <div class="asc-toast-title">ascension #${ascensionCount}!</div>
      <div class="asc-toast-sub">gained <b>${shards}</b> ascension shard${shards !== 1 ? 's' : ''}</div>
    </div>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('asc-toast-show'));
  setTimeout(() => {
    toast.classList.remove('asc-toast-show');
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

// ── Buy an ascension upgrade ──────────────────────────────────────────────────
function buyAscensionUpgrade(id) {
  const upg = ascensionUpgrades[id];
  if (!upg || upg.level >= upg.maxLevel) return;

  let countToBuy = buyMultiplier === 'max' ? (upg.maxLevel - upg.level) : buyMultiplier;
  for (let i = 0; i < countToBuy; i++) {
    if (upg.level >= upg.maxLevel) break;
    const cost = upg.costs[upg.level];
    if (ascensionShards < cost) break;
    ascensionShards -= cost;
    upg.level++;
  }

  updateCps();
  updateDisplay();
  renderAscensionShop();
  if (typeof saveGame === 'function') saveGame();
}

// ── Getters used by other systems ─────────────────────────────────────────────
function getAscensionCpsMult() {
  const base = ascensionUpgrades.globalCps.getMultiplier();
  const legacy = 1 + ascensionUpgrades.ascCpsOnAscend.getTotalBonus();
  return base * legacy;
}
function getAscensionClickMult() {
  return ascensionUpgrades.clickPowerBoost.getMultiplier() * ascensionUpgrades.ascClickFrenzy.getMultiplier();
}
function getAscensionShopDiscount()    { return ascensionUpgrades.shopDiscount.getDiscount(); }
function getAscensionRebirthMult()     {
  // base rebirth power + stacking ascension momentum bonus
  const base = ascensionUpgrades.rebirthScaling.getMultiplier();
  const momentum = 1 + ascensionUpgrades.ascRebirthStack.getTotalBonus();
  return base * momentum;
}
function getAscensionRebirthCostMult() { return ascensionUpgrades.ascRebirthCostReduce.getThresholdMult(); }
function getAscensionInfiniteScaling() { return ascensionUpgrades.ascInfiniteScaling.isUnlocked(); }

// ── Render ────────────────────────────────────────────────────────────────────
function renderAscensionShop() {
  const container = document.getElementById('ascension-items');
  if (!container) return;

  const canAsc = canAscend();
  const shardsOnAsc = getShardsOnAscension();

  // ── Ascend button card ──────────────────────────────────────────────────────
  const ascCard = `
    <div class="asc-center-card ${canAsc ? 'asc-ready' : ''}">
      <div class="asc-center-title">🌟 ascension</div>
      <div class="asc-center-desc">
        the ultimate reset. lose everything from your current run and all rebirth progress,
        ascension shards to spend on powerful upgrades that persist forever. 2 shards per ascension flat.
      </div>
      <div class="asc-center-req">
        requirement: <span class="${canAsc ? 'asc-req-met' : 'asc-req-unmet'}">${formatNum(rebirthCount)} / ${formatNum(ASCENSION_COST)} rebirths</span>
      </div>
      ${canAsc ? `<div class="asc-center-gain">you will gain: <b>${shardsOnAsc}</b> ascension shard${shardsOnAsc !== 1 ? 's' : ''}</div>` : ''}
      <div class="asc-center-stats">
        ascensions: <b>${ascensionCount}</b> &nbsp;|&nbsp; shards: <b>${formatNum(ascensionShards)} ✨</b>
      </div>
      <button class="asc-btn ${canAsc ? 'asc-btn-ready' : ''}"
        ${canAsc ? '' : 'disabled'}
        onclick="confirmAscension()">
        ASCEND
      </button>
    </div>
  `;

  // ── Upgrade cards ───────────────────────────────────────────────────────────
  const upgradeCards = Object.values(ascensionUpgrades).map(upg => {
    const maxed = upg.level >= upg.maxLevel;

    let levelsToBuy = 0;
    let totalCost   = 0;
    let tempLevel   = upg.level;
    const limit     = buyMultiplier === 'max' ? (upg.maxLevel - upg.level) : buyMultiplier;

    for (let i = 0; i < limit; i++) {
      if (tempLevel >= upg.maxLevel) break;
      const nextCost = upg.costs[tempLevel];
      if (buyMultiplier === 'max') {
        if (totalCost + nextCost <= ascensionShards) {
          totalCost += nextCost; levelsToBuy++; tempLevel++;
        } else break;
      } else {
        totalCost += nextCost; levelsToBuy++; tempLevel++;
      }
    }

    const canBuy   = !maxed && ascensionShards >= totalCost && levelsToBuy > 0;
    const btnClass = maxed ? 'asc-upg-btn asc-upg-maxed' : canBuy ? 'asc-upg-btn asc-upg-buyable' : 'asc-upg-btn';
    const btnLabel = maxed ? 'maxed' : `buy ${levelsToBuy} (${formatNum(totalCost)} ✨)`;

    return `
      <div class="asc-upg-card ${maxed ? 'asc-upg-card-maxed' : ''} ${!canBuy && !maxed ? 'asc-upg-card-locked' : ''}">
        <div class="asc-upg-title">${upg.title}</div>
        <div class="asc-upg-desc">${maxed ? '(maxed)' : upg.descs[upg.level]}</div>
        <button class="${btnClass}" ${maxed || !canBuy ? 'disabled' : ''}
          onclick="buyAscensionUpgrade('${upg.id}')">
          ${btnLabel}
        </button>
        <div class="asc-upg-level">level ${upg.level}/${upg.maxLevel}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="rb-section-label" style="color:#f59e0b; border-color:#f59e0b55;">✨ ASCENSION SHOP</div>
    <div class="asc-upg-grid">${upgradeCards}</div>
    <div class="rb-section-label" style="color:#f59e0b; border-color:#f59e0b55; margin-top:20px;">✨ ASCENSION CENTER</div>
    ${ascCard}
  `;
}

// ── Confirm before ascension ──────────────────────────────────────────────────
function confirmAscension() {
  if (!canAscend()) return;
  const shards = getShardsOnAscension();
  if (confirm(
    `⚠️ ascension #${ascensionCount + 1}\n\n` +
    `this will wipe:\n• all clicks\n• all shop items\n• all rebirths (${formatNum(rebirthCount)})\n• all rebirth upgrades\n• auto-buy & auto-rebirth\n\n` +
    `you will gain: ${shards} ascension shard${shards !== 1 ? 's' : ''}\n\n` +
    `ascension upgrades & multiplier minigame are kept.\n\nare you sure?`
  )) {
    doAscension();
  }
}