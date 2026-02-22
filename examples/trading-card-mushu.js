/**
 * Holographic 3D Trading Card Display Generator - Built with mushu
 * 
 * Features:
 * - Multiple card styles (bordered, unbordered, full image, landscape, portrait)
 * - Holographic shader effects with iridescence and shimmer
 * - Support for front/back images with blending
 * - Interactive 3D display with zoom and rotation
 * - Embeddable iframe generation
 * 
 * Properly uses mushu's flow() API for WebGL2 rendering
 */

import { flow, plane, shader3d, clear, camera, uniform, texture, mat4, vec3 } from '../src/core/index.js';

/**
 * Create a trading card configuration generator
 */
export function tradingCardGenerator() {
    const state = {
        layoutStyle: 'portrait',
        cardType: 'bordered',
        borderColor: '#4a00e0',
        brandColor: '#00d4ff',
        accentColor: '#ff00ff',
        hologramIntensity: 0.7,
        shimmerSpeed: 1.2,
        glowIntensity: 0.6,
        title: 'Trading Card',
        description: 'Interactive 3D Card',
        enableRotation: true,
        enableZoom: true,
        autoRotate: true,
        frontImage: null,
        backImage: null
    };

    return {
        setFrontImage(image) { state.frontImage = image; return this; },
        setBackImage(image) { state.backImage = image; return this; },
        setBorderColor(color) { state.borderColor = color; return this; },
        setBrandColor(color) { state.brandColor = color; return this; },
        setAccentColor(color) { state.accentColor = color; return this; },
        setHologramIntensity(value) { state.hologramIntensity = Math.max(0, Math.min(1, value)); return this; },
        setShimmerSpeed(value) { state.shimmerSpeed = value; return this; },
        setGlowIntensity(value) { state.glowIntensity = Math.max(0, Math.min(1, value)); return this; },
        setLayoutStyle(style) { if (['portrait', 'landscape', 'square'].includes(style)) state.layoutStyle = style; return this; },
        setCardType(type) { if (['bordered', 'unbordered', 'full-image'].includes(type)) state.cardType = type; return this; },
        setTitle(title) { state.title = title; return this; },
        setDescription(description) { state.description = description; return this; },
        setEnableRotation(enable) { state.enableRotation = enable; return this; },
        setEnableZoom(enable) { state.enableZoom = enable; return this; },
        setAutoRotate(enable) { state.autoRotate = enable; return this; },
        getConfig() { return { ...state }; },
        generateEmbedCode(config) {
            const configStr = encodeURIComponent(JSON.stringify(config || state));
            return `./card-viewer.html?config=${configStr}`;
        }
    };
}

// Convert hex to RGB (0-1 range)
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
    ] : [0, 0, 0];
}

// Card type to integer
function cardTypeToInt(type) {
    const typeMap = { 'bordered': 0, 'unbounded': 1, 'unbordered': 1, 'full-image': 2 };
    return typeMap[type] ?? 0;
}

// Get card aspect ratio from layout style
function getCardAspect(layoutStyle) {
    switch (layoutStyle) {
        case 'landscape': return 3.5 / 2.5;
        case 'square': return 1.0;
        case 'portrait':
        default: return 2.5 / 3.5;
    }
}

// Create holographic vertex shader
const vertexShader = /* glsl */`#version 300 es
precision highp float;

layout(location = 0) in vec3 position;
layout(location = 1) in vec3 normal;
layout(location = 2) in vec2 uv;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;
uniform float time;

out vec3 vNormal;
out vec2 vUv;
out vec3 vWorldPos;
out float vFresnelFactor;

void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    
    // Transform normal
    vNormal = mat3(normalMatrix) * normal;
    vUv = uv;
    
    // Calculate view direction for fresnel
    vec3 viewDir = normalize(-worldPos.xyz);
    vFresnelFactor = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 2.0);
    
    gl_Position = projectionMatrix * viewMatrix * worldPos;
}`;

