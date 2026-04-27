// ─────────────────────────────────────────────
//  HTML Builders  (return HTML strings)
// ─────────────────────────────────────────────

function buildMonthOptions() {
  return MONTHS
    .map(m => `<option ${m === S.month ? "selected" : ""}>${m}</option>`)
    .join("");
}

function buildOverview(t) {
  const cards = [
    { label: "net income",  value: fmt(t.netIncome),      cls: "green"   },
    { label: "taxes",       value: fmt(t.grossTaxes),     cls: "red"     },
    { label: "total out",   value: fmt(t.totalExpenses),  cls: "neutral" },
    {
      label: "remaining",
      value: (t.remaining < 0 ? "−" : "") + fmt(t.remaining),
      cls: "lav",
    },
  ];

  return cards
    .map(c => `
      <div class="pill">
        <div class="pill-label">${c.label}</div>
        <div class="pill-value ${c.cls}">${c.value}</div>
      </div>`)
    .join("");
}

function buildPaycheckRows() {
  return S.paychecks
    .map(p => `
      <div class="inc-row">
        <input type="text"   value="${p.label}"  placeholder="Label"  data-a="pc-label"  data-id="${p.id}" />
        <input type="number" value="${p.income}" placeholder="0.00"   data-a="pc-income" data-id="${p.id}" />
        <input type="number" value="${p.taxes}"  placeholder="0.00"   data-a="pc-taxes"  data-id="${p.id}" />
        <button class="del-btn" data-a="del-pc" data-id="${p.id}">×</button>
      </div>`)
    .join("");
}

function buildAddlRows(items, aItem, aAmt, aDel) {
  if (items.length === 0) return `<div class="empty">none</div>`;
  return items
    .map(i => `
      <div class="inc-row-2">
        <input type="text"   value="${i.item}"   placeholder="Item"  data-a="${aItem}" data-id="${i.id}" />
        <input type="number" value="${i.amount}" placeholder="0.00"  data-a="${aAmt}"  data-id="${i.id}" />
        <button class="del-btn" data-a="${aDel}" data-id="${i.id}">×</button>
      </div>`)
    .join("");
}

function buildIncomePanel() {
  return `
    <div class="sub-section">
      <div class="sub-title">paychecks</div>
      <div class="inc-row">
        <span class="col-head">label</span>
        <span class="col-head">income</span>
        <span class="col-head">taxes</span>
        <span></span>
      </div>
      ${buildPaycheckRows()}
      <button class="btn btn-soft" style="margin-top:8px;font-size:10px" data-a="add-pc">+ add paycheck</button>
    </div>

    <div class="addl-grid">
      <div class="sub-section">
        <div class="sub-title">
          additional income
          <button class="btn btn-soft" style="font-size:10px;padding:2px 10px" data-a="add-inc">+</button>
        </div>
        ${buildAddlRows(S.addlIncome, "inc-item", "inc-amt", "del-inc")}
      </div>
      <div class="sub-section">
        <div class="sub-title">
          additional taxes
          <button class="btn btn-soft" style="font-size:10px;padding:2px 10px" data-a="add-tax">+</button>
        </div>
        ${buildAddlRows(S.addlTaxes, "tax-item", "tax-amt", "del-tax")}
      </div>
    </div>`;
}

function buildBudgetLineOptions(selectedId) {
  const noneOpt = `<option value="">— unassigned —</option>`;
  const lineOpts = S.budgeted
    .map(b => `<option value="${b.id}" ${b.id === selectedId ? "selected" : ""}>${b.item || "unnamed"}</option>`)
    .join("");
  return noneOpt + lineOpts;
}

function buildExpenseRows() {
  if (S.expenses.length === 0) {
    return `<div class="empty" style="padding:12px 0">no expenses yet — add one above</div>`;
  }
  return S.expenses
    .map(e => {
      const budIdx = S.budgeted.findIndex(b => b.id === e.budgetId);
      const dotColor = budIdx >= 0 ? budgetLineColor(budIdx) : "#ccc";
      return `
        <div class="exp-row">
          <div class="exp-item-cell">
            <span class="cat-dot" style="background:${dotColor}; margin-right:6px"></span>
            <input type="text" value="${e.item}" placeholder="Item" data-a="exp-item" data-id="${e.id}" />
          </div>
          <input type="number" value="${e.amount}" placeholder="0.00" data-a="exp-amt" data-id="${e.id}" />
          <select class="cat-sel" data-a="exp-budget" data-id="${e.id}">
            ${buildBudgetLineOptions(e.budgetId)}
          </select>
          <button class="del-btn" data-a="del-exp" data-id="${e.id}">×</button>
        </div>`;
    })
    .join("");
}

