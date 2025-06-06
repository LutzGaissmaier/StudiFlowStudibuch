/**
 * Theme-Konfiguration für StudiFlow AI Enterprise
 * 
 * Definiert das einheitliche Design-System für die gesamte Anwendung.
 * 
 * @version 1.0.0
 */

// Farben basierend auf dem Corporate Design von StudiBuch
export const colors = {
  // Primärfarben
  primary: '#a4c63a', // StudiBuch Grün
  secondary: '#4a4a4a', // Dunkelgrau
  accent: '#3498db', // Akzentblau
  
  // Status-Farben
  success: '#2ecc71', // Grün
  warning: '#f39c12', // Orange
  error: '#e74c3c', // Rot
  info: '#3498db', // Blau
  
  // Hintergrundfarben
  background: '#f8f9fa', // Hellgrau für Hintergrund
  card: '#ffffff', // Weiß für Karten
  border: '#e0e0e0', // Hellgrau für Ränder
  
  // Textfarben
  text: {
    primary: '#333333', // Dunkelgrau für Haupttext
    secondary: '#666666', // Mittelgrau für Sekundärtext
    light: '#999999', // Hellgrau für weniger wichtigen Text
    inverted: '#ffffff' // Weiß für Text auf dunklem Hintergrund
  }
};

// Typografie
export const typography = {
  fontFamily: {
    base: '"Roboto", "Helvetica Neue", Arial, sans-serif',
    heading: '"Roboto", "Helvetica Neue", Arial, sans-serif',
    monospace: '"Roboto Mono", monospace'
  },
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    md: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem' // 48px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  }
};

// Abstände
export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem' // 48px
};

// Schatten
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none'
};

// Abrundungen
export const borderRadius = {
  none: '0',
  sm: '0.125rem', // 2px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  full: '9999px'
};

// Übergänge
export const transitions = {
  default: 'all 0.3s ease',
  fast: 'all 0.15s ease',
  slow: 'all 0.5s ease'
};

// Breakpoints für Responsive Design
export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Z-Index-Werte
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
};

// Button-Stile
export const buttons = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md,
    fontWeight: typography.fontWeight.medium,
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.none,
    transition: transitions.default,
    cursor: 'pointer',
    outline: 'none',
    border: 'none'
  },
  primary: {
    backgroundColor: colors.primary,
    color: colors.text.inverted,
    '&:hover': {
      backgroundColor: '#94b535' // Dunkleres Grün
    },
    '&:focus': {
      boxShadow: `0 0 0 3px ${colors.primary}4d`
    },
    '&:disabled': {
      backgroundColor: '#c8d89c', // Helleres Grün
      cursor: 'not-allowed'
    }
  },
  secondary: {
    backgroundColor: colors.secondary,
    color: colors.text.inverted,
    '&:hover': {
      backgroundColor: '#3a3a3a' // Dunkleres Grau
    },
    '&:focus': {
      boxShadow: `0 0 0 3px ${colors.secondary}4d`
    },
    '&:disabled': {
      backgroundColor: '#7a7a7a', // Helleres Grau
      cursor: 'not-allowed'
    }
  },
  outline: {
    backgroundColor: 'transparent',
    color: colors.primary,
    border: `1px solid ${colors.primary}`,
    '&:hover': {
      backgroundColor: colors.primary + '1a'
    },
    '&:focus': {
      boxShadow: `0 0 0 3px ${colors.primary}4d`
    },
    '&:disabled': {
      color: '#c8d89c', // Helleres Grün
      borderColor: '#c8d89c',
      cursor: 'not-allowed'
    }
  },
  text: {
    backgroundColor: 'transparent',
    color: colors.primary,
    padding: `${spacing.xs} ${spacing.sm}`,
    '&:hover': {
      backgroundColor: colors.primary + '1a'
    },
    '&:focus': {
      boxShadow: `0 0 0 3px ${colors.primary}4d`
    },
    '&:disabled': {
      color: '#c8d89c', // Helleres Grün
      cursor: 'not-allowed'
    }
  },
  icon: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    '& i': {
      fontSize: '20px'
    }
  },
  sizes: {
    sm: {
      padding: `${spacing.xs} ${spacing.sm}`,
      fontSize: typography.fontSize.sm,
      borderRadius: borderRadius.sm
    },
    md: {
      padding: `${spacing.sm} ${spacing.md}`,
      fontSize: typography.fontSize.md,
      borderRadius: borderRadius.md
    },
    lg: {
      padding: `${spacing.md} ${spacing.lg}`,
      fontSize: typography.fontSize.lg,
      borderRadius: borderRadius.lg
    }
  }
};

