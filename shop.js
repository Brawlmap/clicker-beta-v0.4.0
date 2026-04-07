// data init - loading everything from localstorage
const isFresh = !localStorage.getItem('sim_clicks') && !localStorage.getItem('sim_auto') && !localStorage.getItem('sim_rebirths') && !localStorage.getItem('sim_owned');
if (isFresh) {
    window.clicks = 0;
    window.autoPower = 0;
    window.rebirthCoins = 0;
    window.owned = { t1:0, t2:0, t3:0, t4:0, t5:0, t6:0, t7:0, t8:0, t9:0, t10:0 };
} else {
    window.clicks = parseInt(localStorage.getItem('sim_clicks')) || 0;
    window.autoPower = parseInt(localStorage.getItem('sim_auto')) || 0;
    window.rebirthCoins = parseInt(localStorage.getItem('sim_rebirths')) || 0;
    // Always ensure all tier keys are present in window.owned
    (() => {
        const defaultOwned = { t1:0, t2:0, t3:0, t4:0, t5:0, t6:0, t7:0, t8:0, t9:0, t10:0 };
        let loaded = {};
        try {
            loaded = JSON.parse(localStorage.getItem('sim_owned')) || {};
        } catch (e) {
            loaded = {};
        }
        window.owned = { ...defaultOwned, ...loaded };
    })();
}

// loading rebirth upgrades (important for the speed boost!)
if (isFresh) {
    window.rbUpgrades = { cpsLvl: 0, tierMasteryLvl: 0, autoT1Unlocked: false, autoT1On: false };
} else {
    const savedRbUpgrades = JSON.parse(localStorage.getItem('sim_rb_upgrades')) || {};
    window.rbUpgrades = { cpsLvl: 0, tierMasteryLvl: 0, autoT1Unlocked: false, autoT1On: false, ...savedRbUpgrades };
}

const tiers = [
    { id: 't1', power: 1, cost: 50 },
    { id: 't2', power: 3, cost: 150 },
    { id: 't3', power: 10, cost: 500 },
    { id: 't4', power: 50, cost: 2500 },
    { id: 't5', power: 500, cost: 25000 },
    { id: 't6', power: 1000, cost: 50000 },
    { id: 't7', power: 2000, cost: 100000 },
    { id: 't8', power: 10000, cost: 500000 },
    { id: 't9', power: 25000, cost: 1250000 },
    { id: 't10', power: 50000, cost: 2500000 }
];

// the main UI update function
window.updateUI = function() {
    if (!document.getElementById('balance')) return; // safety check

    document.getElementById('balance').innerText = Math.floor(window.clicks).toLocaleString();
    
    // calculate total cps with rebirth multipliers
    let multiplier = 1 + (window.rbUpgrades.cpsLvl * 0.1) + (window.rbUpgrades.tierMasteryLvl * 0.1);
    document.getElementById('cps').innerText = Math.floor(window.autoPower * multiplier).toLocaleString();
    
    document.getElementById('rebirth-coins').innerText = window.rebirthCoins.toLocaleString();

    // check all tier buttons
    tiers.forEach(t => {
        const btn = document.getElementById(`btn-${t.id}`);
        const count = document.getElementById(`owned-${t.id}`);
        if (btn) btn.disabled = window.clicks < t.cost;
        if (count) count.innerText = window.owned[t.id];
    });

    // check rebirth button
    const rBtn = document.getElementById('rebirth-action');
    if (rBtn) rBtn.disabled = window.clicks < 1000000;

    // save all data
    localStorage.setItem('sim_clicks', window.clicks);
    localStorage.setItem('sim_auto', window.autoPower);
    localStorage.setItem('sim_owned', JSON.stringify(window.owned));
    localStorage.setItem('sim_rebirths', window.rebirthCoins);
};

// global buy function (needed for the auto-buyer in rebirth.js)
window.buy = function(power, price, tierKey) {
    if (window.clicks >= price) {
        window.clicks -= price;
        window.autoPower += power;
        window.owned[tierKey]++;
        window.updateUI();
        return true; 
    }
    return false;
};

// attach click events
document.addEventListener('DOMContentLoaded', () => {
    // manual clicker
    const mainBtn = document.getElementById('clicker');
    if (mainBtn) {
        mainBtn.onclick = () => {
            window.clicks += (1 + window.rebirthCoins); 
            window.updateUI();
        };
    }

    // shop buttons
    tiers.forEach(t => {
        const btn = document.getElementById(`btn-${t.id}`);
        if (btn) {
            btn.onclick = () => {
                window.buy(t.power, t.cost, t.id);
            };
        }
    });

    // rebirth button
    const rBtn = document.getElementById('rebirth-action');
    if (rBtn) {
        rBtn.onclick = () => {
            if (window.clicks >= 1000000) {
                window.rebirthCoins++;
                window.clicks = 0;
                window.autoPower = 0;
                // Always reset all keys on rebirth
                window.owned = { t1:0, t2:0, t3:0, t4:0, t5:0, t6:0, t7:0, t8:0, t9:0, t10:0 };
                window.updateUI();
                if(window.updateRBUI) window.updateRBUI(); 
                alert("bro really just reset his whole life for 1 shiny coin 💀");
            }
        };
    }

    window.updateUI();
});

// smooth game loop (the "insane speed" logic is here)
setInterval(() => {
    if (window.autoPower > 0) {
        let multiplier = 1 + (window.rbUpgrades.cpsLvl * 0.1);
        window.clicks += (window.autoPower * multiplier) / 10;
        window.updateUI();
    }
}, 100);
