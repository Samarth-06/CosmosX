## Mercury Orbit Refinement Tasks

- [x] Analyze the active module task layout, clickability issues, and transform conflicts.
- [x] Plan a nested wrapper architecture to isolate position, wave displacement, and entrance animation.
- [x] Update all 8 modules to use distinct color codes as specified.
- [x] Restructure module text label styles to fit the new colors and look visually distinct.
- [x] Build nested wrapper architecture inside `mercury.tsx` for task buttons.
- [x] Fix locked module appearance to retain their unique colors with lock overlay icon and opacity 0.72.
- [x] Refine Rocket Verification card container:
  - Set background to deep premium black (`#030706`) for clear outer contrast.
  - Make technical blueprint grid cyan/blue and very subtle.
  - Scale up the wireframe V-2 rocket schematic by ~35-50%.
- [x] Redesign bottom checkpoints:
  - Form individual status boxes in a clean 2-column grid.
  - Add fluorescent green left border strips with a slow energy flow pulse animation.
  - Fully differentiate completed/active check boxes from locked standby ones.
- [x] Run npm build and verify zero TypeScript or bundle warnings.
