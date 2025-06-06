/**
 * UI-Komponenten für StudiFlow AI Enterprise
 * 
 * Enthält gemeinsame UI-Komponenten für ein konsistentes Erscheinungsbild
 * in der gesamten Anwendung.
 * 
 * @version 1.0.0
 */

// Corporate Design Farbpalette
export const colors = {
  primary: '#a4c63a', // StudiBuch Grün
  secondary: '#4a4a4a', // Dunkelgrau
  accent: '#3498db', // Akzentblau
  success: '#2ecc71', // Erfolgsgrün
  warning: '#f39c12', // Warngelb
  error: '#e74c3c', // Fehlerrot
  background: '#f9f9f9', // Hintergrund
  card: '#ffffff', // Kartenhintergrund
  text: {
    primary: '#333333', // Primärer Text
    secondary: '#666666', // Sekundärer Text
    light: '#999999', // Heller Text
    inverted: '#ffffff' // Invertierter Text
  },
  border: '#e0e0e0' // Rahmenfarbe
};

// Typografie
export const typography = {
  fontFamily: {
    primary: '"Roboto", "Helvetica Neue", Helvetica, Arial, sans-serif',
    secondary: '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif'
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
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    loose: 1.75
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
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
};

// Rundungen
export const borderRadius = {
  none: '0',
  sm: '0.125rem', // 2px
  md: '0.25rem', // 4px
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

// Z-Index
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600
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

// Gemeinsame Stile für Buttons
export const buttonStyles = `
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.md};
    font-weight: ${typography.fontWeight.medium};
    line-height: ${typography.lineHeight.normal};
    text-align: center;
    text-decoration: none;
    border-radius: ${borderRadius.md};
    transition: ${transitions.default};
    cursor: pointer;
    outline: none;
  }

  .btn-primary {
    background-color: ${colors.primary};
    color: ${colors.text.inverted};
    border: 1px solid ${colors.primary};
  }

  .btn-primary:hover {
    background-color: ${colors.primary}e6;
    border-color: ${colors.primary}e6;
  }

  .btn-secondary {
    background-color: ${colors.secondary};
    color: ${colors.text.inverted};
    border: 1px solid ${colors.secondary};
  }

  .btn-secondary:hover {
    background-color: ${colors.secondary}e6;
    border-color: ${colors.secondary}e6;
  }

  .btn-outline {
    background-color: transparent;
    color: ${colors.primary};
    border: 1px solid ${colors.primary};
  }

  .btn-outline:hover {
    background-color: ${colors.primary}1a;
  }

  .btn-text {
    background-color: transparent;
    color: ${colors.primary};
    border: none;
    padding: 0.5rem;
  }

  .btn-text:hover {
    background-color: ${colors.primary}1a;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: ${typography.fontSize.sm};
  }

  .btn-lg {
    padding: 0.75rem 1.5rem;
    font-size: ${typography.fontSize.lg};
  }

  .btn-icon {
    padding: 0.5rem;
    border-radius: ${borderRadius.full};
  }

  .btn-disabled,
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Gemeinsame Stile für Karten
export const cardStyles = `
  .card {
    background-color: ${colors.card};
    border-radius: ${borderRadius.lg};
    box-shadow: ${shadows.md};
    overflow: hidden;
  }

  .card-header {
    padding: ${spacing.md} ${spacing.lg};
    border-bottom: 1px solid ${colors.border};
  }

  .card-body {
    padding: ${spacing.lg};
  }

  .card-footer {
    padding: ${spacing.md} ${spacing.lg};
    border-top: 1px solid ${colors.border};
  }
`;

// Gemeinsame Stile für Formulare
export const formStyles = `
  .form-group {
    margin-bottom: ${spacing.md};
  }

  .form-label {
    display: block;
    margin-bottom: ${spacing.xs};
    font-size: ${typography.fontSize.sm};
    font-weight: ${typography.fontWeight.medium};
    color: ${colors.text.secondary};
  }

  .form-control {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: ${typography.fontSize.md};
    font-family: ${typography.fontFamily.primary};
    line-height: ${typography.lineHeight.normal};
    color: ${colors.text.primary};
    background-color: ${colors.card};
    border: 1px solid ${colors.border};
    border-radius: ${borderRadius.md};
    transition: ${transitions.default};
  }

  .form-control:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px ${colors.primary}33;
  }

  .form-control::placeholder {
    color: ${colors.text.light};
  }

  .form-control:disabled {
    background-color: ${colors.background};
    opacity: 0.6;
    cursor: not-allowed;
  }

  .form-error {
    color: ${colors.error};
    font-size: ${typography.fontSize.sm};
    margin-top: ${spacing.xs};
  }

  .form-hint {
    color: ${colors.text.light};
    font-size: ${typography.fontSize.sm};
    margin-top: ${spacing.xs};
  }
`;

// Gemeinsame Stile für Tabellen
export const tableStyles = `
  .table {
    width: 100%;
    border-collapse: collapse;
  }

  .table th,
  .table td {
    padding: ${spacing.md};
    text-align: left;
    border-bottom: 1px solid ${colors.border};
  }

  .table th {
    font-weight: ${typography.fontWeight.semibold};
    color: ${colors.text.secondary};
    background-color: ${colors.background};
  }

  .table tr:hover {
    background-color: ${colors.background};
  }

  .table-striped tbody tr:nth-of-type(odd) {
    background-color: ${colors.background};
  }

  .table-bordered {
    border: 1px solid ${colors.border};
  }

  .table-bordered th,
  .table-bordered td {
    border: 1px solid ${colors.border};
  }
`;

// Gemeinsame Stile für Alerts
export const alertStyles = `
  .alert {
    padding: ${spacing.md} ${spacing.lg};
    margin-bottom: ${spacing.md};
    border: 1px solid transparent;
    border-radius: ${borderRadius.md};
  }

  .alert-success {
    background-color: ${colors.success}1a;
    border-color: ${colors.success};
    color: ${colors.success};
  }

  .alert-warning {
    background-color: ${colors.warning}1a;
    border-color: ${colors.warning};
    color: ${colors.warning};
  }

  .alert-error {
    background-color: ${colors.error}1a;
    border-color: ${colors.error};
    color: ${colors.error};
  }

  .alert-info {
    background-color: ${colors.accent}1a;
    border-color: ${colors.accent};
    color: ${colors.accent};
  }
`;

// Gemeinsame Stile für Badges
export const badgeStyles = `
  .badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    font-size: ${typography.fontSize.xs};
    font-weight: ${typography.fontWeight.medium};
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: ${borderRadius.full};
  }

  .badge-primary {
    background-color: ${colors.primary};
    color: ${colors.text.inverted};
  }

  .badge-secondary {
    background-color: ${colors.secondary};
    color: ${colors.text.inverted};
  }

  .badge-success {
    background-color: ${colors.success};
    color: ${colors.text.inverted};
  }

  .badge-warning {
    background-color: ${colors.warning};
    color: ${colors.text.inverted};
  }

  .badge-error {
    background-color: ${colors.error};
    color: ${colors.text.inverted};
  }

  .badge-outline {
    background-color: transparent;
    border: 1px solid currentColor;
  }

  .badge-outline.badge-primary {
    color: ${colors.primary};
  }

  .badge-outline.badge-secondary {
    color: ${colors.secondary};
  }
