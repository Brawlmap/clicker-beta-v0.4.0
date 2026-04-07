// ── Supabase configuration ───────────────────────────────────────────────────
// FIXED: Using Supabase JS client library (install: npm install @supabase/supabase-js)
// This uses the official SDK which handles JWT tokens properly
import { createClient } from '@supabase/supabase-js';

const SB_URL = 'https://hrmnvtbpjjpsxmhtacgz.supabase.co';
const SB_KEY = 'sb_publishable_jlbV4rkPHukjiGew8jV9Mw_k2Mo4_rg';

const supabase = createClient(SB_URL, SB_KEY);

// ── Session management ───────────────────────────────────────────────────────
const SESSION_KEY = 'ns_clicker_session';
let currentUser = null;

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setSession(session) {
  currentUser = session?.user || null;
  if (session) {
    // Store entire session including JWT token
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      user: session.user,
      access_token: session.session?.access_token,
      refresh_token: session.session?.refresh_token,
    }));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

// ── Server-side value sanity caps ─────────────────────────────────────────────
// FIXED: Values are capped before ANY cloud write
const STAT_CAPS = {
  clicks:     1e60,   // up to Vi range which formatNum supports
  rebirths:   1e60,
  ascensions: 1e12,
};

const SANE_CLICK_CAP = 1e60;

function sanitiseStats(clicks, rebirths, ascensions) {
  return {
    clicks:     Math.max(0, Math.min(STAT_CAPS.clicks,     isFinite(clicks)     ? Math.floor(clicks)     : 0)),
    rebirths:   Math.max(0, Math.min(STAT_CAPS.rebirths,   isFinite(rebirths)   ? Math.floor(rebirths)   : 0)),
    ascensions: Math.max(0, Math.min(STAT_CAPS.ascensions, isFinite(ascensions) ? Math.floor(ascensions) : 0)),
  };
}

// ── NEW FIX: Validate stats in real-time (every 5 seconds) ─────────────────────
// This catches injected localStorage values immediately
function validateLocalStats() {
  // Reject non-finite values
  if (!isFinite(clickCount)) clickCount = 0;
  if (!isFinite(rebirthCount)) rebirthCount = 0;
  if (typeof ascensionCount !== 'undefined' && !isFinite(ascensionCount)) ascensionCount = 0;
  
  // Reject negative values
  if (clickCount < 0) clickCount = 0;
  if (rebirthCount < 0) rebirthCount = 0;
  if (typeof ascensionCount !== 'undefined' && ascensionCount < 0) ascensionCount = 0;
  
  // Hard caps (prevent overflow)
  clickCount = Math.min(clickCount, STAT_CAPS.clicks);
  rebirthCount = Math.min(rebirthCount, STAT_CAPS.rebirths);
  if (typeof ascensionCount !== 'undefined') {
    ascensionCount = Math.min(ascensionCount, STAT_CAPS.ascensions);
  }
}

// Run validation every 5 seconds
setInterval(validateLocalStats, 5000);