// Create holographic fragment shader with iridescence and shimmer effects
const fragmentShader = /* glsl */`#version 300 es
precision highp float;

in vec3 vNormal;
in vec2 vUv;
in vec3 vWorldPos;
in float vFresnelFactor;

uniform sampler2D frontTexture;
uniform sampler2D backTexture;
uniform vec3 borderColor;
uniform vec3 brandColor;
uniform vec3 accentColor;
uniform float hologramIntensity;
uniform float shimmerSpeed;
uniform float glowIntensity;
uniform float time;
uniform bool isFlipped;
uniform float cardType;
uniform bool hasFrontImage;
uniform bool hasBackImage;

out vec4 fragColor;

// Simple hash for noise
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Simple value noise
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
    vec2 uv = vUv;
    vec4 cardColor = vec4(1.0);
    
    // Sample front texture if available
    if (hasFrontImage) {
        vec4 front = texture(frontTexture, uv);
        if (isFlipped) {
            // Flip UV for back
            cardColor = texture(backTexture, vec2(1.0 - uv.x, uv.y));
        } else {
            cardColor = front;
        }
    } else {
        // Default gradient when no image
        if (isFlipped) {
            cardColor = vec4(brandColor * 0.8, 1.0);
        } else {
            cardColor = vec4(0.9, 0.9, 0.95, 1.0);
        }
    }
    
    // Create card mask based on card type
    float cardMask = 1.0;
    if (cardType == 0.0) { // bordered
        float borderWidth = 0.05;
        float dist = min(min(uv.x, uv.y), min(1.0 - uv.x, 1.0 - uv.y));
        cardMask = smoothstep(borderWidth - 0.02, borderWidth, dist);
    }
    
    // Holographic shimmer effect
    float shimmer = noise(uv * 10.0 + time * shimmerSpeed);
    float shimmer2 = noise(uv * 20.0 - time * shimmerSpeed * 0.5);
    
    // Color-shifting iridescence
    float hueShift = sin(time * shimmerSpeed * 0.3 + uv.x * 6.28 + uv.y * 3.14) * 0.5 + 0.5;
    vec3 hologramColor = mix(
        mix(brandColor, accentColor, hueShift),
        mix(accentColor, borderColor, hueShift * 0.5),
        shimmer * 0.5
    );
    
    // Fresnel glow effect
    float fresnelGlow = vFresnelFactor * vFresnelFactor;
    
    // Scanline effect
    float scanline = sin(uv.y * 80.0 + time * 2.0) * 0.03 + 0.97;
    
    // Edge glow
    float edgeDist = length(uv - vec2(0.5)) * 1.5;
    float edgeGlow = exp(-edgeDist * edgeDist * 2.0) * glowIntensity;
    
    // Combine everything
    vec3 finalColor = cardColor.rgb;
    
    // Add holographic effect
    finalColor = mix(finalColor, hologramColor, fresnelGlow * hologramIntensity * (0.3 + shimmer * 0.7));
    finalColor *= scanline;
    
    // Add edge glow
    finalColor += (brandColor + accentColor) * 0.5 * edgeGlow;
    
    // Add shimmer highlights
    finalColor += hologramColor * shimmer2 * hologramIntensity * 0.3;
    
    // Apply card mask (for border effect)
    if (cardType == 0.0) {
        // Add border color at edges
        float borderDist = min(min(uv.x, uv.y), min(1.0 - uv.x, 1.0 - uv.y));
        float border = 1.0 - smoothstep(0.0, 0.05, borderDist);
        finalColor = mix(finalColor, borderColor, border * 0.8);
    }
    
    fragColor = vec4(finalColor, cardColor.a * cardMask);
}`;

/**
 * Create a 3D trading card viewer using mushu's flow() API
 */