// Formular-Stile
export const forms = {
  label: {
    display: 'block',
    marginBottom: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary
  },
  input: {
    display: 'block',
    width: '100%',
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.normal,
    color: colors.text.primary,
    backgroundColor: colors.card,
    backgroundClip: 'padding-box',
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    transition: transitions.default,
    '&:focus': {
      border: `1px solid ${colors.primary}`,
      boxShadow: `0 0 0 3px ${colors.primary}4d`,
      outline: 'none'
    },
    '&:disabled': {
      backgroundColor: colors.background,
      opacity: 0.7,
      cursor: 'not-allowed'
    },
    '&::placeholder': {
      color: colors.text.light,
      opacity: 1
    }
  },
  select: {
    display: 'block',
    width: '100%',
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.normal,
    color: colors.text.primary,
    backgroundColor: colors.card,
    backgroundClip: 'padding-box',
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    transition: transitions.default,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.5rem center',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2.5rem',
    '&:focus': {
      border: `1px solid ${colors.primary}`,
      boxShadow: `0 0 0 3px ${colors.primary}4d`,
      outline: 'none'
    },
    '&:disabled': {
      backgroundColor: colors.background,
      opacity: 0.7,
      cursor: 'not-allowed'
    }
  },
  textarea: {
    display: 'block',
    width: '100%',
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.normal,
    color: colors.text.primary,
    backgroundColor: colors.card,
    backgroundClip: 'padding-box',
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    transition: transitions.default,
    resize: 'vertical',
    minHeight: '100px',
    '&:focus': {
      border: `1px solid ${colors.primary}`,
      boxShadow: `0 0 0 3px ${colors.primary}4d`,
      outline: 'none'
    },
    '&:disabled': {
      backgroundColor: colors.background,
      opacity: 0.7,
      cursor: 'not-allowed'
    },
    '&::placeholder': {
      color: colors.text.light,
      opacity: 1
    }
  },
  checkbox: {
    display: 'inline-block',
    height: '1rem',
    width: '1rem',
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
    cursor: 'pointer',
    '&:checked': {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E")`,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '0.75rem 0.75rem'
    },
    '&:focus': {
      boxShadow: `0 0 0 3px ${colors.primary}4d`,
      outline: 'none'
    },
    '&:disabled': {
      backgroundColor: colors.background,
      opacity: 0.7,
      cursor: 'not-allowed'
    }
  },
  radio: {
    display: 'inline-block',
    height: '1rem',
    width: '1rem',
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
    cursor: 'pointer',
    '&:checked': {
      backgroundColor: colors.card,
      borderColor: colors.primary,
      boxShadow: `inset 0 0 0 4px ${colors.primary}`
    },
    '&:focus': {
      boxShadow: `0 0 0 3px ${colors.primary}4d`,
      outline: 'none'
    },
    '&:disabled': {
      backgroundColor: colors.background,
      opacity: 0.7,
      cursor: 'not-allowed'
    }
  },
  formGroup: {
    marginBottom: spacing.md
  },
  helpText: {
    display: 'block',
    marginTop: spacing.xs,
    fontSize: typography.fontSize.sm,
    color: colors.text.light
  },
  errorText: {
    display: 'block',
    marginTop: spacing.xs,
    fontSize: typography.fontSize.sm,
    color: colors.error
  }
};

// Karten-Stile
export const cards = {
  base: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.md,
    overflow: 'hidden',
    marginBottom: spacing.lg
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottom: `1px solid ${colors.border}`
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    margin: 0
  },
  body: {
    padding: spacing.md
  },
  footer: {
    padding: spacing.md,
    borderTop: `1px solid ${colors.border}`,
    backgroundColor: colors.background
  }
};

