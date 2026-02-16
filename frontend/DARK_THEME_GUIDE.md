# Dark Theme Guide

## Overview
The FixOnTheGo application features a professional dark theme with a blue-purple accent color scheme optimized for both aesthetics and readability.

## Color Palette

### Dark Mode Colors
- **Background**: `oklch(0.11 0.012 265)` - Deep blue-tinted dark background
- **Foreground**: `oklch(0.97 0.005 265)` - Bright text with subtle blue tint
- **Card**: `oklch(0.16 0.015 265)` - Elevated surface color
- **Primary**: `oklch(0.62 0.24 262)` - Vibrant blue accent
- **Secondary**: `oklch(0.72 0.16 35)` - Warm orange accent
- **Muted**: `oklch(0.22 0.015 265)` - Subtle background elements

## Features

### 1. **Smooth Transitions**
All theme changes include smooth 300ms transitions for a polished user experience.

### 2. **Enhanced Scrollbars**
Custom styled scrollbars in dark mode with subtle blue tints matching the overall theme.

### 3. **Glass Morphism**
`.glass` class provides beautiful frosted glass effects with blur and transparency:
- Backdrop blur with color saturation
- Subtle border with primary color tint

### 4. **Card Glow Effects**
`.card-glow` class adds subtle lighting effects to cards:
- Primary color shadow on hover
- Smooth elevation transitions

### 5. **Gradient Backgrounds**
Pre-defined gradient utilities:
- `.dark-gradient-primary` - Primary color gradient
- `.dark-gradient-secondary` - Background gradient
- `.text-gradient` - Gradient text effect

### 6. **Enhanced Form Elements**
- Focus states with primary color rings
- Improved contrast for better accessibility
- Smooth hover transitions

### 7. **Badge Variants**
Themed badge styles for different states:
- `.badge-primary` - Primary accent
- `.badge-success` - Success state (green)
- `.badge-warning` - Warning state (amber)
- `.badge-danger` - Danger state (red)

## Usage Examples

### Basic Card with Glow
```jsx
<div className="card-glow p-6 rounded-lg">
  <h3 className="text-lg font-semibold">Card Title</h3>
  <p className="text-muted-foreground">Card content</p>
</div>
```

### Glass Effect Panel
```jsx
<div className="glass p-6 rounded-xl">
  <h2 className="text-xl font-bold">Glass Panel</h2>
</div>
```

### Gradient Text
```jsx
<h1 className="text-4xl font-bold text-gradient">
  Beautiful Gradient Heading
</h1>
```

### Themed Button
```jsx
<button className="btn-primary px-4 py-2 rounded-md">
  Primary Button
</button>
```

### Status Badge
```jsx
<span className="badge-success px-3 py-1 rounded-full text-sm">
  Active
</span>
```

## Customization

### Changing Theme Colors
Edit the CSS variables in `src/index.css` under the `.dark` selector:

```css
.dark {
  --primary: oklch(0.62 0.24 262); /* Change primary color */
  --secondary: oklch(0.72 0.16 35); /* Change secondary color */
}
```

### Adding Custom Gradients
Add new gradient classes in the utilities section:

```css
.dark-gradient-custom {
  background: linear-gradient(
    135deg,
    oklch(0.45 0.22 262) 0%,
    oklch(0.72 0.16 35) 100%
  );
}
```

## Accessibility

The dark theme is designed with WCAG 2.1 AA standards in mind:
- Minimum contrast ratio of 4.5:1 for normal text
- 3:1 for large text and UI components
- Focus indicators are clearly visible
- Color is not the only means of conveying information

## Browser Support

The theme uses modern CSS features:
- `oklch()` color space for perceptually uniform colors
- `backdrop-filter` for glass effects
- CSS custom properties (variables)
- Supported in Chrome 111+, Firefox 113+, Safari 15.4+

For older browsers, graceful degradation ensures basic functionality.

## Performance

The theme is optimized for performance:
- Minimal DOM reflows during theme switches
- Hardware-accelerated transitions
- Efficient CSS selectors
- No JavaScript required for core styling

## Tips

1. **Consistency**: Use the predefined color variables instead of hardcoded colors
2. **Contrast**: Always test text readability in both light and dark modes
3. **Shadows**: Dark mode shadows should be more subtle than light mode
4. **Animations**: Keep animations smooth and purposeful
5. **Testing**: Test the theme on different screen types (OLED, LCD, etc.)