export function createCardViewer(canvas, config = {}) {
    const finalConfig = {
        layoutStyle: 'portrait',
        cardType: 'bordered',
        borderColor: '#4a00e0',
        brandColor: '#00d4ff',
        accentColor: '#ff00ff',
        hologramIntensity: 0.7,
        shimmerSpeed: 1.2,
        glowIntensity: 0.6,
        enableRotation: true,
        enableZoom: true,
        autoRotate: true,
        frontImage: null,
        backImage: null,
        title: 'Trading Card',
        description: 'Interactive 3D Card',
        ...config
    };

    // State for interaction
    const state = {
        rotationX: 0,
        rotationY: 0,
        zoom: 1.0,
        isFlipped: false,
        autoRotate: finalConfig.autoRotate,
        isDragging: false,
        lastMouseX: 0,
        lastMouseY: 0,
        time: 0
    };

    // Calculate aspect ratio for card
    const aspectRatio = getCardAspect(finalConfig.layoutStyle);
    const cardWidth = 2.0;
    const cardHeight = cardWidth / aspectRatio;

    // Create model matrix
    let modelMatrix = mat4.create();
    let normalMatrix = mat4.create();

    // Helper to create default texture
    function createDefaultTexture(r, g, b) {
        const texCanvas = document.createElement('canvas');
        texCanvas.width = 2;
        texCanvas.height = 2;
        const ctx = texCanvas.getContext('2d');
        ctx.fillStyle = `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
        ctx.fillRect(0, 0, 2, 2);
        return texCanvas;
    }

    // Setup textures
    let frontTextureSource = finalConfig.frontImage;
    let backTextureSource = finalConfig.backImage;

    // Use default textures if no images provided
    if (!frontTextureSource) {
        frontTextureSource = createDefaultTexture(0.95, 0.95, 1.0);
    }
    if (!backTextureSource) {
        const rgb = hexToRgb(finalConfig.brandColor);
        backTextureSource = createDefaultTexture(rgb[0] * 255, rgb[1] * 255, rgb[2] * 255);
    }

    // Get initial colors
    const borderRgb = hexToRgb(finalConfig.borderColor);
    const brandRgb = hexToRgb(finalConfig.brandColor);
    const accentRgb = hexToRgb(finalConfig.accentColor);
    const hasFront = !!finalConfig.frontImage;
    const hasBack = !!finalConfig.backImage;

    // Build the flow pipeline
    const flw = flow(canvas)
        // Clear to transparent
        .use(clear({ r: 0, g: 0, b: 0, a: 0 }))

        // Camera setup - position camera based on zoom
        .use(camera({
            position: [0, 0, 3.5 / state.zoom],
            near: 0.1,
            far: 100,
            fov: 45
        }))

        // Front texture
        .use(texture(frontTextureSource, {
            name: 'frontTexture',
            unit: 0,
            generateMipmaps: true,
            flipY: false
        }))

        // Back texture
        .use(texture(backTextureSource, {
            name: 'backTexture',
            unit: 1,
            generateMipmaps: true,
            flipY: false
        }))

        // Custom shader for holographic card
        .use(shader3d(vertexShader, fragmentShader, {
            transparent: true,
            depthWrite: true,
            depthTest: true,
            cullFace: 'NONE'
        }))

        // Uniforms that update each frame
        .use(uniform('time', (ctx) => state.time))
        .use(uniform('isFlipped', (ctx) => state.isFlipped ? 1 : 0))
        .use(uniform('borderColor', borderRgb))
        .use(uniform('brandColor', brandRgb))
        .use(uniform('accentColor', accentRgb))
        .use(uniform('hologramIntensity', finalConfig.hologramIntensity))
        .use(uniform('shimmerSpeed', finalConfig.shimmerSpeed))
        .use(uniform('glowIntensity', finalConfig.glowIntensity))
        .use(uniform('cardType', cardTypeToInt(finalConfig.cardType)))

        // Model matrix - handles rotation
        .use(uniform('modelMatrix', (ctx) => {
            // Calculate model matrix with rotation
            const m = mat4.create();

            // Apply rotation
            mat4.fromEuler(m, state.rotationX, state.rotationY, 0);

            // Apply zoom to the scale
            const scale = state.zoom;
            m[0] *= scale;
            m[5] *= scale;
            m[10] *= scale;

            return m;
        }))

        .use(uniform('normalMatrix', (ctx) => {
            // Calculate normal matrix (inverse transpose of model matrix)
            const m = mat4.create();
            mat4.fromEuler(m, state.rotationX, state.rotationY, 0);
            // For normal matrix, we don't need the scale (it's 1:1)
            return m;
        }))

        // Card geometry - plane with correct aspect ratio
        .use(plane({
            width: cardWidth,
            height: cardHeight
        }))

        // Animation plugin for auto-rotation and state updates
        .use({
            name: 'card-animation',
            render(ctx) {
                // Update time from flow context
                state.time = ctx.time;

                // Auto rotation
                if (state.autoRotate && !state.isDragging) {
                    state.rotationY += ctx.delta * 0.5;
                }
            }
        })

        .go();

    // Mouse/touch interaction handlers
    if (finalConfig.enableRotation && canvas) {
        canvas.addEventListener('mousedown', (e) => {
            state.isDragging = true;
            state.lastMouseX = e.clientX;
            state.lastMouseY = e.clientY;
            if (state.autoRotate) {
                state.autoRotate = false;
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (state.isDragging) {
                const deltaX = (e.clientX - state.lastMouseX) * 0.005;
                const deltaY = (e.clientY - state.lastMouseY) * 0.005;

                state.rotationY += deltaX;
                state.rotationX += deltaY;

                // Clamp vertical rotation
                state.rotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, state.rotationX));

                state.lastMouseX = e.clientX;
                state.lastMouseY = e.clientY;
            }
        });

        canvas.addEventListener('mouseup', () => {
            state.isDragging = false;
        });

        canvas.addEventListener('mouseleave', () => {
            state.isDragging = false;
        });

        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                state.isDragging = true;
                state.lastMouseX = e.touches[0].clientX;
                state.lastMouseY = e.touches[0].clientY;
                if (state.autoRotate) {
                    state.autoRotate = false;
                }
            }
        });

        canvas.addEventListener('touchmove', (e) => {
            if (state.isDragging && e.touches.length === 1) {
                const deltaX = (e.touches[0].clientX - state.lastMouseX) * 0.005;
                const deltaY = (e.touches[0].clientY - state.lastMouseY) * 0.005;

                state.rotationY += deltaX;
                state.rotationX += deltaY;
                state.rotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, state.rotationX));

                state.lastMouseX = e.touches[0].clientX;
                state.lastMouseY = e.touches[0].clientY;
            }
        });

        canvas.addEventListener('touchend', () => {
            state.isDragging = false;
        });
    }

    // Zoom support
    if (finalConfig.enableZoom && canvas) {
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const factor = e.deltaY > 0 ? 1.1 : 0.9;
            state.zoom = Math.max(0.5, Math.min(3, state.zoom * factor));
        }, { passive: false });
    }

    // Return API for controlling the card viewer
    return {
        flipCard(shouldFlip) {
            state.isFlipped = shouldFlip;
        },
        toggleFlip() {
            state.isFlipped = !state.isFlipped;
        },
        setHologramIntensity(value) {
            finalConfig.hologramIntensity = Math.max(0, Math.min(1, value));
            // Update uniform
            const shader = flw.ctx?.state?.shader3d;
            if (shader) {
                shader.setUniform('hologramIntensity', finalConfig.hologramIntensity, flw.ctx);
            }
        },
        setShimmerSpeed(value) {
            finalConfig.shimmerSpeed = value;
        },
        setGlowIntensity(value) {
            finalConfig.glowIntensity = Math.max(0, Math.min(1, value));
        },
        setAutoRotate(enable) {
            state.autoRotate = enable;
        },
        setZoom(zoom) {
            state.zoom = Math.max(0.5, Math.min(3, zoom));
        },
        rotate(deltaX, deltaY) {
            state.rotationY += deltaX;
            state.rotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, state.rotationX + deltaY));
        },
        zoom(factor) {
            state.zoom = Math.max(0.5, Math.min(3, state.zoom * factor));
        },
        getRotation() {
            return { x: state.rotationX, y: state.rotationY };
        },
        getZoom() {
            return state.zoom;
        },
        dispose() {
            flw.destroy();
        }
    };
}

