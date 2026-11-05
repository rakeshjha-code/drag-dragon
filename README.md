# Drag-Dragon 🐉

An interactive, fluid, Japanese tattoo-inspired dragon simulation built entirely with pure vanilla HTML5 Canvas, CSS3, and modern JavaScript.

The dragon follows cursor and touch movements gracefully using an Inverse Kinematics (IK) physics chain, dynamic sinusoidal tapering, negative space layering, and stylized line art.

## ✨ Features

- **Procedural Inverse Kinematics (IK)**: 60-joint spine with distance and angle constraints for organic serpentine motion.
- **Tattoo Line-Art Aesthetic**: Negative-space silhouette fill, tapering profile, spinal line, swept fins, V-scales, and detailed head geometry (horns, whiskers, crest, and eyes).
- **Dual Aesthetic Themes**: Seamless transition between light (sumi-e ink on parchment) and dark (white line-art on dark slate) with `prefers-color-scheme` detection.
- **High-DPI Retina Support**: Automatically scales to `devicePixelRatio` for razor-sharp strokes on high-resolution screens.
- **Cross-Platform Pointer Controls**: Smooth tracking across mouse, touch, and stylus devices with touch action locking.
- **Zero Dependencies**: Lightweight, performant, and runs in any modern browser without build tools.

## 🕹️ Controls

- **Move Mouse / Drag Touch**: Lead the dragon across the canvas.
- **Theme Toggle Button** (bottom right): Switch between Light and Dark aesthetic modes.

## 🚀 Getting Started

Simply open `index.html` in any modern web browser or serve locally:

```bash
# Using Python built-in server
python -m http.server 8000

# Using Node.js npx
npx serve .
```

## 📄 License

MIT
