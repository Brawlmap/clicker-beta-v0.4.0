const SAVE_KEY = 'nightstarv clicker';

// ── Load caps: prevent impossibly large values from localStorage ───────────────
// These match the caps in account.js. Any value above these is treated as invalid.
const LOAD_CAPS = {
  clickCount:      1e60,    // matches STAT_CAPS.clicks
  rebirthCount:    1e60,    // matches STAT_CAPS.rebirths
  itemCount:       1e20,    // max items in a single tier
  upgLevel:        1e6,     // max level for any upgrade
  ascensionCount:  1e12,    // matches STAT_CAPS.ascensions
  ascensionShards: 1e15,    // max ascension shards
};

// ── FIX #5 / #6: Validation caps for loaded save data ────────────────────────
// These match the caps in account.js. Any value above these is treated as

function clampStat(val, cap, fallback = 0) {
  const n = Number(val);
  if (!isFinite(n) || isNaN(n) || n < 0) return fallback;
  return Math.min(Math.floor(n), cap);
}

function saveGame() {
  const data = {
    clickCount,
    clickPower,
    rebirthCount,
    totalClicksEver: typeof totalClicksEver !== 'undefined' ? totalClicksEver : 0,
    manualClickCount: typeof manualClickCount !== 'undefined' ? manualClickCount : 0,
    items: shopItems.map(i => ({ id: i.id, count: i.count })),
    rebirthUpgradeLevels: Object.fromEntries(
      Object.entries(rebirthUpgrades).map(([k, v]) => [k, v.level])
    ),
    achievementsUnlocked: typeof achievements !== 'undefined'
      ? achievements.filter(a => a.unlocked).map(a => a.id)
      : [],
    multMinigame: typeof clickMultiplier !== 'undefined' ? {
      clickMultiplier,
      multCurrency,
      upgradeLevels: Object.fromEntries(multUpgrades.map(u => [u.id, u.level])),
    } : null,
    autoBuy: typeof autoBuyUnlocked !== 'undefined' ? {
      unlocked: { ...autoBuyUnlocked },
      enabled:  { ...autoBuyEnabled  },
    } : null,
    autoRebirth: typeof autoRebirthUnlocked !== 'undefined' ? {
      unlocked:  autoRebirthUnlocked,
      enabled:   autoRebirthEnabled,
      threshold: autoRebirthThreshold,
    } : null,
    ascension: typeof ascensionCount !== 'undefined' ? {
      count:  ascensionCount,
      shards: ascensionShards,
      upgradeLevels: Object.fromEntries(
        Object.entries(ascensionUpgrades).map(([k, v]) => [k, v.level])
      ),
    } : null,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

// localstorage.js
const SECRET = "ns-infinite-z-99"; // change this to anything random

function saveWithSecurity(data) {
    const rawData = JSON.stringify(data);
    const signature = btoa(rawData + SECRET).slice(0, 16); // basic hash
    localStorage.setItem(SAVE_KEY, rawData);
    localStorage.setItem(SAVE_KEY + '_sig', signature);
}

function loadWithSecurity() {
    const data = localStorage.getItem(SAVE_KEY);
    const sig = localStorage.getItem(SAVE_KEY + '_sig');
    
    if (data && sig) {
        const expectedSig = btoa(data + SECRET).slice(0, 16);
        if (sig !== expectedSig) {
            console.error("nice try hacker 💀 save corrupted");
            return resetGame(); 
        }
        return JSON.parse(data);
    }
}

function loadGame() {
  // If user is logged in, skip localStorage load (cloud save will be loaded separately)
  if (typeof currentUser !== 'undefined' && currentUser) return;

  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);

    // FIX #5 / #6: clamp every numeric stat on load so injected values are
    // neutralised the moment the game reads them from localStorage.
    clickCount   = clampStat(data.clickCount,   LOAD_CAPS.clickCount);
    clickPower   = clampStat(data.clickPower,   1e12, 1);
    rebirthCount = clampStat(data.rebirthCount, LOAD_CAPS.rebirthCount);

    if (typeof totalClicksEver  !== 'undefined')
      totalClicksEver  = clampStat(data.totalClicksEver,  LOAD_CAPS.clickCount);
    if (typeof manualClickCount !== 'undefined')
      manualClickCount = clampStat(data.manualClickCount, LOAD_CAPS.clickCount);

    (data.items || []).forEach(saved => {
      const item = shopItems.find(i => i.id === saved.id);
      // FIX #6: clamp per-tier owned count — blocks Tier 12 injection cheat
      if (item) item.count = clampStat(saved.count, LOAD_CAPS.itemCount);
    });

    if (data.rebirthUpgradeLevels) {
      Object.entries(data.rebirthUpgradeLevels).forEach(([k, lvl]) => {
        if (rebirthUpgrades[k])
          rebirthUpgrades[k].level = clampStat(lvl, LOAD_CAPS.upgLevel);
      });
    }

    // Restore achievements silently
    if (data.achievementsUnlocked && typeof achievements !== 'undefined') {
      achievementCpsBonus = 0;
      achievementClickBonus = 0;
      achievementRebirthBonus = 0;
      data.achievementsUnlocked.forEach(id => {
        const ach = achievements.find(a => a.id === id);
        if (ach) {
          ach.unlocked = true;
          ach.onUnlock();
        }
      });
    }

    // Restore multiplier minigame
    if (data.multMinigame && typeof clickMultiplier !== 'undefined') {
      clickMultiplier = Math.max(1, Number(data.multMinigame.clickMultiplier) || 1);
      multCurrency    = Math.max(0, Number(data.multMinigame.multCurrency)    || 0);
      if (data.multMinigame.upgradeLevels) {
        multUpgrades.forEach(u => {
          u.level = clampStat(data.multMinigame.upgradeLevels[u.id], LOAD_CAPS.upgLevel);
        });
      }
    }

    // Restore auto-buy
    if (data.autoBuy && typeof autoBuyUnlocked !== 'undefined') {
      Object.assign(autoBuyUnlocked, data.autoBuy.unlocked || {});
      Object.assign(autoBuyEnabled,  data.autoBuy.enabled  || {});
    }

    // Restore auto-rebirth
    if (data.autoRebirth && typeof autoRebirthUnlocked !== 'undefined') {
      autoRebirthUnlocked  = !!data.autoRebirth.unlocked;
      autoRebirthEnabled   = !!data.autoRebirth.enabled;
      autoRebirthThreshold = clampStat(data.autoRebirth.threshold, 1e60, 1_000_000);
    }

    // Restore ascension — FIX #5: clamp shards and count
    if (data.ascension && typeof ascensionCount !== 'undefined') {
      ascensionCount  = clampStat(data.ascension.count,  LOAD_CAPS.ascensionCount);
      ascensionShards = clampStat(data.ascension.shards, LOAD_CAPS.ascensionShards);
      if (data.ascension.upgradeLevels) {
        Object.entries(data.ascension.upgradeLevels).forEach(([k, lvl]) => {
          if (ascensionUpgrades[k])
            ascensionUpgrades[k].level = clampStat(lvl, LOAD_CAPS.upgLevel);
        });
      }
    }
  } catch (e) {
    console.warn('Save data corrupted, starting fresh.', e);
  }
}