`;

// Gemeinsame Stile für Navigationsleisten
export const navStyles = `
  .navbar {
    display: flex;
    align-items: center;
    padding: ${spacing.md} ${spacing.lg};
    background-color: ${colors.card};
    box-shadow: ${shadows.sm};
  }

  .navbar-brand {
    font-size: ${typography.fontSize.xl};
    font-weight: ${typography.fontWeight.bold};
    color: ${colors.primary};
    text-decoration: none;
  }

  .navbar-nav {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .navbar-nav-item {
    margin-left: ${spacing.md};
  }

  .navbar-nav-link {
    color: ${colors.text.secondary};
    text-decoration: none;
    padding: ${spacing.sm} ${spacing.md};
    border-radius: ${borderRadius.md};
    transition: ${transitions.default};
  }

  .navbar-nav-link:hover {
    background-color: ${colors.background};
  }

  .navbar-nav-link.active {
    color: ${colors.primary};
    font-weight: ${typography.fontWeight.medium};
  }
`;

// Gemeinsame Stile für Modals
export const modalStyles = `
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${zIndex.modal};
  }

  .modal {
    background-color: ${colors.card};
    border-radius: ${borderRadius.lg};
    box-shadow: ${shadows.xl};
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${spacing.md} ${spacing.lg};
    border-bottom: 1px solid ${colors.border};
  }

  .modal-title {
    font-size: ${typography.fontSize.xl};
    font-weight: ${typography.fontWeight.semibold};
    margin: 0;
  }

  .modal-close {
    background: none;
    border: none;
    cursor: pointer;
    font-size: ${typography.fontSize.xl};
    color: ${colors.text.light};
  }

  .modal-body {
    padding: ${spacing.lg};
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: ${spacing.md} ${spacing.lg};
    border-top: 1px solid ${colors.border};
  }

  .modal-footer .btn + .btn {
    margin-left: ${spacing.sm};
  }
