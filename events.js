// ─────────────────────────────────────────────
//  Utility
// ─────────────────────────────────────────────
function findById(arr, id) {
  return arr.find(item => item.id === id);
}

// ─────────────────────────────────────────────
//  Field Update Map
//  Every handler reads the active month via M()
//  so edits always land in the correct month.
// ─────────────────────────────────────────────
const FIELD_ACTIONS = {
  // Paychecks
  "pc-label":  (id, v) => findById(M().paychecks, id).label  = v,
  "pc-income": (id, v) => findById(M().paychecks, id).income = v,
  "pc-taxes":  (id, v) => findById(M().paychecks, id).taxes  = v,

  // Additional income
  "inc-item": (id, v) => findById(M().addlIncome, id).item   = v,
  "inc-amt":  (id, v) => findById(M().addlIncome, id).amount = v,

  // Additional taxes
  "tax-item": (id, v) => findById(M().addlTaxes, id).item   = v,
  "tax-amt":  (id, v) => findById(M().addlTaxes, id).amount = v,

  // Expenses
  "exp-item":   (id, v) => findById(M().expenses, id).item     = v,
  "exp-amt":    (id, v) => findById(M().expenses, id).amount   = v,
  "exp-budget": (id, v) => findById(M().expenses, id).budgetId = v ? parseInt(v) : null,

  // Budgeted categories (real is computed — not editable)
  "bud-item": (id, v) => findById(M().budgeted, id).item = v,
  "bud-est":  (id, v) => findById(M().budgeted, id).est  = v,
};

// ─────────────────────────────────────────────
//  Add / Delete Action Map
// ─────────────────────────────────────────────
const CLICK_ACTIONS = {
  // Add rows
  "add-pc":  () => M().paychecks.push({ id: uid(), label: `Paycheck ${M().paychecks.length + 1}`, income: "", taxes: "" }),
  "add-inc": () => M().addlIncome.push({ id: uid(), item: "", amount: "" }),
  "add-tax": () => M().addlTaxes.push({ id: uid(), item: "", amount: "" }),
  "add-exp": () => M().expenses.push({ id: uid(), item: "", amount: "", budgetId: null }),
  "add-bud": () => M().budgeted.push({ id: uid(), item: "", est: "" }),

  // Delete rows
  "del-pc":  (id) => { M().paychecks  = M().paychecks.filter(p  => p.id  !== id); },
  "del-inc": (id) => { M().addlIncome = M().addlIncome.filter(i => i.id  !== id); },
  "del-tax": (id) => { M().addlTaxes  = M().addlTaxes.filter(t  => t.id  !== id); },
  "del-exp": (id) => { M().expenses   = M().expenses.filter(e   => e.id  !== id); },
  "del-bud": (id) => { M().budgeted   = M().budgeted.filter(b   => b.id  !== id); },
};

// ─────────────────────────────────────────────
//  Event Listeners
// ─────────────────────────────────────────────

// Month selector — update currentMonth, M() will lazy-create if new
document.getElementById("monthSel").addEventListener("change", e => {
  S.currentMonth = e.target.value;
  render();
});

// Income panel toggle — stored per month
document.getElementById("incomeToggle").addEventListener("click", () => {
  M().incomeOpen = !M().incomeOpen;
  render();
});

// Add expense (header button outside delegated area)
document.getElementById("addExpBtn").addEventListener("click", () => {
  M().expenses.push({ id: uid(), item: "", amount: "", budgetId: null });
  render();
});

// Add budgeted line (header button outside delegated area)
document.getElementById("addBudBtn").addEventListener("click", () => {
  M().budgeted.push({ id: uid(), item: "", est: "" });
  render();
});

// Delegated change handler (inputs & selects inside dynamic lists)
document.addEventListener("change", e => {
  const action = e.target.dataset.a;
  const id     = parseInt(e.target.dataset.id);
  if (!action || !FIELD_ACTIONS[action]) return;
  FIELD_ACTIONS[action](id, e.target.value);
  render();
});

// Delegated click handler (add/delete buttons inside dynamic lists)
document.addEventListener("click", e => {
  const action = e.target.dataset.a;
  const id     = parseInt(e.target.dataset.id);
  if (!action || !CLICK_ACTIONS[action]) return;
  CLICK_ACTIONS[action](id);
  render();
});