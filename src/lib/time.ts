const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

export function relativeTimeFromNow(dateInput: string | number | Date) {
  const date = new Date(dateInput);
  const elapsed = (date.getTime() - Date.now()) / 1000;

  let duration = elapsed;
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return relativeTimeFormatter.format(
        Math.round(duration),
        division.unit as Intl.RelativeTimeFormatUnit
      );
    }
    duration /= division.amount;
  }

  return relativeTimeFormatter.format(0, "second");
}
