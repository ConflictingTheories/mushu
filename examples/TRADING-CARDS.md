# Holographic 3D Trading Card Generator

A complete system for creating stunning interactive 3D trading cards with holographic shader effects, powered by **mushu** (WebGL2).

## Features

✨ **Holographic Effects**
- Advanced iridescent shimmer effects
- Scanline CRT aesthetic
- Dynamic color shifting based on view angle
- Fresnel edge glow with metallic appearance

🎨 **Customization**
- Multiple card layouts: Portrait, Landscape, Square
- Card styles: Bordered, Unbordered, Full Image
- Customizable border, brand, and accent colors
- Adjustable hologram intensity, shimmer speed, and glow

📱 **Interactive 3D**
- Mouse drag to rotate card in real-time
- Scroll/pinch to zoom
- Auto-rotation with pause on interaction
- Card flip animation
- Touch support for mobile devices

🔗 **Embeddable**
- Generate standalone iframe-embeddable viewers
- Self-contained card displays
- Works anywhere on the web
- Copy-paste embed codes

## Files

### Core Modules
- **`trading-card.js`** - Main entry point (re-exports from trading-card-mushu.js)
- **`trading-card-mushu.js`** - Core implementation using mushu's flow() API
  - `tradingCardGenerator()` - Configuration builder
  - `createCardViewer()` - 3D viewer renderer

### User Interfaces
- **`trading-card-generator.html`** - Full-featured card generator with live preview
- **`card-viewer.html`** - Standalone embeddable card viewer
- **`holographic-cards-demo.html`** - Demo and information page

## Quick Start

### Via HTML Generator (Easiest)
```html
<a href="./trading-card-generator.html">Launch Card Generator</a>
```

1. Open `trading-card-generator.html`
2. Upload front and back images
3. Configure colors and effects
4. Click "Generate Card"
5. Copy the embed code to use anywhere

### Via JavaScript API

```javascript
import { tradingCardGenerator, createCardViewer } from './trading-card.js';

// Create generator for UI configuration
const generator = tradingCardGenerator();
generator.setFrontImage('front.png');
generator.setBackImage('back.png');
generator.setBorderColor('#4a00e0');
generator.setHologramIntensity(0.7);
const config = generator.getConfig();

// Create viewer for rendering
const canvas = document.getElementById('canvas');
const viewer = createCardViewer(canvas, config);

// Interact with viewer
viewer.flipCard(true);
viewer.setAutoRotate(false);
viewer.rotate(0.1, 0.05);
viewer.zoom(1.2);
```

## Configuration Object

```javascript
{
    // Layout & Style
    layoutStyle: 'portrait',      // 'portrait', 'landscape', 'square'
    cardType: 'bordered',         // 'bordered', 'unbordered', 'full-image'
    
    // Colors
    borderColor: '#4a00e0',       // Hex color
    brandColor: '#00d4ff',        // Hex color  
    accentColor: '#ff00ff',       // Hex color
    
    // Effects (0.0 - 1.0 for intensity/glow)
    hologramIntensity: 0.7,       // Holograph effect strength
    shimmerSpeed: 1.2,            // Animation speed
    glowIntensity: 0.6,           // Edge glow strength
    
    // Interaction
    enableRotation: true,         // Allow mouse rotation
    enableZoom: true,             // Allow scroll zoom
    autoRotate: true,             // Auto-rotate card
    
    // Content
    title: 'Trading Card',        // Display title
    description: 'Interactive',   // Display description
    frontImage: null,             // Data URL or image path
    backImage: null               // Data URL or image path
}
```

## Viewer API

```javascript
const viewer = createCardViewer(canvas, config);

// Card interactions
viewer.flipCard(boolean);        // Flip to back/front
viewer.toggleFlip();             // Toggle flip state

// Effect control
viewer.setHologramIntensity(0-1);
viewer.setShimmerSpeed(number);
viewer.setGlowIntensity(0-1);

// Camera control
viewer.rotate(deltaX, deltaY);   // Rotate by amount
viewer.zoom(factor);              // Zoom by factor (>1 = zoom in)
viewer.setAutoRotate(boolean);   // Enable/disable auto-rotation

// Cleanup
viewer.dispose();                 // Clean up resources
```

## Embedding Cards

Generate an embed code in the generator, or programmatically:

```javascript
const config = generator.getConfig();
const embedUrl = generator.generateEmbedCode(config);

// Outputs: "./card-viewer.html?config=encoded_json"

// Create iframe HTML:
const html = `<iframe 
    src="${embedUrl}" 
    width="500" 
    height="600" 
    frameborder="0" 
    allowfullscreen
></iframe>`;
```

## Shader System

The system uses WebGL2 with custom holographic shaders:

- **Vertex Shader**: Calculates fresnel effect and normal vectors
- **Fragment Shader**:
  - Texture sampling with front/back blending
  - Perlin noise-based shimmer effect
  - Dynamic color shifting (iridescence)
  - Scanline overlay (CRT aesthetic)
  - Edge glow with fresnel factor
  - Card type masking (borders, rounded corners)

## Browser Support

- Chrome 51+
- Firefox 65+
- Safari 15+
- Edge 79+

(Requires WebGL2 support)

## Performance Tips

- Use JPG/WebP formats for images (better compression)
- Keep image dimensions reasonable (1024x1024 max recommended)
- Adjust shimmer speed for performance
- Use embeds sparingly to avoid multiple instances

## Examples

### Professional Trading Card
```javascript
const config = {
    layoutStyle: 'portrait',
    cardType: 'bordered',
    borderColor: '#1a1a1a',
    brandColor: '#ffd700',
    accentColor: '#ff6600',
    hologramIntensity: 0.8,
    shimmerSpeed: 1.0,
    glowIntensity: 0.7,
    title: 'Rare Hologram',
    description: 'Limited Edition'
};
```

### Modern Minimalist
```javascript
const config = {
    layoutStyle: 'square',
    cardType: 'unbordered',
    borderColor: '#ffffff',
    brandColor: '#000000',
    accentColor: '#00ff00',
    hologramIntensity: 0.4,
    shimmerSpeed: 0.6,
    glowIntensity: 0.3
};
```

## Troubleshooting

**Card not rendering?**
- Check browser WebGL2 support
- Verify canvas element exists
- Check browser console for errors

**Images not loading?**
- Use absolute URLs or proper relative paths
- Check CORS for images from other domains
- Ensure image format is supported (PNG, JPG, WebP)

**Performance issues?**
- Reduce hologram intensity
- Lower shimmer speed
- Use smaller images
- Check for other WebGL contexts on page

## Credits

Built with **mushu** - A fluent WebGL2/WebGPU creative coding library by Kyle Derby MacInnis.

## License

MIT
