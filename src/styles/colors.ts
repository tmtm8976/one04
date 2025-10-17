export const colors = {
    // Primary Backgrounds
    background: {
      primary: '#0F0F0F',      // Very dark gray (not pure black)
      secondary: '#1A1A1A',    // Slightly lighter for cards/modals
      tertiary: '#252525',     // Input fields, disabled states
      elevated: '#2A2A2A',     // Floating elements, app bar
    },
  
    // Surface Colors
    surface: {
      default: '#1A1A1A',      // Default surface
      elevated: '#2A2A2A',     // Cards, sheets, elevated surfaces
      overlay: '#1A1A1AE6',    // Modal overlays (90% opacity)
      input: '#252525',        // Input field backgrounds
      divider: '#333333',      // Subtle dividers and borders
    },
  
    // Text Colors
    text: {
      primary: '#FFFFFF',      // Main text - pure white for contrast
      secondary: '#B3B3B3',    // Secondary text - soft gray
      tertiary: '#808080',     // Placeholder text, disabled
      inverse: '#0F0F0F',      // Text on light backgrounds
      hint: '#666666',         // Very subtle text
    },
  
    // Accent Colors (Your simple tint preference)
    accent: {
      primary: '#00D4AA',      // Mint green - fresh, trustworthy (fintech favorite)
      secondary: '#0099CC',    // Professional blue - reliable
      tertiary: '#6C5CE7',     // Subtle purple - premium feel
    },
  
    // Functional Colors
    status: {
      success: '#00C851',      // Transaction completed
      warning: '#FF8800',      // Pending, rate expiring
      error: '#FF4444',        // Failed transactions, errors
      info: '#33B5E5',         // Informational messages
      pending: '#FFC107',      // Processing status
    },
  
    // Interactive Elements
    interactive: {
      primary: '#00D4AA',      // Primary buttons, links
      primaryHover: '#00B894',  // Hover state
      primaryPressed: '#00A085', // Pressed state
      secondary: '#2A2A2A',    // Secondary buttons
      secondaryHover: '#333333', // Secondary hover
      disabled: '#1A1A1A',     // Disabled buttons
      disabledText: '#666666', // Disabled text
    },
  
    // Border Colors
    border: {
      subtle: '#333333',       // Very subtle borders
      default: '#404040',      // Default borders
      focused: '#00D4AA',      // Focused input borders
      error: '#FF4444',        // Error state borders
      success: '#00C851',      // Success state borders
    },
  
    // Shadows (for elevation)
    shadow: {
      light: 'rgba(0, 0, 0, 0.1)',
      medium: 'rgba(0, 0, 0, 0.2)',
      heavy: 'rgba(0, 0, 0, 0.3)',
      colored: 'rgba(0, 212, 170, 0.15)', // Accent shadow
    },
  }
  
  // Semantic Color Mapping (for better development experience)
  export const semanticColors = {
    // App Structure
    appBackground: colors.background.primary,
    cardBackground: colors.surface.elevated,
    modalBackground: colors.surface.overlay,
    
    // Typography
    headingText: colors.text.primary,
    bodyText: colors.text.secondary,
    captionText: colors.text.tertiary,
    
    // Branding
    brand: colors.accent.primary,
    brandSecondary: colors.accent.secondary,
    
    // Transaction States
    transactionCompleted: colors.status.success,
    transactionPending: colors.status.pending,
    transactionFailed: colors.status.error,
    
    // KYC States
    kycApproved: colors.status.success,
    kycPending: colors.status.warning,
    kycRejected: colors.status.error,
    
    // Network States
    online: colors.status.success,
    offline: colors.status.error,
    syncing: colors.status.warning,
  }