function buildBudgetedRows() {
  return S.budgeted
    .map((b, idx) => {
      const est  = parseFloat(b.est)  || 0;
      const real = parseFloat(b.real) || 0;
      const diff = est - real;
      const diffCls  = diff >= 0 ? "diff-pos" : "diff-neg";
      const diffText = (diff >= 0 ? "+" : "−") + Math.abs(diff).toFixed(0);
      const dotColor = budgetLineColor(idx);
      return `
        <div class="bud-row">
          <div style="display:flex;align-items:center;gap:6px;min-width:0">
            <span class="cat-dot" style="background:${dotColor};flex-shrink:0"></span>
            <input type="text" value="${b.item}" placeholder="Category" data-a="bud-item" data-id="${b.id}" style="font-size:12px" />
          </div>
          <input type="number" value="${b.est}" placeholder="0" data-a="bud-est" data-id="${b.id}" />
          <div class="bud-real-val" title="auto-calculated from expenses">
            ${real > 0 ? fmt(real) : '<span class="bud-real-empty">—</span>'}
          </div>
          <div class="diff-pill ${diffCls}">${diffText}</div>
          <button class="del-btn" data-a="del-bud" data-id="${b.id}">×</button>
        </div>`;
    })
    .join("");
}

// ─────────────────────────────────────────────
//  Main Render
// ─────────────────────────────────────────────
function render() {
  computeBudgetedReals(S);
  saveState(S);
  const t = calcTotals(S);

  // Month select
  const monthSel = document.getElementById("monthSel");
  if (!monthSel.children.length) {
    monthSel.innerHTML = buildMonthOptions();
  }
  monthSel.value = S.month;

  // Overview
  document.getElementById("overview").innerHTML = buildOverview(t);

  // Income toggle summary text
  document.getElementById("incSub").textContent =
    `${fmt(t.netIncome)} net · ${fmt(t.grossTaxes)} in taxes`;

  // Income toggle open/close state
  const toggle = document.getElementById("incomeToggle");
  const panel  = document.getElementById("incomePanel");
  toggle.classList.toggle("open", S.incomeOpen);
  toggle.setAttribute("aria-expanded", S.incomeOpen);
  panel.classList.toggle("open", S.incomeOpen);
  panel.setAttribute("aria-hidden", !S.incomeOpen);
  if (S.incomeOpen) panel.innerHTML = buildIncomePanel();

  // Expenses
  document.getElementById("expList").innerHTML = buildExpenseRows();
  const expTotal = document.getElementById("expTotal");
  expTotal.textContent  = fmt(t.totalExpenses);
  expTotal.style.color  = t.totalExpenses > 0 ? "var(--negative)" : "var(--ink3)";

  // Budgeted
  document.getElementById("budList").innerHTML = buildBudgetedRows();
  document.getElementById("budTotal").textContent = `${fmt(t.budgetedEst)} est`;

  // Remaining card
  const remainVal  = document.getElementById("remainingVal");
  const remainNote = document.getElementById("remainingNote");
  const remainBar  = document.getElementById("remainBar");

  remainVal.textContent = (t.remaining < 0 ? "−" : "") + fmt(t.remaining);
  remainVal.style.color = t.remaining >= 0 ? "var(--positive)" : "var(--negative)";

  if (t.netIncome > 0) {
    const pct = Math.max(0, Math.min(100, (t.remaining / t.netIncome) * 100));
    remainNote.textContent  = `${pct.toFixed(0)}% of net income left`;
    remainBar.style.width   = pct + "%";
    remainBar.style.background =
      pct > 30 ? "var(--sage2)" :
      pct > 10 ? "var(--blush2)" :
      "var(--negative)";
  } else {
    remainNote.textContent = "enter income above";
    remainBar.style.width  = "0%";
  }
}