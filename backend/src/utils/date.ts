/**
 * Computes the Monday (00:00:00) of the given date's week (Monday-Sunday definition)
 */
export function getMondayOfWeek(inputDate: Date | string = new Date()): Date {
  const date = new Date(inputDate);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday, ...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
