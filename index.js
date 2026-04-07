let clickCount = 0;
let cps = 0;
let clickPower = 1;
let buyMultiplier = 1; // can be 1, 10, 25, 50, 100, or 'max'

const clicksDisplay = document.querySelector('.clicks-cost');
const rebirthDisplay = document.getElementById('rebirth-display');
const cpsDisplay = document.getElementById('cps');

const shopItems = [
  { id: 't1', name: 'tier 1',   cps: 1,        baseCost:    50,           count: 0 },
  { id: 't2', name: 'tier 2',   cps: 3,        baseCost:    150,          count: 0 },
  { id: 't3', name: 'tier 3',   cps: 10,       baseCost:    500,          count: 0 },
  { id: 't4', name: 'tier 4',   cps: 50,       baseCost:    2500,         count: 0 },
  { id: 't5', name: 'tier 5',   cps: 150,      baseCost:    10000,        count: 0 },
  { id: 't6', name: 'tier 6',   cps: 500,      baseCost:    40000,        count: 0 },
  { id: 't7', name: 'tier 7',   cps: 2000,     baseCost:    150000,       count: 0 },
  { id: 't8', name: 'tier 8',   cps: 7500,     baseCost:    500000,       count: 0 },
  { id: 't9', name: 'tier 9',   cps: 25000,    baseCost:    2000000,      count: 0 },
  { id: 't10', name: 'tier 10', cps: 100000,   baseCost:    10000000,     count: 0 },
  { id: 't11', name: 'tier 11', cps: 200000,   baseCost:    20000000,     count: 0 },
  { id: 't12', name: 'tier 12', cps: 500000,   baseCost:    50000000,     count: 0 },
];

// logic for switching multipliers
function setMultiplier(val) {
  buyMultiplier = val;
  // update button visuals (assumes you have .mult-btn classes in html)
  document.querySelectorAll('.mult-btn').forEach(btn => {
    const btnText = btn.textContent.toLowerCase();
    const targetText = val === 'max' ? 'max' : val + 'x';
    btn.classList.toggle('active', btnText === targetText);
  });
  updateDisplay();
}

// calculates total cost for multiple purchases based on exponential scaling
function getPurchaseInfo(item, amount) {
  const discount = (typeof getAscensionShopDiscount === 'function') ? getAscensionShopDiscount() : 0;
  const discountMult = 1 - discount;
  let totalCost = 0;
  let itemsToBuy = 0;
  let tempCount = item.count;

  if (amount === 'max') {
    while (true) {
      let nextCost = Math.max(1, Math.floor(item.baseCost * Math.pow(1.15, tempCount + itemsToBuy) * discountMult));
      if (totalCost + nextCost <= clickCount) {
        totalCost += nextCost;
        itemsToBuy++;
      } else {
        break;
      }
    }
  } else {
    itemsToBuy = amount;
    for (let i = 0; i < amount; i++) {
      totalCost += Math.max(1, Math.floor(item.baseCost * Math.pow(1.15, tempCount + i) * discountMult));
    }
  }

  return { cost: totalCost, count: itemsToBuy };
}

function formatNum(n) {
  if (isNaN(n) || !isFinite(n)) return isNaN(n) ? '???' : '∞';
  if (n < 0) return '-' + formatNum(-n);
  if (n >= 1e303) return (n / 1e303).toFixed(2) + 'Ce'; // centillion range
  if (n >= 1e63) return (n / 1e63).toFixed(2) + 'Vi';
  if (n >= 1e60) return (n / 1e60).toFixed(2) + 'NoDe';
  if (n >= 1e57) return (n / 1e57).toFixed(2) + 'OcDe';
  if (n >= 1e54) return (n / 1e54).toFixed(2) + 'SpDe';
  if (n >= 1e51) return (n / 1e51).toFixed(2) + 'SxDe';
  if (n >= 1e48) return (n / 1e48).toFixed(2) + 'QnDe';
  if (n >= 1e45) return (n / 1e45).toFixed(2) + 'QuDe';
  if (n >= 1e42) return (n / 1e42).toFixed(2) + 'TrDe';
  if (n >= 1e39) return (n / 1e39).toFixed(2) + 'DuDe';
  if (n >= 1e36) return (n / 1e36).toFixed(2) + 'UnDe';
  if (n >= 1e33) return (n / 1e33).toFixed(2) + 'De';
  if (n >= 1e30) return (n / 1e30).toFixed(2) + 'No';
  if (n >= 1e27) return (n / 1e27).toFixed(2) + 'Oc';
  if (n >= 1e24) return (n / 1e24).toFixed(2) + 'Sp';
  if (n >= 1e21) return (n / 1e21).toFixed(2) + 'Sx';
  if (n >= 1e18) return (n / 1e18).toFixed(2) + 'Qi';
  if (n >= 1e15) return (n / 1e15).toFixed(2) + 'Qd';
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6)  return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3)  return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

function updateCps() {
  const base = shopItems.reduce((sum, i) => sum + i.cps * i.count, 0);
  const rebirthMult = (typeof rebirthUpgrades !== 'undefined')
    ? rebirthUpgrades.insaneCps.getMultiplier()
    : 1;
  const achMult = (typeof achievementCpsBonus !== 'undefined')
    ? (1 + achievementCpsBonus)
    : 1;
  cps = base * rebirthMult * achMult;
}

