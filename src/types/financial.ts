export interface Money {
  amount: number;
  currency: string;
}

export type InstrumentType = 'EQUITY' | 'FIXED_INCOME';

interface BaseInstrument {
  id: string;
  type: InstrumentType;
  name: string;
  currency: string;
}

export interface EquityInstrument extends BaseInstrument {
  type: 'EQUITY';
  isin: string;
  ticker?: string;
  cusip?: string;
}

export interface FixedIncomeInstrument extends BaseInstrument {
  type: 'FIXED_INCOME';
  isin: string;
  couponRate: number;
  maturityDate: string;
  faceValue: Money;
}

export type Instrument = EquityInstrument | FixedIncomeInstrument;

export type KycStatus = 'APPROVED' | 'PENDING' | 'SUSPENDED';

export interface Counterparty {
  id: string;
  name: string;
  lei: string;
  kycStatus: KycStatus;
}

export type TradeSide = 'BUY' | 'SELL';
export type TradeStatus = 'PENDING' | 'SETTLED' | 'FAILED' | 'CANCELLED';

export interface Trade {
  id: string;
  side: TradeSide;
  status: TradeStatus;
  instrumentId: string;
  quantity: number;
  price: Money;
  notional: Money;
  tradeDate: string;
  settlementDate: string;
  counterpartyId: string;
  accountId: string;
  fundId: string;
}

export interface Position {
  fundId: string;
  accountId: string;
  instrumentId: string;
  quantity: number;
  marketValue: Money;
  valuationDate: string;
}

export type NavLineItemCategory =
  | 'GROSS_ASSET_VALUE'
  | 'CASH'
  | 'ACCRUED_INCOME'
  | 'MANAGEMENT_FEE'
  | 'PERFORMANCE_FEE'
  | 'OTHER_FEES'
  | 'NET_ASSET_VALUE';

export interface NavLineItem {
  category: NavLineItemCategory;
  value: Money;
}

export interface NavStatement {
  id: string;
  fundId: string;
  valuationDate: string;
  lineItems: NavLineItem[];
  totalNav: Money;
}

export type BreakSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type BreakType =
  | 'MISSING'
  | 'QUANTITY_MISMATCH'
  | 'PRICE_MISMATCH'
  | 'STATUS_MISMATCH';

export interface ReconciliationBreak {
  id: string;
  severity: BreakSeverity;
  type: BreakType;
  sourceA: string;
  sourceB: string;
  valueA: unknown;
  valueB: unknown;
  instrumentId?: string;
  accountId?: string;
  fundId?: string;
  description: string;
  detectedAt: string;
}

export type RecommendedAction =
  | 'CONTACT_COUNTERPARTY'
  | 'MANUAL_OVERRIDE'
  | 'INVESTIGATE_BREAK'
  | 'AWAIT_SETTLEMENT'
  | 'ESCALATE_TO_MANAGEMENT';

export interface EscalationSummary {
  id: string;
  runId: string;
  operatorId: string;
  createdAt: string;
  breaks: ReconciliationBreak[];
  recommendedAction: RecommendedAction;
  actionContext?: string;
}