function resetGame() {
  if (!confirm('rip your progress 2026-2026. i hope that 1 rebirth was worth it!')) return;
  localStorage.removeItem(SAVE_KEY);

  clickCount = 0;
  clickPower = 1;
  rebirthCount = 0;
  totalClicksEver = 0;
  manualClickCount = 0;

  shopItems.forEach(i => i.count = 0);
  Object.values(rebirthUpgrades).forEach(u => u.level = 0);

  if (typeof achievements !== 'undefined') {
    achievements.forEach(a => a.unlocked = false);
    achievementCpsBonus   = 0;
    achievementClickBonus = 0;
    if (typeof achievementRebirthBonus !== 'undefined') achievementRebirthBonus = 0;
  }

  if (typeof resetMultMinigame === 'function') resetMultMinigame();

  if (typeof autoBuyUnlocked !== 'undefined') {
    Object.keys(autoBuyUnlocked).forEach(k => { autoBuyUnlocked[k] = false; autoBuyEnabled[k] = true; });
  }

  if (typeof autoRebirthUnlocked !== 'undefined') {
    autoRebirthUnlocked  = false;
    autoRebirthEnabled   = false;
    autoRebirthThreshold = 1_000_000;
  }

  if (typeof ascensionCount !== 'undefined') {
    ascensionCount  = 0;
    ascensionShards = 0;
    Object.values(ascensionUpgrades).forEach(u => u.level = 0);
  }

  updateCps();
  updateDisplay();
  renderRebirthShop();
  renderAchievements();
  if (typeof renderAscensionShop === 'function') renderAscensionShop();
}

// Auto-save every 2.5 seconds
setInterval(saveGame, 2500);