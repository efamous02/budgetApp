// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────
const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

// Dot color cycles for budget lines (assigned by index)
const LINE_COLORS = [
  "#d4b5a8", "#a89fc8", "#9db394", "#c4b9a8",
  "#b8c9d4", "#d4c9a8", "#c4a8b8", "#a8c4b8",
];

function budgetLineColor(index) {
  return LINE_COLORS[index % LINE_COLORS.length];
}

// ─────────────────────────────────────────────
//  ID Generator
// ─────────────────────────────────────────────
let _nextId = 100;
function uid() {
  return ++_nextId;
}

// ─────────────────────────────────────────────
//  Default State
// ─────────────────────────────────────────────
function defaultState() {
  return {
    month: MONTHS[new Date().getMonth()],
    incomeOpen: false,
    paychecks: [
      { id: 1, label: "Paycheck 1", income: "", taxes: "" },
      { id: 2, label: "Paycheck 2", income: "", taxes: "" },
    ],
    addlIncome: [],
    addlTaxes:  [],
    expenses:   [],
    budgeted: [
      { id: 1, item: "Rent",      est: "" },
      { id: 2, item: "Groceries", est: "" },
      { id: 3, item: "Savings",   est: "" },
    ],
  };
}

// ─────────────────────────────────────────────
//  Persistence
// ─────────────────────────────────────────────
const STORAGE_KEY = "budget_v3";

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState();
  } catch {
    return defaultState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ─────────────────────────────────────────────
//  Compute Budgeted Reals from Expenses
//  Sums all expenses linked to each budget line
//  and writes the result back into b.real.
//  Call this before calcTotals and before render.
// ─────────────────────────────────────────────
function computeBudgetedReals(state) {
  // Build a map: budgetId → total amount
  const totals = {};
  for (const e of state.expenses) {
    if (!e.budgetId) continue;
    const amt = parseFloat(e.amount) || 0;
    totals[e.budgetId] = (totals[e.budgetId] || 0) + amt;
  }

  // Write real values onto each budgeted line
  for (const b of state.budgeted) {
    b.real = (totals[b.id] || 0).toFixed(2);
  }
}

// ─────────────────────────────────────────────
//  Derived Calculations
// ─────────────────────────────────────────────
function calcTotals(state) {
  const grossIncome =
    state.paychecks.reduce((sum, p) => sum + (parseFloat(p.income) || 0), 0) +
    state.addlIncome.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

  const grossTaxes =
    state.paychecks.reduce((sum, p) => sum + (parseFloat(p.taxes) || 0), 0) +
    state.addlTaxes.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const totalExpenses =
    state.expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  const netIncome  = grossIncome - grossTaxes;
  const remaining  = netIncome - totalExpenses;
  const budgetedEst  = state.budgeted.reduce((sum, b) => sum + (parseFloat(b.est)  || 0), 0);
  const budgetedReal = state.budgeted.reduce((sum, b) => sum + (parseFloat(b.real) || 0), 0);

  return { grossIncome, grossTaxes, totalExpenses, netIncome, remaining, budgetedEst, budgetedReal };
}

// ─────────────────────────────────────────────
//  Formatting Helpers
// ─────────────────────────────────────────────
function fmt(n) {
  return "$" + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ─────────────────────────────────────────────
//  Initialise Global State
// ─────────────────────────────────────────────
let S = loadState();