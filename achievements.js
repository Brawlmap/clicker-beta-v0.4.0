// ── Achievements ─────────────────────────────────────────────────────────────
// Each achievement has: id, name, desc, bonus (desc), check(), onUnlock()

const achievements = [
  // ── Click milestones ──────────────────────────────────────────────────────
  {
    id: 'clicks_100',
    name: 'first steps',
    desc: 'reach 100 total clicks',
    bonus: '+5% cps',
    unlocked: false,
    check: () => totalClicksEver >= 100,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
  {
    id: 'clicks_1k',
    name: 'click addict',
    desc: 'reach 1,000 total clicks',
    bonus: '+5% cps',
    unlocked: false,
    check: () => totalClicksEver >= 1_000,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
  {
    id: 'clicks_10k',
    name: 'ten thousand',
    desc: 'reach 10,000 total clicks',
    bonus: '+5% cps',
    unlocked: false,
    check: () => totalClicksEver >= 10_000,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
  {
    id: 'clicks_100k',
    name: 'hundred grand',
    desc: 'reach 100,000 total clicks',
    bonus: '+5% cps',
    unlocked: false,
    check: () => totalClicksEver >= 100_000,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
  {
    id: 'clicks_1m',
    name: 'millionaire',
    desc: 'reach 1,000,000 total clicks',
    bonus: '+5% cps',
    unlocked: false,
    check: () => totalClicksEver >= 1_000_000,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
  {
    id: 'clicks_1b',
    name: 'billionaire',
    desc: 'reach 1,000,000,000 total clicks',
    bonus: '+5% cps',
    unlocked: false,
    check: () => totalClicksEver >= 1_000_000_000,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },

  // ── Shop milestones ───────────────────────────────────────────────────────
  {
    id: 'shop_first',
    name: 'first purchase',
    desc: 'buy your first shop item',
    bonus: '+5% click power',
    unlocked: false,
    check: () => shopItems.some(i => i.count >= 1),
    onUnlock: () => { achievementClickBonus += 0.05; }
  },
  {
    id: 'shop_t1_10',
    name: 'tier 1 fan',
    desc: 'own 10 tier 1 items',
    bonus: '+5% cps',
    unlocked: false,
    check: () => shopItems[0].count >= 10,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
  {
    id: 'shop_t3_1',
    name: 'rising up',
    desc: 'buy your first tier 3',
    bonus: '+5% cps',
    unlocked: false,
    check: () => shopItems[2].count >= 1,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
  {
    id: 'shop_t5_5',
    name: 'mid game grinder',
    desc: 'own 5 tier 5 items',
    bonus: '+5% cps',
    unlocked: false,
    check: () => shopItems[4].count >= 5,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
  {
    id: 'shop_t10_1',
    name: 'endgame begins',
    desc: 'buy your first tier 10',
    bonus: '+5% cps',
    unlocked: false,
    check: () => shopItems[9].count >= 1,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
  {
    id: 'shop_t12_1',
    name: 'max tier',
    desc: 'buy your first tier 12',
    bonus: '+5% cps',
    unlocked: false,
    check: () => shopItems[11].count >= 1,
    onUnlock: () => { achievementCpsBonus += 0.30; }
  },
  {
    id: 'shop_all_1',
    name: 'collector',
    desc: 'own at least 1 of every shop item',
    bonus: '+5% cps',
    unlocked: false,
    check: () => shopItems.every(i => i.count >= 1),
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },

  // ── CPS milestones ────────────────────────────────────────────────────────
  {
    id: 'cps_100',
    name: 'passive income',
    desc: 'reach 100 cps',
    bonus: '+5% cps',
    unlocked: false,
    check: () => cps >= 100,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
  {
    id: 'cps_10k',
    name: 'money printer',
    desc: 'reach 10,000 cps',
    bonus: '+5% cps',
    unlocked: false,
    check: () => cps >= 10_000,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
  {
    id: 'cps_1m',
    name: 'industrial complex',
    desc: 'reach 1,000,000 cps',
    bonus: '+5% cps',
    unlocked: false,
    check: () => cps >= 1_000_000,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },

  // ── Rebirth milestones ────────────────────────────────────────────────────
  {
    id: 'rebirth_1',
    name: 'born again',
    desc: 'perform your first rebirth',
    bonus: '+5% cps',
    unlocked: false,
    check: () => rebirthCount >= 1,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
  {
    id: 'rebirth_5',
    name: 'reborn again... again',
    desc: 'reach 5 total rebirths',
    bonus: '+5% cps',
    unlocked: false,
    check: () => rebirthCount >= 5,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
  {
    id: 'rebirth_20',
    name: 'serial rebirthed',
    desc: 'reach 20 total rebirths',
    bonus: '+2x click power',
    unlocked: false,
    check: () => rebirthCount >= 20,
    onUnlock: () => { achievementClickBonus += 1.0; }
  },
  {
    id: 'rebirth_50',
    name: 'eternal',
    desc: 'reach 50 total rebirths',
    bonus: '+5% cps',
    unlocked: false,
    check: () => rebirthCount >= 50,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },

  // ── Fun / secret achievements ─────────────────────────────────────────────
  {
    id: 'click_manual_100',
    name: 'clicker at heart',
    desc: 'manually click 100 times',
    bonus: '+5% click power',
    unlocked: false,
    check: () => manualClickCount >= 100,
    onUnlock: () => { achievementClickBonus += 0.05; }
  },
  {
    id: 'click_manual_1000',
    name: 'finger destroyer',
    desc: 'manually click 1,000 times',
    bonus: '+5% click power',
    unlocked: false,
    check: () => manualClickCount >= 1000,
    onUnlock: () => { achievementClickBonus += 0.05; }
  },

  // ── Rebirth bonus ─────────────────────────────────────────────────────────
  {
    id: 'rebirth_bonus_50',
    name: 'rebirth blessing',
    desc: 'own at least 5 of every shop item',
    bonus: '+50% rebirth gain',
    unlocked: false,
    check: () => shopItems.every(i => i.count >= 5),
    onUnlock: () => { achievementRebirthBonus += 0.50; }
  },

  // ── Ascension achievements ─────────────────────────────────────────────────
  {
    id: 'ascension_1',
    name: 'transcended',
    desc: 'ascend for the first time',
    bonus: '+10% cps',
    unlocked: false,
    check: () => typeof ascensionCount !== 'undefined' && ascensionCount >= 1,
    onUnlock: () => { achievementCpsBonus += 0.10; }
  },
  {
    id: 'ascension_5',
    name: 'beyond rebirth',
    desc: 'ascend 5 times',
    bonus: '+10% cps',
    unlocked: false,
    check: () => typeof ascensionCount !== 'undefined' && ascensionCount >= 5,
    onUnlock: () => { achievementCpsBonus += 0.10; }
  },
  {
    id: 'ascension_10',
    name: 'infinite loop',
    desc: 'ascend 10 times',
    bonus: '+25% cps',
    unlocked: false,
    check: () => typeof ascensionCount !== 'undefined' && ascensionCount >= 10,
    onUnlock: () => { achievementCpsBonus += 0.25; }
  },
  {
    id: 'ascension_shards_10',
    name: 'shard collector',
    desc: 'accumulate 10 ascension shards',
    bonus: '+10% click power',
    unlocked: false,
    check: () => typeof ascensionShards !== 'undefined' && ascensionShards >= 10,
    onUnlock: () => { achievementClickBonus += 0.10; }
  },
  {
    id: 'ascension_maxed_upg',
    name: 'ascendant',
    desc: 'max out any ascension upgrade',
    bonus: '+15% cps',
    unlocked: false,
    check: () => typeof ascensionUpgrades !== 'undefined' && Object.values(ascensionUpgrades).some(u => u.level >= u.maxLevel),
    onUnlock: () => { achievementCpsBonus += 0.15; }
  },

  // ── Challenge achievements ─────────────────────────────────────────────────
  {
    id: 'challenge_2m_no_upgrades',
    name: 'pure clicker',
    desc: 'reach 2,000,000 clicks with no rebirth upgrades bought',
    bonus: '+50% click power',
    unlocked: false,
    check: () => clickCount >= 2_000_000 &&
      Object.values(rebirthUpgrades).every(u => u.level === 0),
    onUnlock: () => { achievementClickBonus += 0.50; }
  },
  {
    id: 'challenge_all_t100',
    name: 'century collector',
    desc: 'own 100 of every tier in the clicks shop',
    bonus: '+50% cps & +50% click power',
    unlocked: false,
    check: () => shopItems.every(i => i.count >= 100),
    onUnlock: () => { achievementCpsBonus += 0.50; achievementClickBonus += 0.50; }
  },

  // ── More click milestones ──────────────────────────────────────────────────
  {
    id: 'clicks_1t',
    name: 'trillionaire',
    desc: 'reach 1,000,000,000,000 total clicks',
    bonus: '+5% cps',
    unlocked: false,
    check: () => totalClicksEver >= 1_000_000_000_000,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
  {
    id: 'clicks_manual_10k',
    name: 'repetitive strain',
    desc: 'manually click 10,000 times',
    bonus: '+5% click power',
    unlocked: false,
    check: () => manualClickCount >= 10_000,
    onUnlock: () => { achievementClickBonus += 0.05; }
  },

  // ── More CPS milestones ────────────────────────────────────────────────────
  {
    id: 'cps_1b',
    name: 'click empire',
    desc: 'reach 1,000,000,000 cps',
    bonus: '+5% cps',
    unlocked: false,
    check: () => cps >= 1_000_000_000,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
  {
    id: 'cps_1t',
    name: 'god of automation',
    desc: 'reach 1,000,000,000,000 cps',
    bonus: '+5% cps',
    unlocked: false,
    check: () => cps >= 1_000_000_000_000,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },

  // ── More rebirth milestones ────────────────────────────────────────────────
  {
    id: 'rebirth_1k',
    name: 'thousand lives',
    desc: 'reach 1,000 total rebirths',
    bonus: '+5% cps',
    unlocked: false,
    check: () => rebirthCount >= 1_000,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
  {
    id: 'rebirth_1m',
    name: 'reborn a million times',
    desc: 'reach 1,000,000 total rebirths',
    bonus: '+5% cps',
    unlocked: false,
    check: () => rebirthCount >= 1_000_000,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
  {
    id: 'rebirth_1b',
    name: 'one with the loop',
    desc: 'reach 1,000,000,000 total rebirths',
    bonus: '+10% cps',
    unlocked: false,
    check: () => rebirthCount >= 1_000_000_000,
    onUnlock: () => { achievementCpsBonus += 0.10; }
  },

  // ── Shop depth milestones ──────────────────────────────────────────────────
  {
    id: 'shop_t12_50',
    name: 'tier 12 addict',
    desc: 'own 50 tier 12 items',
    bonus: '+5% cps',
    unlocked: false,
    check: () => shopItems[11].count >= 50,
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
  {
    id: 'shop_all_50',
    name: 'hoarder',
    desc: 'own at least 50 of every shop item',
    bonus: '+5% cps',
    unlocked: false,
    check: () => shopItems.every(i => i.count >= 50),
    onUnlock: () => { achievementCpsBonus += 0.05; }
  },
];

// ── Bonus accumulators (applied in updateCps / increaseClicks) ────────────────
// These are percentages stacked additively, applied as multipliers: (1 + bonus)
let achievementCpsBonus     = 0;  // e.g. 0.30 = 30% bonus cps
let achievementClickBonus   = 0;  // e.g. 0.10 = 10% bonus click power
let achievementRebirthBonus = 0;  // e.g. 0.50 = 50% more RB on rebirth

// Track stats for achievement checks
let totalClicksEver  = 0;
let manualClickCount = 0;

// ── Check & unlock ────────────────────────────────────────────────────────────
function checkAchievements() {
  let anyNewUnlock = false;
  for (const ach of achievements) {
    if (!ach.unlocked && ach.check()) {
      ach.unlocked = true;
      ach.onUnlock();
      anyNewUnlock = true;
      showAchievementToast(ach);
      // Recalc cps since bonuses may have changed
      updateCps();
    }
  }
  if (anyNewUnlock) {
    renderAchievements();
    updateDisplay();
  }
}

// ── Toast notification ────────────────────────────────────────────────────────
function showAchievementToast(ach) {
  const toast = document.createElement('div');
  toast.className = 'ach-toast';
  toast.innerHTML = `
    <span class="ach-toast-icon">🏆</span>
    <div class="ach-toast-text">
      <div class="ach-toast-title">${ach.name}</div>
      <div class="ach-toast-bonus">${ach.bonus}</div>
    </div>
  `;
  document.body.appendChild(toast);
  // Trigger animation
  requestAnimationFrame(() => toast.classList.add('ach-toast-show'));
  setTimeout(() => {
    toast.classList.remove('ach-toast-show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ── Render achievement grid ───────────────────────────────────────────────────
function renderAchievements() {
  const container = document.getElementById('achievements-container');
  if (!container) return;

  const unlocked = achievements.filter(a => a.unlocked);
  const locked   = achievements.filter(a => !a.unlocked);

  const totalBonus = Math.round(achievementCpsBonus * 100);
  const clickBonus = Math.round(achievementClickBonus * 100);

  container.innerHTML = `
    <div class="ach-summary">
      <span>${unlocked.length}/${achievements.length} unlocked</span>
      <span class="ach-summary-bonus">cps bonus: +${totalBonus}% | click bonus: +${clickBonus}%</span>
    </div>
    <div class="ach-grid-inner">
      ${achievements.map(ach => `
        <div class="ach-card ${ach.unlocked ? 'ach-unlocked' : 'ach-locked'}">
          <div class="ach-icon">${ach.unlocked ? '🏆' : '🔒'}</div>
          <div class="ach-name">${ach.unlocked ? ach.name : '???'}</div>
          <div class="ach-desc">${ach.unlocked ? ach.desc : 'keep playing to unlock'}</div>
          <div class="ach-bonus ${ach.unlocked ? '' : 'ach-bonus-hidden'}">${ach.bonus}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// Run achievement checks every second
setInterval(checkAchievements, 1000);