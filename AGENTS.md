# AGENTS.md — Exhaust Energy Recovery System 3D

## 1. Project Overview

This project is an interactive 3D mechanical engineering visualization of a heavy-duty vehicle exhaust energy recovery system.

The application demonstrates a conceptual mechanical assembly that uses exhaust flow to drive a turbine connected to an electrical generator.

The primary goals are:
- High-quality 3D mechanical visualization.
- Interactive component inspection.
- Realistic materials, lighting, and animations.
- A dynamic engineering dashboard.
- Smooth camera controls and simulation-style presentation.
- Responsive and maintainable application code.

## 2. Technology Stack

The project uses the following technologies, subject to the existing repository configuration:

- React 19
- Vite
- Three.js
- React Three Fiber
- Drei
- Zustand
- Tailwind CSS v4
- WebGL

Before introducing dependencies or changing configuration, inspect `package.json` and the existing implementation.

Do not upgrade dependencies or replace libraries without a clear technical reason.

## 3. Core Mechanical Assembly

Preserve the conceptual arrangement and visual identity of these components:

1. Engine / Combustion Source
2. Main Exhaust Pipe
3. Exhaust / Muffler Chamber
4. High-Velocity Exhaust Nozzle
5. Turbine with exactly 12 blades
6. Common Rotational Shaft
7. Slanted Exhaust Deflector
8. Bypass Valve System
9. Electrical Generator
10. Power Electronics
11. Vehicle Battery Pack
12. Exhaust Outlet

### Mechanical requirements

- Maintain the intended assembly order and component alignment.
- Preserve the central shaft connection between the turbine and generator.
- Keep the turbine blade count at exactly 12.
- Preserve the exhaust deflector's intended slanted orientation.
- Keep connecting wires, shafts, pipes, and attachment points aligned.
- Avoid changing the model geometry unnecessarily when implementing UI improvements.
- Do not claim physical accuracy unless the relevant engineering calculations and geometry have been verified.

## 4. 3D Scene and Camera

The 3D model must remain genuinely interactive.

Maintain:
- Full 360-degree orbit around the assembly.
- Camera rotation, panning, and zoom.
- Clear visibility from front, back, top, bottom, and side views.
- Functional reset-view behavior.
- Stable camera controls during simulation and component inspection.

### Scene graph rules

- Group related mechanical components using appropriate Three.js groups.
- Attach objects that must move together to the correct parent group.
- Use local coordinates for objects belonging to a shared assembly.
- Ensure child objects inherit the intended parent transformations.
- Update wire endpoints when connected components move.
- Avoid using fixed browser coordinates to position objects that belong in the 3D world.
- Do not attach physical objects to the camera unless they are intentionally designed as camera-space UI.

## 5. Dashboard — TURBO AI

The dashboard is a core part of the project and must retain its futuristic engineering HUD appearance.

### Required parameters

Display and update:
- Engine RPM
- Exhaust Temperature (°C)
- Exhaust Pressure (kPa)
- Recovered Power (W)

### Dashboard behavior

- Keep the dashboard synchronized with the application's parameter state.
- Preserve the existing neon colors, typography, borders, indicators, and glass-like appearance.
- Ensure values remain readable during camera rotation and zoom.
- Avoid duplicating the dashboard when modifying its rendering implementation.
- Preserve existing parameter update logic unless changes are necessary and explicitly intended.

### Physical attachment

If the dashboard is intended to move with the vehicle:
- Attach it to the appropriate vehicle or assembly group.
- Ensure it inherits position and rotation correctly.
- Keep its connecting wires attached to the correct components.
- Avoid independent animations that cause it to drift away from the assembly.

### Double-sided rendering

When both faces of the dashboard must be visible:
- Render the complete dashboard content on both faces.
- Keep text upright and readable from each side.
- Synchronize parameter values and indicators on both faces.
- Do not assume that a `DoubleSide` material alone duplicates texture content.

## 6. Microphone and Voice Interaction

If a microphone control is present:

- Preserve its position beside the TURBO AI title.
- Match the dashboard's neon visual style.
- Show distinct active, inactive, and listening states.
- Connect it to the actual voice-input functionality where available.
- Request microphone permission only when the user activates voice input.
- Handle denied permissions and unsupported browsers gracefully.
- Avoid indicating that the microphone is listening when it is not.

Do not introduce automatic microphone activation on page load.

## 7. Lighting and Visual Effects

Maintain the dark, futuristic mechanical presentation.

Use lighting and materials intentionally:
- Neon cyan and turquoise highlights.
- Electric-blue accents.
- Metallic surfaces.
- Controlled emissive materials.
- Soft bloom where supported.
- Subtle reflections and localized illumination.

