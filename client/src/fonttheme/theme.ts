import { createTheme } from '@mantine/core';

const fontFamily =
  '"Gotham Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const theme = createTheme({
  fontFamily,
  headings: {
    fontFamily,
  },
  fontSizes: {
    xs: '0.8125rem',
    sm: '0.9375rem',
    md: '1.0625rem',
    lg: '1.1875rem',
    xl: '1.3125rem',
  },
});