// Alert-Stile
export const alerts = {
  base: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md
  },
  success: {
    backgroundColor: colors.success + '1a',
    color: colors.success,
    borderLeft: `4px solid ${colors.success}`
  },
  warning: {
    backgroundColor: colors.warning + '1a',
    color: colors.warning,
    borderLeft: `4px solid ${colors.warning}`
  },
  error: {
    backgroundColor: colors.error + '1a',
    color: colors.error,
    borderLeft: `4px solid ${colors.error}`
  },
  info: {
    backgroundColor: colors.info + '1a',
    color: colors.info,
    borderLeft: `4px solid ${colors.info}`
  }
};

// Badge-Stile
export const badges = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    lineHeight: 1
  },
  primary: {
    backgroundColor: colors.primary,
    color: colors.text.inverted
  },
  secondary: {
    backgroundColor: colors.secondary,
    color: colors.text.inverted
  },
  success: {
    backgroundColor: colors.success,
    color: colors.text.inverted
  },
  warning: {
    backgroundColor: colors.warning,
    color: colors.text.inverted
  },
  error: {
    backgroundColor: colors.error,
    color: colors.text.inverted
  },
  info: {
    backgroundColor: colors.info,
    color: colors.text.inverted
  },
  outline: {
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border}`,
    color: colors.text.secondary
  }
};

// Tabellen-Stile
export const tables = {
  base: {
    width: '100%',
    marginBottom: spacing.lg,
    color: colors.text.primary,
    borderCollapse: 'collapse'
  },
  head: {
    backgroundColor: colors.background
  },
  headCell: {
    padding: spacing.md,
    borderBottom: `2px solid ${colors.border}`,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'left'
  },
  cell: {
    padding: spacing.md,
    borderTop: `1px solid ${colors.border}`,
    verticalAlign: 'middle'
  },
  striped: {
    '& tr:nth-child(odd)': {
      backgroundColor: colors.background
    }
  },
  hover: {
    '& tr:hover': {
      backgroundColor: colors.background
    }
  },
  bordered: {
    border: `1px solid ${colors.border}`,
    '& th, & td': {
      border: `1px solid ${colors.border}`
    }
  },
  small: {
    '& th, & td': {
      padding: `${spacing.xs} ${spacing.sm}`
    }
  }
};

// Tabs-Stile
export const tabs = {
  base: {
    display: 'flex',
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: spacing.lg
  },
  tab: {
    padding: `${spacing.sm} ${spacing.md}`,
    cursor: 'pointer',
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    borderBottom: '2px solid transparent',
    transition: transitions.default,
    '&:hover': {
      color: colors.primary
    },
    '&.active': {
      color: colors.primary,
      borderBottomColor: colors.primary
    }
  },
  content: {
    marginTop: spacing.md
  },
  pane: {
    display: 'none',
    '&.active': {
      display: 'block'
    }
  }
};

// Dropdown-Stile
export const dropdowns = {
  base: {
    position: 'relative',
    display: 'inline-block'
  },
  toggle: {
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  menu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: zIndex.dropdown,
    display: 'none',
    minWidth: '10rem',
    padding: `${spacing.xs} 0`,
    margin: `${spacing.xs} 0 0`,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    textAlign: 'left',
    backgroundColor: colors.card,
    backgroundClip: 'padding-box',
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    boxShadow: shadows.lg,
    '&.show': {
      display: 'block'
    }
  },
  item: {
    display: 'block',
    width: '100%',
    padding: `${spacing.sm} ${spacing.md}`,
    clear: 'both',
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    textAlign: 'inherit',
    whiteSpace: 'nowrap',
    backgroundColor: 'transparent',
    border: 0,
    textDecoration: 'none',
    '&:hover': {
      color: colors.primary,
      backgroundColor: colors.background,
      textDecoration: 'none'
    }
  },
  divider: {
    height: 0,
    margin: `${spacing.xs} 0`,
    overflow: 'hidden',
    borderTop: `1px solid ${colors.border}`
  }
};

// Modal-Stile
export const modals = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: zIndex.modal,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.xl,
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottom: `1px solid ${colors.border}`
  },
  title: {
    margin: 0,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: typography.fontSize.xl,
    color: colors.text.light,
    '&:hover': {
      color: colors.text.primary
    }
  },
  body: {
    padding: spacing.lg
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: spacing.md,
    borderTop: `1px solid ${colors.border}`,
    backgroundColor: colors.background
  },
  sizes: {
    sm: {
      maxWidth: '300px'
    },
    md: {
      maxWidth: '500px'
    },
    lg: {
      maxWidth: '800px'
    },
    xl: {
      maxWidth: '1140px'
    },
    full: {
      maxWidth: '100%',
      height: '100%',
      margin: 0,
      borderRadius: 0
    }
  }
};

// Toast-Stile
export const toasts = {
  container: {
    position: 'fixed',
    bottom: spacing.lg,
    right: spacing.lg,
    zIndex: zIndex.toast
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    boxShadow: shadows.lg,
    marginBottom: spacing.sm,
    maxWidth: '350px'
  },
  icon: {
    marginRight: spacing.sm,
    fontSize: typography.fontSize.xl
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs
  },
  message: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: typography.fontSize.lg,
    color: colors.text.light,
    marginLeft: spacing.sm,
    '&:hover': {
      color: colors.text.primary
    }
  },
  success: {
    borderLeft: `4px solid ${colors.success}`,
    '& .toast-icon': {
      color: colors.success
    }
  },
  warning: {
    borderLeft: `4px solid ${colors.warning}`,
    '& .toast-icon': {
      color: colors.warning
    }
  },
  error: {
    borderLeft: `4px solid ${colors.error}`,
    '& .toast-icon': {
      color: colors.error
    }
  },
  info: {
    borderLeft: `4px solid ${colors.info}`,
    '& .toast-icon': {
      color: colors.info
    }
  }
};

// Tooltip-Stile
export const tooltips = {
  base: {
    position: 'absolute',
    zIndex: zIndex.tooltip,
    padding: `${spacing.xs} ${spacing.sm}`,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.inverted,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.sm,
    boxShadow: shadows.md,
    maxWidth: '200px',
    wordWrap: 'break-word'
  },
  arrow: {
    position: 'absolute',
    width: '8px',
    height: '8px',
    backgroundColor: colors.secondary,
    transform: 'rotate(45deg)'
  }
};

// Progress-Bar-Stile
export const progressBars = {
  container: {
    height: '0.5rem',
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.md
  },
  bar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    transition: 'width 0.3s ease'
  },
  striped: {
    backgroundImage: `linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)`,
    backgroundSize: '1rem 1rem'
  },
  animated: {
    animation: 'progress-bar-stripes 1s linear infinite'
  },
  success: {
    backgroundColor: colors.success
  },
  warning: {
    backgroundColor: colors.warning
  },
  error: {
    backgroundColor: colors.error
  },
  info: {
    backgroundColor: colors.info
  }
};

// Pagination-Stile
export const pagination = {
  container: {
    display: 'flex',
    padding: 0,
    margin: 0,
    listStyle: 'none'
  },
  item: {
    margin: `0 ${spacing.xs}`
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${spacing.xs} ${spacing.sm}`,
    minWidth: '2rem',
    height: '2rem',
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    textDecoration: 'none',
    transition: transitions.default,
    '&:hover': {
      backgroundColor: colors.background,
      borderColor: colors.primary,
      color: colors.primary
    },
    '&.active': {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      color: colors.text.inverted,
      cursor: 'default'
    },
    '&.disabled': {
      color: colors.text.light,
      pointerEvents: 'none',
      cursor: 'default'
    }
  }
};