### Interactive lighting

When the dashboard is moved or rotated:
- Synchronize the intended optical glow with the actual adjustment state.
- Increase the relevant light or emissive intensity smoothly.
- Fade the effect back when adjustment ends.
- Avoid flickering, excessive bloom, and overexposed text.
- Do not brighten the entire scene when localized illumination is sufficient.

Reuse existing lights and post-processing effects where practical.

## 8. Interactive Modes

Preserve existing controls and implement their behavior consistently:

- Simulate Process
- Technical Mode
- Vehicle View
- Edit Mode
- Component Inspection
- Cutaway Mode, if implemented
- Exploded View, if implemented
- Zoom
- Reset View

Do not remove, rename, or silently disable existing controls during unrelated changes.

If a mode is not implemented in the repository, inspect the current code before adding it.

## 9. Simulation and Engineering Data

Keep simulation logic separate from presentation components where practical.

Requirements:
- Maintain consistent parameter units.
- Avoid generating conflicting values in different dashboard components.
- Use shared state for values that must stay synchronized.
- Clean up animation frames, timers, and event listeners appropriately.
- Keep simulation transitions smooth.
- Avoid unnecessary React re-renders of complex 3D objects.

Clearly distinguish illustrative demo values from values derived from real measurements or validated physical calculations.

Do not present simulated output as real sensor data unless actual sensors are connected.

## 10. State Management

Use the existing Zustand stores and state architecture where appropriate.

- Reuse existing state rather than introducing duplicate sources of truth.
- Keep related simulation and interaction state consistent.
- Avoid unnecessary global state.
- Do not mutate shared state in ways that bypass existing update mechanisms.
- Ensure that parameter changes propagate to all dependent visual elements.

## 11. Code Modification Rules

Before editing:
1. Inspect the repository structure.
2. Read the relevant components and hooks.
3. Identify the actual root cause of the issue.
4. Understand how the affected components interact.
5. Make the smallest reliable change that solves the problem.

During implementation:
- Follow the project's existing naming and formatting conventions.
- Prefer reusable components and focused functions.
- Avoid unnecessary rewrites.
- Avoid duplicated components, event handlers, or animation loops.
- Preserve existing functionality outside the requested change.
- Do not overwrite user changes unrelated to the task.
- Never hardcode secrets, API keys, or credentials.
- Do not add dependencies when existing libraries can solve the problem cleanly.

## 12. Performance

The application should remain responsive during camera movement, animations, and simulation.

- Reuse geometries and materials when appropriate.
- Dispose of resources created dynamically when they are no longer needed.
- Clean up event listeners and animation resources.
- Avoid expensive per-frame React state updates.
- Use frame-loop updates for appropriate 3D animations.
- Keep post-processing effects controlled.
- Avoid unnecessary rendering or duplicate lights.
- Test complex changes for rendering artifacts and performance regressions.

## 13. Responsive UI

Ensure the interface remains usable on desktop, tablet, and mobile screens.

- Keep dashboard text legible at different viewport sizes.
- Prevent controls from overlapping.
- Keep camera controls accessible.
- Preserve the 3D model's usable viewing area.
- Adapt layout and sizing without unnecessarily changing the model's geometry.

## 14. Validation and Testing

After changes:
1. Run `npm run build` if a build script is available.
2. Run relevant lint or test commands if configured.
3. Check the browser console for errors.
4. Verify that the application starts successfully.
5. Test the affected interaction manually.
6. Confirm that unrelated controls still work.

For dashboard or scene-transform changes, test:
- Front and rear views.
- Full camera rotation.
- Zoom and pan.
- Dashboard movement and rotation.
- Wire alignment.
- Parameter synchronization.
- Simulation start and stop.
- Reset View.

For turbine changes, verify that exactly 12 blades remain.

Do not claim that tests passed unless they were actually executed.

## 15. Git and Repository Safety

- Do not commit changes automatically unless explicitly requested.
- Do not force-push.
- Do not overwrite unrelated user changes.
- Never commit `.env` files, API keys, credentials, or private tokens.
- Review `git status` before staging changes.
- Keep commits focused on the intended feature or fix.

## 16. Definition of Done

A change is complete when:
- The requested functionality is implemented in the actual source code.
- Existing behavior is preserved unless explicitly changed.
- Related components remain visually and functionally synchronized.
- The application builds successfully where build tooling is available.
- Relevant interactions have been tested.
- No known regression introduced by the change remains unresolved.
- The final response summarizes the implementation, modified files, and any outstanding limitations.

**Primary rule:** Understand the existing project before modifying it. Preserve the mechanical assembly, maintain the 3D scene hierarchy, and prioritize correct behavior over superficial visual work.