`;

// Gemeinsame Stile für Tabs
export const tabStyles = `
  .tabs {
    display: flex;
    border-bottom: 1px solid ${colors.border};
  }

  .tab {
    padding: ${spacing.md} ${spacing.lg};
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: ${transitions.default};
    color: ${colors.text.secondary};
  }

  .tab:hover {
    color: ${colors.primary};
  }

  .tab.active {
    color: ${colors.primary};
    border-bottom-color: ${colors.primary};
  }

  .tab-content {
    padding: ${spacing.lg} 0;
  }

  .tab-pane {
    display: none;
  }

  .tab-pane.active {
    display: block;
  }
`;

// Gemeinsame Stile für Tooltips
export const tooltipStyles = `
  .tooltip {
    position: relative;
    display: inline-block;
  }

  .tooltip-content {
    position: absolute;
    z-index: ${zIndex.tooltip};
    background-color: ${colors.secondary};
    color: ${colors.text.inverted};
    padding: ${spacing.xs} ${spacing.sm};
    border-radius: ${borderRadius.sm};
    font-size: ${typography.fontSize.xs};
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: ${transitions.default};
  }

  .tooltip:hover .tooltip-content {
    opacity: 1;
    visibility: visible;
  }

  .tooltip-top .tooltip-content {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-5px);
  }

  .tooltip-bottom .tooltip-content {
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(5px);
  }

  .tooltip-left .tooltip-content {
    right: 100%;
    top: 50%;
    transform: translateY(-50%) translateX(-5px);
  }

  .tooltip-right .tooltip-content {
    left: 100%;
    top: 50%;
    transform: translateY(-50%) translateX(5px);
  }
