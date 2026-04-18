interface UpcomingBill {
  id: string;
  name: string;
  amount_minor: string;
  due_day: number | null;
  frequency: string;
}

interface UpcomingBillsProps {
  bills: UpcomingBill[];
  year: number;
  month: number;
  currency: string;
}

function formatMinor(minor: string, currency: string): string {
  const major = Number(minor) / 100;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(major);
}

function daysProgress(dueDay: number, year: number, month: number): number {
  const today = new Date();
  const daysInMonth = new Date(year, month, 0).getDate();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

  if (!isCurrentMonth) return 0;

  const todayDay = today.getDate();
  if (todayDay >= dueDay) return 100;
  // days remaining until due as fraction of month (inverted for "urgency" bar)
  const daysUntilDue = dueDay - todayDay;
  return Math.round((1 - daysUntilDue / daysInMonth) * 100);
}

export function UpcomingBills({ bills, year, month, currency }: UpcomingBillsProps) {
  if (bills.length === 0) {
    return (
      <p className="text-sm text-[#3A2E28]/40">No upcoming bills</p>
    );
  }

  return (
    <ul className="space-y-3">
      {bills.map((bill) => {
        const progress = bill.due_day ? daysProgress(bill.due_day, year, month) : 0;
        const isPast = progress === 100;
        return (
          <li key={bill.id}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-semibold text-[#3A2E28]">{bill.name}</span>
              <span className="font-bold text-[#3A2E28]/80">
                {formatMinor(bill.amount_minor, currency)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#F4633A]/15">
                <div
                  className={[
                    "h-full rounded-full transition-all",
                    isPast ? "bg-[#2D7A4F]" : "bg-[#F4633A]",
                  ].join(" ")}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {bill.due_day && (
                <span className="shrink-0 text-xs text-[#3A2E28]/50">
                  {isPast ? "paid?" : `due day ${bill.due_day}`}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
