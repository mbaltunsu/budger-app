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

  const today = new Date();

  return (
    <ul className="space-y-3.5">
      {bills.map((bill) => {
        const progress = bill.due_day ? daysProgress(bill.due_day, year, month) : 0;
        const isPast = progress === 100;

        let meta = "";
        if (bill.due_day) {
          const dueDate = new Date(year, month - 1, bill.due_day);
          const daysLeft = Math.max(0, Math.ceil((dueDate.getTime() - today.getTime()) / 86_400_000));
          const dateLabel = dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
          const amtLabel = formatMinor(bill.amount_minor, currency);
          meta = isPast ? `paid · ${dateLabel} · ${amtLabel}` : `${daysLeft}d · ${dateLabel} · ${amtLabel}`;
        }

        return (
          <li key={bill.id}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[#3A2E28]">{bill.name}</span>
              <span className={["shrink-0 text-xs tabular-nums", isPast ? "text-[#2D7A4F]" : "text-[#3A2E28]/45"].join(" ")}>
                {meta}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F4633A]/12">
              <div
                className={["h-full rounded-full transition-all", isPast ? "bg-[#2D7A4F]" : "bg-[#F4633A]"].join(" ")}
                style={{ width: `${progress}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
