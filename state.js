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
//  Default Month Data
//  One of these is created for each month.
// ─────────────────────────────────────────────
function defaultMonthData() {
  return {
    incomeOpen: false,
    paychecks: [
      { id: uid(), label: "Paycheck 1", income: "", taxes: "" },
      { id: uid(), label: "Paycheck 2", income: "", taxes: "" },
    ],
    addlIncome: [],
    addlTaxes:  [],
    expenses:   [],
    budgeted: [
      { id: uid(), item: "Rent",      est: "" },
      { id: uid(), item: "Groceries", est: "" },
      { id: uid(), item: "Savings",   est: "" },
    ],
  };
}

// ─────────────────────────────────────────────
//  Top-level State Shape
//
//  S = {
//    currentMonth: "April",
//    months: {
//      "January": { incomeOpen, paychecks, addlIncome, addlTaxes, expenses, budgeted },
//      "April":   { ... },
//      ...
//    }
//  }
//
//  Months are created on first access — only months
//  you've actually visited/edited are stored.
// ─────────────────────────────────────────────
function defaultState() {
  const current = MONTHS[new Date().getMonth()];
  return {
    currentMonth: current,
    months: {
      [current]: defaultMonthData(),
    },
  };
}

// ─────────────────────────────────────────────
//  Active Month Accessor
//  Always use M() to read/write the current month's data.
//  Automatically creates a blank month on first access.
// ─────────────────────────────────────────────
function M() {
  if (!S.months[S.currentMonth]) {
    S.months[S.currentMonth] = defaultMonthData();
  }
  return S.months[S.currentMonth];
}

// ─────────────────────────────────────────────
//  Persistence
// ─────────────────────────────────────────────
const STORAGE_KEY = "budget_v4";

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved || defaultState();
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
}

// ─────────────────────────────────────────────
//  Compute Budgeted Reals from Expenses
//  Sums all expenses per budget line and writes
//  the result back into b.real for the active month.
// ─────────────────────────────────────────────
function computeBudgetedReals() {
  const m = M();

  // Build totals map: budgetId → summed amount
  const totals = {};
  for (const e of m.expenses) {
    if (!e.budgetId) continue;
    totals[e.budgetId] = (totals[e.budgetId] || 0) + (parseFloat(e.amount) || 0);
  }

  // Write back onto each budgeted line
  for (const b of m.budgeted) {
    b.real = (totals[b.id] || 0).toFixed(2);
  }
}

// ─────────────────────────────────────────────
//  Derived Calculations  (active month only)
// ─────────────────────────────────────────────
function calcTotals() {
  const m = M();

  const grossIncome =
    m.paychecks.reduce((sum, p) => sum + (parseFloat(p.income) || 0), 0) +
    m.addlIncome.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

  const grossTaxes =
    m.paychecks.reduce((sum, p) => sum + (parseFloat(p.taxes) || 0), 0) +
    m.addlTaxes.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const totalExpenses =
    m.expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  const netIncome    = grossIncome - grossTaxes;
  const remaining    = netIncome - totalExpenses;
  const budgetedEst  = m.budgeted.reduce((sum, b) => sum + (parseFloat(b.est)  || 0), 0);
  const budgetedReal = m.budgeted.reduce((sum, b) => sum + (parseFloat(b.real) || 0), 0);

  return { grossIncome, grossTaxes, totalExpenses, netIncome, remaining, budgetedEst, budgetedReal };
}

// ─────────────────────────────────────────────
//  Formatting Helper
// ─────────────────────────────────────────────
function fmt(n) {
  return "$" + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ─────────────────────────────────────────────
//  Initialise Global State
// ─────────────────────────────────────────────
let S = loadState();