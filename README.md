# Indian Bike Driving 3D

A first playable Three.js bike-driving game with a procedural city, traffic, camera modes, collision response, desktop controls, mobile touch controls, HUD, minimap, loading overlay, **sound engine**, **checkpoints**, **garage upgrades**, and **save system**.

## Run

Install Node.js, then run:

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Verify

```bash
npm run build
npm run smoke
```

## Controls

- `W` / `ArrowUp`: accelerate
- `S` / `ArrowDown`: brake / reverse
- `A` / `ArrowLeft`: steer left
- `D` / `ArrowRight`: steer right
- `Space`: brake
- `Shift`: nitro
- `H`: horn
- `C`: switch camera

On mobile, use the joystick plus Brake, Boost, and Horn buttons.

## Features

- 🏍️ **Cannon-es raycast vehicle physics** with realistic suspension
- 🔊 **Procedural sound engine** — engine rumble, horn, checkpoint chime, collision noise
- 🏁 **Checkpoint missions** — collect 6 glowing checkpoints around the city for ₹100 each
- 💾 **Save system** — localStorage persistence for money, high score, and total distance
- 🔧 **Garage upgrades** — Speed, Handling, Nitro upgrades (5 levels each)
- 📱 **Mobile touch controls** with joystick
- 📊 **Adaptive quality** — automatic pixel ratio reduction when FPS drops
- 🗺️ **Minimap** with checkpoint indicators

## Upgrades

| Type | Base Cost | Effect per Level |
|------|-----------|------------------|
| Speed | ₹500 | +15% engine power |
| Handling | ₹400 | +15% steering response |
| Nitro | ₹600 | +15% nitro boost power |

## Next Build Targets

- Replace procedural bike, traffic, and buildings with optimized `.glb` assets
- Add proper missions with objectives (time trials, delivery)
- Add sound effects for traffic and environment ambience
- Convert repeated traffic/building meshes to more aggressive instancing and LOD