`;

// Gemeinsame Stile für Spinner/Loader
export const spinnerStyles = `
  .spinner {
    display: inline-block;
    width: 1.5rem;
    height: 1.5rem;
    border: 0.2rem solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: ${colors.primary};
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .spinner-sm {
    width: 1rem;
    height: 1rem;
    border-width: 0.15rem;
  }

  .spinner-lg {
    width: 2.5rem;
    height: 2.5rem;
    border-width: 0.25rem;
  }
`;

// Gemeinsame Stile für Pagination
export const paginationStyles = `
  .pagination {
    display: flex;
    list-style: none;
    padding: 0;
    margin: ${spacing.md} 0;
  }

  .pagination-item {
    margin: 0 ${spacing.xs};
  }

  .pagination-link {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 2rem;
    height: 2rem;
    padding: 0 ${spacing.sm};
    border-radius: ${borderRadius.md};
    background-color: ${colors.card};
    color: ${colors.text.primary};
    text-decoration: none;
    transition: ${transitions.default};
  }

  .pagination-link:hover {
    background-color: ${colors.background};
  }

  .pagination-link.active {
    background-color: ${colors.primary};
    color: ${colors.text.inverted};
  }

  .pagination-link.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Gemeinsame Stile für Dropdown-Menüs
export const dropdownStyles = `
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-toggle {
    cursor: pointer;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: ${zIndex.dropdown};
    min-width: 10rem;
    padding: ${spacing.sm} 0;
    margin-top: ${spacing.xs};
    background-color: ${colors.card};
    border-radius: ${borderRadius.md};
    box-shadow: ${shadows.lg};
    display: none;
  }

  .dropdown-menu.show {
    display: block;
  }

  .dropdown-item {
    display: block;
    width: 100%;
    padding: ${spacing.sm} ${spacing.md};
    clear: both;
    text-align: inherit;
    white-space: nowrap;
    background-color: transparent;
    border: 0;
    color: ${colors.text.primary};
    text-decoration: none;
    cursor: pointer;
  }

  .dropdown-item:hover {
    background-color: ${colors.background};
  }

  .dropdown-divider {
    height: 0;
    margin: ${spacing.xs} 0;
    overflow: hidden;
    border-top: 1px solid ${colors.border};
  }
`;

// Gemeinsame Stile für Grid-Layout
export const gridStyles = `
  .container {
    width: 100%;
    padding-right: ${spacing.md};
    padding-left: ${spacing.md};
    margin-right: auto;
    margin-left: auto;
  }

  @media (min-width: ${breakpoints.sm}) {
    .container {
      max-width: 540px;
    }
  }

  @media (min-width: ${breakpoints.md}) {
    .container {
      max-width: 720px;
    }
  }

  @media (min-width: ${breakpoints.lg}) {
    .container {
      max-width: 960px;
    }
  }

  @media (min-width: ${breakpoints.xl}) {
    .container {
      max-width: 1140px;
    }
  }

  .container-fluid {
    width: 100%;
    padding-right: ${spacing.md};
    padding-left: ${spacing.md};
    margin-right: auto;
    margin-left: auto;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    margin-right: -${spacing.md};
    margin-left: -${spacing.md};
  }

  .col {
    position: relative;
    width: 100%;
    padding-right: ${spacing.md};
    padding-left: ${spacing.md};
  }

  .col-auto {
    flex: 0 0 auto;
    width: auto;
  }

  .col-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }
  .col-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
  .col-3 { flex: 0 0 25%; max-width: 25%; }
  .col-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
  .col-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
  .col-6 { flex: 0 0 50%; max-width: 50%; }
  .col-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
  .col-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
  .col-9 { flex: 0 0 75%; max-width: 75%; }
  .col-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
  .col-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
  .col-12 { flex: 0 0 100%; max-width: 100%; }
`;

// Gemeinsame Stile für Utility-Klassen
export const utilityStyles = `
  /* Margin und Padding */
  .m-0 { margin: 0 !important; }
  .mt-0 { margin-top: 0 !important; }
  .mr-0 { margin-right: 0 !important; }
  .mb-0 { margin-bottom: 0 !important; }
  .ml-0 { margin-left: 0 !important; }

  .m-1 { margin: ${spacing.xs} !important; }
  .mt-1 { margin-top: ${spacing.xs} !important; }
  .mr-1 { margin-right: ${spacing.xs} !important; }
  .mb-1 { margin-bottom: ${spacing.xs} !important; }
  .ml-1 { margin-left: ${spacing.xs} !important; }

  .m-2 { margin: ${spacing.sm} !important; }
  .mt-2 { margin-top: ${spacing.sm} !important; }
  .mr-2 { margin-right: ${spacing.sm} !important; }
  .mb-2 { margin-bottom: ${spacing.sm} !important; }
  .ml-2 { margin-left: ${spacing.sm} !important; }

  .m-3 { margin: ${spacing.md} !important; }
  .mt-3 { margin-top: ${spacing.md} !important; }
  .mr-3 { margin-right: ${spacing.md} !important; }
  .mb-3 { margin-bottom: ${spacing.md} !important; }
  .ml-3 { margin-left: ${spacing.md} !important; }

  .m-4 { margin: ${spacing.lg} !important; }
  .mt-4 { margin-top: ${spacing.lg} !important; }
  .mr-4 { margin-right: ${spacing.lg} !important; }
  .mb-4 { margin-bottom: ${spacing.lg} !important; }
  .ml-4 { margin-left: ${spacing.lg} !important; }

  .m-5 { margin: ${spacing.xl} !important; }
  .mt-5 { margin-top: ${spacing.xl} !important; }
  .mr-5 { margin-right: ${spacing.xl} !important; }
  .mb-5 { margin-bottom: ${spacing.xl} !important; }
  .ml-5 { margin-left: ${spacing.xl} !important; }

  .p-0 { padding: 0 !important; }
  .pt-0 { padding-top: 0 !important; }
  .pr-0 { padding-right: 0 !important; }
  .pb-0 { padding-bottom: 0 !important; }
  .pl-0 { padding-left: 0 !important; }

  .p-1 { padding: ${spacing.xs} !important; }
  .pt-1 { padding-top: ${spacing.xs} !important; }
  .pr-1 { padding-right: ${spacing.xs} !important; }
  .pb-1 { padding-bottom: ${spacing.xs} !important; }
  .pl-1 { padding-left: ${spacing.xs} !important; }

  .p-2 { padding: ${spacing.sm} !important; }
  .pt-2 { padding-top: ${spacing.sm} !important; }
  .pr-2 { padding-right: ${spacing.sm} !important; }
  .pb-2 { padding-bottom: ${spacing.sm} !important; }
  .pl-2 { padding-left: ${spacing.sm} !important; }

  .p-3 { padding: ${spacing.md} !important; }
  .pt-3 { padding-top: ${spacing.md} !important; }
  .pr-3 { padding-right: ${spacing.md} !important; }
  .pb-3 { padding-bottom: ${spacing.md} !important; }
  .pl-3 { padding-left: ${spacing.md} !important; }

  .p-4 { padding: ${spacing.lg} !important; }
  .pt-4 { padding-top: ${spacing.lg} !important; }
  .pr-4 { padding-right: ${spacing.lg} !important; }
  .pb-4 { padding-bottom: ${spacing.lg} !important; }
  .pl-4 { padding-left: ${spacing.lg} !important; }

  .p-5 { padding: ${spacing.xl} !important; }
  .pt-5 { padding-top: ${spacing.xl} !important; }
  .pr-5 { padding-right: ${spacing.xl} !important; }
  .pb-5 { padding-bottom: ${spacing.xl} !important; }
  .pl-5 { padding-left: ${spacing.xl} !important; }

  /* Text */
  .text-left { text-align: left !important; }
  .text-center { text-align: center !important; }
  .text-right { text-align: right !important; }

  .text-primary { color: ${colors.primary} !important; }
  .text-secondary { color: ${colors.secondary} !important; }
  .text-success { color: ${colors.success} !important; }
  .text-warning { color: ${colors.warning} !important; }
  .text-error { color: ${colors.error} !important; }

  .font-light { font-weight: ${typography.fontWeight.light} !important; }
  .font-regular { font-weight: ${typography.fontWeight.regular} !important; }
  .font-medium { font-weight: ${typography.fontWeight.medium} !important; }
  .font-semibold { font-weight: ${typography.fontWeight.semibold} !important; }
  .font-bold { font-weight: ${typography.fontWeight.bold} !important; }

  .text-xs { font-size: ${typography.fontSize.xs} !important; }
  .text-sm { font-size: ${typography.fontSize.sm} !important; }
  .text-md { font-size: ${typography.fontSize.md} !important; }
  .text-lg { font-size: ${typography.fontSize.lg} !important; }
  .text-xl { font-size: ${typography.fontSize.xl} !important; }

  /* Display */
  .d-none { display: none !important; }
  .d-inline { display: inline !important; }
  .d-inline-block { display: inline-block !important; }
  .d-block { display: block !important; }
  .d-flex { display: flex !important; }
  .d-inline-flex { display: inline-flex !important; }

  /* Flex */
  .flex-row { flex-direction: row !important; }
  .flex-column { flex-direction: column !important; }
  .flex-wrap { flex-wrap: wrap !important; }
  .flex-nowrap { flex-wrap: nowrap !important; }

  .justify-content-start { justify-content: flex-start !important; }
  .justify-content-end { justify-content: flex-end !important; }
  .justify-content-center { justify-content: center !important; }
  .justify-content-between { justify-content: space-between !important; }
  .justify-content-around { justify-content: space-around !important; }

  .align-items-start { align-items: flex-start !important; }
  .align-items-end { align-items: flex-end !important; }
  .align-items-center { align-items: center !important; }
  .align-items-baseline { align-items: baseline !important; }
  .align-items-stretch { align-items: stretch !important; }

  /* Position */
  .position-static { position: static !important; }
  .position-relative { position: relative !important; }
  .position-absolute { position: absolute !important; }
  .position-fixed { position: fixed !important; }
  .position-sticky { position: sticky !important; }

  /* Visibility */
  .visible { visibility: visible !important; }
  .invisible { visibility: hidden !important; }

  /* Misc */
  .w-100 { width: 100% !important; }
  .h-100 { height: 100% !important; }
  .mw-100 { max-width: 100% !important; }
  .mh-100 { max-height: 100% !important; }

  .rounded { border-radius: ${borderRadius.md} !important; }
  .rounded-sm { border-radius: ${borderRadius.sm} !important; }
  .rounded-lg { border-radius: ${borderRadius.lg} !important; }
  .rounded-circle { border-radius: 50% !important; }
  .rounded-0 { border-radius: 0 !important; }

  .shadow-none { box-shadow: none !important; }
  .shadow-sm { box-shadow: ${shadows.sm} !important; }
  .shadow { box-shadow: ${shadows.md} !important; }
  .shadow-lg { box-shadow: ${shadows.lg} !important; }
`;

// Kombiniere alle Stile
export const allStyles = `
  /* Reset und Basis */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.md};
    line-height: ${typography.lineHeight.normal};
    color: ${colors.text.primary};
    background-color: ${colors.background};
  }

  /* Komponenten-Stile */
  ${buttonStyles}
  ${cardStyles}
  ${formStyles}
  ${tableStyles}
  ${alertStyles}
  ${badgeStyles}
  ${navStyles}
  ${modalStyles}
  ${tabStyles}
  ${tooltipStyles}
  ${spinnerStyles}
  ${paginationStyles}
  ${dropdownStyles}
  ${gridStyles}
  ${utilityStyles}
`;

// Exportiere alle Stile und Komponenten
export default {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  transitions,
  zIndex,
  breakpoints,
  buttonStyles,
  cardStyles,
  formStyles,
  tableStyles,
  alertStyles,
  badgeStyles,
  navStyles,
  modalStyles,
  tabStyles,
  tooltipStyles,
  spinnerStyles,
  paginationStyles,
  dropdownStyles,
  gridStyles,
  utilityStyles,
  allStyles
};
