export const quarterOptions = [
  { value: '1', label: '1 квартал' },
  { value: '2', label: '2 квартал' },
  { value: '3', label: '3 квартал' },
  { value: '4', label: '4 квартал' },
];

export function getCurrentQuarter() {
  return String(Math.ceil((new Date().getMonth() + 1) / 3));
}

export function getCurrentYear() {
  return new Date().getFullYear();
}