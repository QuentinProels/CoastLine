'use client';

interface Props {
  income: number;
  expenses: number;
  debtPayments: number;
  surplus: number;
}

export default function CashFlowBar({ income, expenses, debtPayments, surplus }: Props) {
  const total = income;
  const expPct = (expenses / total) * 100;
  const debtPct = (debtPayments / total) * 100;
  const surplusPct = Math.max(0, (surplus / total) * 100);
  const deficitPct = surplus < 0 ? (Math.abs(surplus) / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <div className="flex rounded-full h-8 overflow-hidden bg-gray-100">
            <div className="bg-blue-500 flex items-center justify-center" style={{ width: `${expPct}%` }}>
              {expPct > 15 && <span className="text-[10px] text-white font-medium">Expenses</span>}
            </div>
            <div className="bg-orange-500 flex items-center justify-center" style={{ width: `${debtPct}%` }}>
              {debtPct > 10 && <span className="text-[10px] text-white font-medium">Debt</span>}
            </div>
            {surplus >= 0 ? (
              <div className="bg-green-500 flex items-center justify-center" style={{ width: `${surplusPct}%` }}>
                {surplusPct > 10 && <span className="text-[10px] text-white font-medium">Surplus</span>}
              </div>
            ) : (
              <div className="bg-red-500 flex items-center justify-center" style={{ width: `${deficitPct}%` }}>
                <span className="text-[10px] text-white font-medium">Deficit</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 text-center text-sm">
        <div>
          <p className="text-gray-500">Income</p>
          <p className="font-bold text-gray-900">${income.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Expenses</p>
          <p className="font-bold text-blue-600">${expenses.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Debt Payments</p>
          <p className="font-bold text-orange-600">${debtPayments.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">{surplus >= 0 ? 'Surplus' : 'Deficit'}</p>
          <p className={`font-bold ${surplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {surplus >= 0 ? '' : '-'}${Math.abs(surplus).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