// Breadcrumb-Stile
export const breadcrumbs = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: 0,
    margin: `0 0 ${spacing.md} 0`,
    listStyle: 'none'
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    '&:not(:last-child)::after': {
      content: '""',
      display: 'inline-block',
      marginLeft: spacing.xs,
      marginRight: spacing.xs,
      width: '0.5rem',
      height: '0.5rem',
      borderTop: `1px solid ${colors.text.light}`,
      borderRight: `1px solid ${colors.text.light}`,
      transform: 'rotate(45deg)'
    }
  },
  link: {
    color: colors.text.secondary,
    textDecoration: 'none',
    '&:hover': {
      color: colors.primary,
      textDecoration: 'underline'
    }
  },
  active: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium
  }
};

// Avatar-Stile
export const avatars = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    backgroundColor: colors.background
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  initials: {
    fontWeight: typography.fontWeight.medium,
    color: colors.text.inverted
  },
  sizes: {
    xs: {
      width: '1.5rem',
      height: '1.5rem',
      fontSize: typography.fontSize.xs
    },
    sm: {
      width: '2rem',
      height: '2rem',
      fontSize: typography.fontSize.sm
    },
    md: {
      width: '2.5rem',
      height: '2.5rem',
      fontSize: typography.fontSize.md
    },
    lg: {
      width: '3rem',
      height: '3rem',
      fontSize: typography.fontSize.lg
    },
    xl: {
      width: '4rem',
      height: '4rem',
      fontSize: typography.fontSize.xl
    }
  },
  group: {
    display: 'flex',
    '& > *:not(:first-child)': {
      marginLeft: '-0.5rem'
    }
  }
};