function updateDisplay() {
  clicksDisplay.textContent = formatNum(Math.floor(clickCount));
  if (rebirthDisplay) rebirthDisplay.textContent = formatNum(rebirthCount);
  cpsDisplay.textContent = formatNum(cps);
  const ascDisplay = document.getElementById('ascension-display');
  if (ascDisplay) ascDisplay.textContent = typeof ascensionCount !== 'undefined' ? formatNum(ascensionCount) : '0';

  shopItems.forEach(item => {
    const card = document.querySelector(`.tier-card[data-id="${item.id}"]`);
    if (!card) return;

    const purchase = getPurchaseInfo(item, buyMultiplier);
    const canAfford = clickCount >= purchase.cost && purchase.count > 0;

    card.classList.toggle('tier-locked', !canAfford);
    const buyBtn = card.querySelector('.tier-buy-btn');
    buyBtn.classList.toggle('buyable', canAfford);
    
    // show how many you are buying if using 'max'
    const label = buyMultiplier === 'max' ? `buy (${purchase.count})` : 'buy';
    buyBtn.textContent = label;

    // show the total cost for the stack
    // always show the real single-item cost when can't afford the full stack
    const displayCost = purchase.count > 0
      ? purchase.cost
      : Math.max(1, Math.floor(item.baseCost * Math.pow(1.15, item.count) * (1 - ((typeof getAscensionShopDiscount === 'function') ? getAscensionShopDiscount() : 0))));
    const displayCps  = item.cps * (purchase.count || 1);
    card.querySelector('.tier-stats').textContent = `+${formatNum(displayCps)} cps | ${formatNum(displayCost)}`;
    
    const ownedEl = card.querySelector('.tier-owned');
    ownedEl.textContent = `owned: ${item.count}`;
    ownedEl.classList.toggle('has-owned', item.count > 0);
  });

  if (typeof updateRebirthCenter === 'function') {
    updateRebirthCenter();
  }
}

function renderShop() {
  const container = document.getElementById('shop-items');
  if (!container) return;
  container.innerHTML = shopItems.map(item => {
    return `
      <div class="tier-card" data-id="${item.id}">
        <div class="tier-name">${item.name}</div>
        <div class="tier-stats">loading...</div>
        <button class="tier-buy-btn">buy</button>
        <div class="tier-owned">owned: 0</div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.tier-card').forEach(card => {
    card.querySelector('.tier-buy-btn').addEventListener('click', () => {
      buyItem(card.dataset.id);
    });
  });
}

function buyItem(id) {
  const item = shopItems.find(i => i.id === id);
  if (!item) return;

  const purchase = getPurchaseInfo(item, buyMultiplier);
  if (clickCount < purchase.cost || purchase.count <= 0) return;

  clickCount -= purchase.cost;
  item.count += purchase.count;
  
  updateCps();
  updateDisplay();
  if (typeof saveGame === 'function') saveGame();
}

function increaseClicks() {
  const achBonus  = (typeof achievementClickBonus !== 'undefined') ? achievementClickBonus : 0;
  const multBonus = (typeof getEffectiveMultiplier === 'function') ? getEffectiveMultiplier() : 1;
  const ascBonus  = (typeof getAscensionClickMult === 'function') ? getAscensionClickMult() : 1;
  const rbClickMult = (typeof rebirthUpgrades !== 'undefined' && rebirthUpgrades.clickPowerRB)
    ? rebirthUpgrades.clickPowerRB.getMultiplier() : 1;
  const stormBonus = (typeof rebirthUpgrades !== 'undefined' && rebirthUpgrades.clickStorm)
    ? cps * rebirthUpgrades.clickStorm.getClickCpsBonus() : 0;
  const effective = clickPower * (1 + achBonus) * multBonus * ascBonus * rbClickMult;
  clickCount += effective + stormBonus;
  totalClicksEver += effective + stormBonus;
  manualClickCount++;

  // gain multiplier currency on every manual click
  if (typeof gainMultiplierOnClick === 'function') gainMultiplierOnClick();

  updateDisplay();
  if (typeof renderMultMinigame === 'function') renderMultMinigame();
  if (typeof saveGame === 'function') saveGame();

  const btn = document.getElementById('clicks');
  btn.classList.remove('pop');
  void btn.offsetWidth;
  btn.classList.add('pop');
}

setInterval(() => {
  if (cps > 0 && isFinite(cps)) {
    const gain = cps / 20;
    if (isFinite(gain)) clickCount += gain;
    updateDisplay();
  }
}, 50);

let lastTime = Date.now();

// fixed freeze: everything continues running when tab is hidden 

function updateCpsRealTime() {
  const now = Date.now();
  const delta = Math.min(now - lastTime, 5000); // cap delta to 5s to avoid huge catch-up spikes
  lastTime = now;

  if (cps > 0 && isFinite(cps)) {
    const gain = cps * (delta / 1000);
    if (isFinite(gain)) {
      clickCount += gain;
      totalClicksEver += gain;
    }
    updateDisplay();
  }

  // safety net — if clickCount somehow overflows, cap it instead of zeroing
  if (isNaN(clickCount)) clickCount = 0;
  else if (!isFinite(clickCount)) clickCount = Number.MAX_VALUE;

  requestAnimationFrame(updateCpsRealTime);
}

updateCpsRealTime();

// ── setmultiplier ───────────────────────────────────────────────────────────

function setmultiplier(val) {
  buymultiplier = val;
  document.queryselectorall('.mult-btn').foreach(btn => {
    const btntext = btn.textcontent.tolowercase();
    const targettext = val === 'max' ? 'max' : val + 'x';
    btn.classlist.toggle('active', btntext === targettext);
  });
  updatedisplay();
  if (typeof renderrebirthshop === 'function') renderrebirthshop(); 
}

// ── achievements ───────────────────────────────────────────────────────────

/* nightstarv clicker

© 2026 YourName. All Rights Reserved.

This project is public to play, but the code may not be copied or reused without permission. */