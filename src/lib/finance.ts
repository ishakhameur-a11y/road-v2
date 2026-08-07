export type AccountId = "cash" | "bank" | "visa";

export interface Account {
  id: AccountId;
  label: string;
  icon: string;
  currency: "DZD" | "USD";
}

export const ACCOUNTS: Account[] = [
  { id: "cash", label: "كاش", icon: "💵", currency: "DZD" },
  { id: "bank", label: "بنك", icon: "🏦", currency: "DZD" },
  { id: "visa", label: "فيزا", icon: "💳", currency: "USD" },
];

export const EXPENSE_CATEGORIES = [
  { id: "food", label: "طعام", icon: "🍔" },
  { id: "transport", label: "مواصلات", icon: "🚗" },
  { id: "bills", label: "فواتير", icon: "📄" },
  { id: "shopping", label: "تسوق", icon: "🛍️" },
  { id: "health", label: "صحة", icon: "🏥" },
  { id: "entertain", label: "ترفيه", icon: "🎮" },
  { id: "other", label: "أخرى", icon: "💸" },
];

export type FinanceTx =
  | { id: string; type: "income"; date: string; amount: number; note: string }
  | { id: string; type: "expense"; date: string; amount: number; account: AccountId; category: string; note: string }
  | {
      id: string;
      type: "transfer";
      date: string;
      fromAccount: AccountId;
      toAccount: AccountId;
      fromAmount: number;
      toAmount: number;
      isInvestment: boolean;
      note: string;
    };

export interface FinanceState {
  cash: number;
  bank: number;
  visa: number;
  spendPool: number;
  investPool: number;
}

export function computeState(txs: FinanceTx[]): FinanceState {
  const s: FinanceState = { cash: 0, bank: 0, visa: 0, spendPool: 0, investPool: 0 };
  for (const tx of txs) {
    if (tx.type === "income") {
      s.cash += tx.amount;
      s.spendPool += tx.amount / 2;
      s.investPool += tx.amount / 2;
    } else if (tx.type === "expense") {
      s[tx.account] -= tx.amount;
      if (tx.account !== "visa") s.spendPool -= tx.amount;
    } else if (tx.type === "transfer") {
      s[tx.fromAccount] -= tx.fromAmount;
      s[tx.toAccount] += tx.toAmount;
      if (tx.isInvestment) s.investPool -= tx.fromAmount;
    }
  }
  return s;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function seedFinanceTxs(): FinanceTx[] {
  const now = new Date();
  const d = (offset: number) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + offset);
    return dt.toISOString().slice(0, 10);
  };
  return [
    { id: "f1", type: "income", date: d(-18), amount: 30000, note: "دخل الدوام الجزئي" },
    { id: "f2", type: "expense", date: d(-15), amount: 3500, account: "cash", category: "food", note: "بقالة" },
    { id: "f3", type: "transfer", date: d(-12), fromAccount: "cash", toAccount: "bank", fromAmount: 10000, toAmount: 10000, isInvestment: true, note: "تجهيز للتحويل للصرافة" },
    { id: "f4", type: "expense", date: d(-9), amount: 1200, account: "cash", category: "transport", note: "مواصلات" },
    { id: "f5", type: "transfer", date: d(-6), fromAccount: "bank", toAccount: "visa", fromAmount: 10000, toAmount: 68, isInvestment: true, note: "تحويل للصرافة" },
    { id: "f6", type: "income", date: d(-2), amount: 25000, note: "دخل إضافي" },
  ];
}

export const todayISOKey = todayISO;
