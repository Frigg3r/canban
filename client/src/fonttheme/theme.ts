import { createTheme } from '@mantine/core';

const fontFamily =
  '"Gotham Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const theme = createTheme({
  fontFamily,
  headings: {
    fontFamily,
  },
  fontSizes: {
    xs: '0.85rem',
    sm: '0.9375rem',
    md: '1.2rem',
    lg: '1.4rem',
    xl: '1.6rem',
  },
});