// ── Build game_data snapshot ──────────────────────────────────────────────────
function buildGameData() {
  return {
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
}

function applyGameData(data) {
  if (!data) return;
  if (data.clickCount) clickCount = clampStat(data.clickCount, STAT_CAPS.clicks);
  if (data.clickPower) clickPower = clampStat(data.clickPower, 1e12, 1);
  if (data.rebirthCount) rebirthCount = clampStat(data.rebirthCount, STAT_CAPS.rebirths);
  if (data.totalClicksEver && typeof totalClicksEver !== 'undefined')
    totalClicksEver = clampStat(data.totalClicksEver, STAT_CAPS.clicks);
  if (data.manualClickCount && typeof manualClickCount !== 'undefined')
    manualClickCount = clampStat(data.manualClickCount, STAT_CAPS.clicks);

  if (data.items) {
    data.items.forEach(saved => {
      const item = shopItems.find(i => i.id === saved.id);
      if (item) item.count = clampStat(saved.count, 1e20);
    });
  }

  if (data.rebirthUpgradeLevels) {
    Object.entries(data.rebirthUpgradeLevels).forEach(([k, lvl]) => {
      if (rebirthUpgrades[k])
        rebirthUpgrades[k].level = clampStat(lvl, 1e6);
    });
  }

  if (data.achievementsUnlocked && typeof achievements !== 'undefined') {
    achievementCpsBonus = 0;
    achievementClickBonus = 0;
    data.achievementsUnlocked.forEach(id => {
      const ach = achievements.find(a => a.id === id);
      if (ach) {
        ach.unlocked = true;
        ach.onUnlock();
      }
    });
  }

  if (data.multMinigame && typeof clickMultiplier !== 'undefined') {
    clickMultiplier = Math.max(1, Number(data.multMinigame.clickMultiplier) || 1);
    multCurrency    = Math.max(0, Number(data.multMinigame.multCurrency)    || 0);
    if (data.multMinigame.upgradeLevels) {
      multUpgrades.forEach(u => {
        u.level = clampStat(data.multMinigame.upgradeLevels[u.id], 1e6);
      });
    }
  }

  if (data.autoBuy && typeof autoBuyUnlocked !== 'undefined') {
    Object.assign(autoBuyUnlocked, data.autoBuy.unlocked || {});
    Object.assign(autoBuyEnabled,  data.autoBuy.enabled  || {});
  }

  if (data.autoRebirth && typeof autoRebirthUnlocked !== 'undefined') {
    autoRebirthUnlocked  = !!data.autoRebirth.unlocked;
    autoRebirthEnabled   = !!data.autoRebirth.enabled;
    autoRebirthThreshold = clampStat(data.autoRebirth.threshold, 1e60, 1_000_000);
  }

  if (data.ascension && typeof ascensionCount !== 'undefined') {
    ascensionCount  = clampStat(data.ascension.count,  1e12);
    ascensionShards = clampStat(data.ascension.shards, 1e15);
    if (data.ascension.upgradeLevels) {
      Object.entries(data.ascension.upgradeLevels).forEach(([k, lvl]) => {
        if (ascensionUpgrades[k])
          ascensionUpgrades[k].level = clampStat(lvl, 1e6);
      });
    }
  }
}

function clampStat(val, cap, fallback = 0) {
  const n = Number(val);
  if (!isFinite(n) || isNaN(n) || n < 0) return fallback;
  return Math.min(Math.floor(n), cap);
}

// ── Authentication: Sign Up ───────────────────────────────────────────────────
// FIXED: Uses Supabase Auth instead of manual password hashing
async function accountSignUp(username, password) {
  if (!username || !password) return { ok: false, error: 'missing fields' };
  if (password.length < 6) return { ok: false, error: 'password too short' };
  if (username.length < 3) return { ok: false, error: 'username too short' };

  try {
    // Use Supabase Auth (handles bcrypt + salt internally)
    const { data, error } = await supabase.auth.signUp({
      email: `${username}@clicker.local`, // Use as username
      password: password,
      options: {
        data: { username: username } // Store username in metadata
      }
    });

    if (error) return { ok: false, error: error.message };
    
    // Create player record
    const { error: dbError } = await supabase
      .from('players')
      .insert({
        id: data.user?.id,
        username: username,
        user_id: data.user?.id, // FIX: Link to auth user
        clicks: 0,
        rebirths: 0,
        ascensions: 0,
        game_data: null,
        created_at: new Date().toISOString(),
      });

    if (dbError) return { ok: false, error: dbError.message };

    // Auto-login after signup
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: `${username}@clicker.local`,
      password: password,
    });

    if (signInError) return { ok: false, error: signInError.message };
    
    setSession(signInData);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ── Authentication: Sign In ───────────────────────────────────────────────────
// FIXED: Uses Supabase Auth JWT tokens
async function accountLogin(username, password) {
  if (!username || !password) return { ok: false, error: 'missing fields' };

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username}@clicker.local`,
      password: password,
    });

    if (error) return { ok: false, error: error.message };
    
    setSession(data);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ── Authentication: Logout ────────────────────────────────────────────────────
async function accountLogout() {
  const { error } = await supabase.auth.signOut();
  setSession(null);
  if (error) console.error('Logout error:', error);
}

// ── Cloud save (push local → Supabase) ───────────────────────────────────────
// FIXED: Validates stats AND uses JWT authentication
async function cloudSave() {
  if (!currentUser) return;

  // FIXED: Always validate before saving
  validateLocalStats();

  // Cap any tampered values
  if (clickCount > SANE_CLICK_CAP) clickCount = SANE_CLICK_CAP;
  if (rebirthCount > STAT_CAPS.rebirths) rebirthCount = STAT_CAPS.rebirths;
  if (typeof ascensionCount !== 'undefined' && ascensionCount > STAT_CAPS.ascensions)
    ascensionCount = STAT_CAPS.ascensions;

  const safe = sanitiseStats(clickCount, rebirthCount,
    typeof ascensionCount !== 'undefined' ? ascensionCount : 0);

  const gameData = buildGameData();

  try {
    // FIXED: Using Supabase JS client (handles JWT automatically)
    const { error } = await supabase
      .from('players')
      .update({
        clicks:      safe.clicks,
        rebirths:    safe.rebirths,
        ascensions:  safe.ascensions,
        game_data:   gameData,
        updated_at:  new Date().toISOString(),
      })
      .eq('id', currentUser.id); // RLS will verify this is your own record

    if (error) {
      console.error('Cloud save error:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Cloud save exception:', e);
    return false;
  }
}

// Auto cloud-save every 15 seconds when logged in
setInterval(() => { if (currentUser) cloudSave(); }, 15000);

// ── Manual cloud save button ──────────────────────────────────────────────────
async function cloudSaveManual() {
  const btn = document.querySelector('.acc-btn-save');
  if (btn) { btn.textContent = 'saving...'; btn.disabled = true; }
  const success = await cloudSave();
  if (btn) {
    btn.textContent = success ? '✅ saved!' : '❌ failed';
    setTimeout(() => { btn.textContent = '☁️ save now'; btn.disabled = false; }, 2000);
  }
}

// ── Render into settings panel ────────────────────────────────────────────────
function renderAccountPanel() { renderSettingsPanel(); }

function renderSettingsPanel() {
  const container = document.getElementById('account-panel');
  if (!container) return;

  if (currentUser) {
    const displayName = currentUser.user_metadata?.username || currentUser.email || 'Player';
    container.innerHTML = `
      <div class="acc-card">
        <div class="acc-title">👤 ${displayName}</div>
        <div class="acc-desc">progress is synced to the cloud every 15 seconds</div>
        <div class="acc-stat-row">
          <span class="acc-stat-label">clicks</span>
          <span class="acc-stat-val">${formatNum(Math.floor(clickCount))}</span>
        </div>
        <div class="acc-stat-row">
          <span class="acc-stat-label">rebirths</span>
          <span class="acc-stat-val">${formatNum(rebirthCount)}</span>
        </div>
        <div class="acc-stat-row">
          <span class="acc-stat-label">ascensions</span>
          <span class="acc-stat-val" style="color:#f59e0b;">${typeof ascensionCount !== 'undefined' ? ascensionCount : 0}</span>
        </div>
        <button class="acc-btn acc-btn-save" onclick="cloudSaveManual()">☁️ save now</button>
        <button class="acc-btn acc-btn-logout" onclick="accountLogout(); location.reload();">🚪 logout</button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="acc-card">
        <div class="acc-title">👤 account</div>
        <div class="acc-desc">sign in to save progress to the cloud &amp; appear on the leaderboard.</div>
        <div id="acc-error" class="acc-error hidden"></div>

        <div class="acc-tabs">
          <button class="acc-tab active" id="acc-tab-login" onclick="switchAccTab('login')">login</button>
          <button class="acc-tab" id="acc-tab-signup" onclick="switchAccTab('signup')">create account</button>
        </div>

        <div id="acc-form-login" class="acc-form">
          <input class="acc-input" id="acc-login-user" type="text" placeholder="username" autocomplete="username" />
          <input class="acc-input" id="acc-login-pass" type="password" placeholder="password" autocomplete="current-password" />
          <button class="acc-btn acc-btn-primary" id="acc-login-btn" onclick="handleLogin()">login</button>
        </div>

        <div id="acc-form-signup" class="acc-form hidden">
          <input class="acc-input" id="acc-signup-user" type="text" placeholder="username (3+ chars)" autocomplete="username" />
          <input class="acc-input" id="acc-signup-pass" type="password" placeholder="password (6+ chars)" autocomplete="new-password" />
          <button class="acc-btn acc-btn-primary" id="acc-signup-btn" onclick="handleSignUp()">create account</button>
        </div>
      </div>
    `;
  }
}

function switchAccTab(tab) {
  document.getElementById('acc-tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('acc-tab-signup').classList.toggle('active', tab === 'signup');
  document.getElementById('acc-form-login').classList.toggle('hidden', tab !== 'login');
  document.getElementById('acc-form-signup').classList.toggle('hidden', tab !== 'signup');
  clearAccError();
}

function showAccError(msg) {
  const el = document.getElementById('acc-error');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}

function clearAccError() {
  const el = document.getElementById('acc-error');
  if (el) el.classList.add('hidden');
}

function setAccLoading(loading, mode) {
  const btnId = mode === 'signup' ? 'acc-signup-btn' : 'acc-login-btn';
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'loading...' : (mode === 'signup' ? 'create account' : 'login');
}

async function handleLogin() {
  clearAccError();
  const username = document.getElementById('acc-login-user')?.value.trim();
  const password = document.getElementById('acc-login-pass')?.value;
  setAccLoading(true, 'login');
  const res = await accountLogin(username, password);
  setAccLoading(false, 'login');
  if (!res.ok) { showAccError(res.error); return; }
  renderSettingsPanel();
  location.reload(); // Reload to sync cloud data
}

async function handleSignUp() {
  clearAccError();
  const username = document.getElementById('acc-signup-user')?.value.trim();
  const password = document.getElementById('acc-signup-pass')?.value;
  setAccLoading(true, 'signup');
  const res = await accountSignUp(username, password);
  setAccLoading(false, 'signup');
  if (!res.ok) { showAccError(res.error); return; }
  renderSettingsPanel();
  location.reload();
}

// ── Init: restore session on page load ───────────────────────────────────────
(async function initAccount() {
  // Check if user is logged in via Supabase
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    currentUser = session.user;
    
    // Load cloud save data
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id,username,game_data,clicks,rebirths,ascensions')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.error('Failed to load player data:', error);
        return;
      }

      if (data && data.game_data) {
        applyGameData(data.game_data);
        validateLocalStats(); // Safety check
      }

      updateCps();
      updateDisplay();
      renderShop();
      renderRebirthShop();
      if (typeof renderAchievements === 'function') renderAchievements();
      if (typeof renderMultMinigame === 'function') renderMultMinigame();
      if (typeof renderAscensionShop === 'function') renderAscensionShop();
    } catch (e) {
      console.warn('Failed to load cloud save on init:', e);
    }
  }
  
  renderSettingsPanel();
})();

// ── Listen for auth state changes ─────────────────────────────────────────────
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    currentUser = session.user;
    renderSettingsPanel();
  } else if (event === 'SIGNED_OUT') {
    currentUser = null;
    renderSettingsPanel();
  }
});