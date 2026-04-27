// ─────────────────────────────────────────────
//  Field Update Map
//  Maps a data-a action string → state mutation
// ─────────────────────────────────────────────
const FIELD_ACTIONS = {
  // Paychecks
  "pc-label":  (id, v) => findById(S.paychecks, id).label  = v,
  "pc-income": (id, v) => findById(S.paychecks, id).income = v,
  "pc-taxes":  (id, v) => findById(S.paychecks, id).taxes  = v,

  // Additional income
  "inc-item": (id, v) => findById(S.addlIncome, id).item   = v,
  "inc-amt":  (id, v) => findById(S.addlIncome, id).amount = v,

  // Additional taxes
  "tax-item": (id, v) => findById(S.addlTaxes, id).item   = v,
  "tax-amt":  (id, v) => findById(S.addlTaxes, id).amount = v,

  // Expenses
  "exp-item":   (id, v) => findById(S.expenses, id).item     = v,
  "exp-amt":    (id, v) => findById(S.expenses, id).amount   = v,
  "exp-budget": (id, v) => findById(S.expenses, id).budgetId = v ? parseInt(v) : null,

  // Budgeted categories (real is computed — not editable)
  "bud-item": (id, v) => findById(S.budgeted, id).item = v,
  "bud-est":  (id, v) => findById(S.budgeted, id).est  = v,
};

// ─────────────────────────────────────────────
//  Add / Delete Action Map
// ─────────────────────────────────────────────
const CLICK_ACTIONS = {
  // Add rows
  "add-pc":  () => S.paychecks.push({ id: uid(), label: `Paycheck ${S.paychecks.length + 1}`, income: "", taxes: "" }),
  "add-inc": () => S.addlIncome.push({ id: uid(), item: "", amount: "" }),
  "add-tax": () => S.addlTaxes.push({ id: uid(), item: "", amount: "" }),
  "add-exp": () => S.expenses.push({ id: uid(), item: "", amount: "", budgetId: null }),
  "add-bud": () => S.budgeted.push({ id: uid(), item: "", est: "", real: "" }),

  // Delete rows
  "del-pc":  (id) => { S.paychecks  = S.paychecks.filter(p => p.id !== id); },
  "del-inc": (id) => { S.addlIncome = S.addlIncome.filter(i => i.id !== id); },
  "del-tax": (id) => { S.addlTaxes  = S.addlTaxes.filter(t => t.id !== id); },
  "del-exp": (id) => { S.expenses   = S.expenses.filter(e => e.id !== id); },
  "del-bud": (id) => { S.budgeted   = S.budgeted.filter(b => b.id !== id); },
};

// ─────────────────────────────────────────────
//  Utility
// ─────────────────────────────────────────────
function findById(arr, id) {
  return arr.find(item => item.id === id);
}

// ─────────────────────────────────────────────
//  Event Listeners
// ─────────────────────────────────────────────

// Month selector
document.getElementById("monthSel").addEventListener("change", e => {
  S.month = e.target.value;
  render();
});

// Income panel toggle
document.getElementById("incomeToggle").addEventListener("click", () => {
  S.incomeOpen = !S.incomeOpen;
  render();
});

// Add expense / budgeted (buttons outside delegated area)
document.getElementById("addExpBtn").addEventListener("click", () => {
  S.expenses.push({ id: uid(), item: "", amount: "", budgetId: null });
  render();
});

document.getElementById("addBudBtn").addEventListener("click", () => {
  S.budgeted.push({ id: uid(), item: "", est: "", real: "" });
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