// Spinner-Stile
export const spinners = {
  base: {
    display: 'inline-block',
    width: '1rem',
    height: '1rem',
    border: `2px solid ${colors.border}`,
    borderRadius: borderRadius.full,
    borderTopColor: colors.primary,
    animation: 'spinner-border 0.75s linear infinite'
  },
  sizes: {
    sm: {
      width: '1rem',
      height: '1rem',
      borderWidth: '2px'
    },
    md: {
      width: '1.5rem',
      height: '1.5rem',
      borderWidth: '2px'
    },
    lg: {
      width: '2rem',
      height: '2rem',
      borderWidth: '3px'
    },
    xl: {
      width: '3rem',
      height: '3rem',
      borderWidth: '4px'
    }
  }
};

// Animationen
export const animations = {
  keyframes: {
    'spinner-border': {
      '0%': {
        transform: 'rotate(0deg)'
      },
      '100%': {
        transform: 'rotate(360deg)'
      }
    },
    'progress-bar-stripes': {
      '0%': {
        backgroundPosition: '1rem 0'
      },
      '100%': {
        backgroundPosition: '0 0'
      }
    },
    'fade-in': {
      '0%': {
        opacity: 0
      },
      '100%': {
        opacity: 1
      }
    },
    'fade-out': {
      '0%': {
        opacity: 1
      },
      '100%': {
        opacity: 0
      }
    },
    'slide-in-up': {
      '0%': {
        transform: 'translateY(100%)',
        opacity: 0
      },
      '100%': {
        transform: 'translateY(0)',
        opacity: 1
      }
    },
    'slide-in-down': {
      '0%': {
        transform: 'translateY(-100%)',
        opacity: 0
      },
      '100%': {
        transform: 'translateY(0)',
        opacity: 1
      }
    },
    'slide-in-left': {
      '0%': {
        transform: 'translateX(-100%)',
        opacity: 0
      },
      '100%': {
        transform: 'translateX(0)',
        opacity: 1
      }
    },
    'slide-in-right': {
      '0%': {
        transform: 'translateX(100%)',
        opacity: 0
      },
      '100%': {
        transform: 'translateX(0)',
        opacity: 1
      }
    }
  }
};

// Grid-System
export const grid = {
  container: {
    width: '100%',
    paddingRight: spacing.md,
    paddingLeft: spacing.md,
    marginRight: 'auto',
    marginLeft: 'auto'
  },
  containerSizes: {
    sm: '540px',
    md: '720px',
    lg: '960px',
    xl: '1140px',
    '2xl': '1320px'
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    marginRight: `-${spacing.md}`,
    marginLeft: `-${spacing.md}`
  },
  col: {
    position: 'relative',
    width: '100%',
    paddingRight: spacing.md,
    paddingLeft: spacing.md
  }
};

// Exportiere alle Theme-Komponenten
export default {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  transitions,
  breakpoints,
  zIndex,
  buttons,
  forms,
  cards,
  alerts,
  badges,
  tables,
  tabs,
  dropdowns,
  modals,
  toasts,
  tooltips,
  progressBars,
  pagination,
  breadcrumbs,
  avatars,
  spinners,
  animations,
  grid
};
