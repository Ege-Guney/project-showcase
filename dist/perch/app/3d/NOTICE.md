# Third-party material in `app/pet/3d/`

## `fly.glb`: her body, derived from flybody

- **Source:** flybody, by Google DeepMind and HHMI Janelia Research Campus: the 85 OBJ mesh parts and `fruitfly.xml` in `flybody/fruitfly/assets/` of https://github.com/TuragaLab/flybody, at commit `d015e9bfe441bd90ae431bac24c55cb74bdbce26`.
- **Licence:** Apache License, Version 2.0 (https://www.apache.org/licenses/LICENSE-2.0). Upstream ships no NOTICE file.
- **Paper:** Vaxenburg R et al. 2025. Whole-body physics simulation of fruit fly locomotion. *Nature* 643:1312-1320. doi:10.1038/s41586-025-09029-4.
- **Our changes** (Apache-2.0 §4(b)), made by `FLY Social/lab/realism/build_fly3d.py` (FLY Social, 2026):
  - the parts are merged into one skinned glTF mesh with flybody's 67 parts as nodes;
  - the parts are simplified from 272,550 to 125,380 triangles;
  - positions are converted to millimetres and quantized;
  - smooth normals are recomputed;
  - vertex colours (after the 2D fly's palette) and a baked contact occlusion are added, which are DESIGN;
  - UVs and a texture for the female's abdominal bands are added (DESIGN after the real pattern);
  - the leg parts (coxa to tarsus) are their own material group, with a per-vertex thickness (`_THICK`, the segment's diameter) that drives a cheap translucency (DESIGN);
  - the wing membranes get UVs and a baked thin-film interference texture: the thickness layout follows the wing cells that flybody's veins enclose (`lab/realism/wingcells.py`, DESIGN), and the colour of each thickness is physics (chitin n = 1.57; Shevtsova et al. 2011, *PNAS* 108:668);
  - her body extent (head front and abdomen tip) is recorded in the GLB's extras, to line her up with the 2D fly.
- **Not used:** the Janelia figshare data behind flybody (GPL-3.0+) and flybody's Blender file.

## `poses-keyframes.json`: her poses on flybody's rig

- **What it is:** joint angles for flybody's articulated body (above) in a few poses: proboscis out, the face-wash, a kick, sleep, raised wings, a wingbeat, legs in flight, antennae up and down. They were found by forward kinematics and least-squares inverse kinematics on flybody's rig, checked for floor and eye contact; no physics and no recorded behaviour (ANIMATION; DESIGN keyframes after published descriptions; its receipt says which joints go past flybody's ranges).
- **Licence:** the angles are FLY Social's work; they only make sense with flybody's rig (Apache-2.0), so treat them as part of the derived body.
- **The base pose** comes from the walk clip below (its idle footprint and folded wings).
- **How to regenerate:** from `FLY Social/lab`, run `.venv/bin/python -I realism/solve_poses.py`; it needs flybody's parts in the git-ignored `lab/data/flybody/raw` (`realism/fetch_assets.sh`). `--check` compares the result with this file, and `realism/test_realism.py` checks that it comes back byte for byte (or within one rounding step on another machine).

## `walk-spotlight.json`: her walk, from FlyGym's Spotlight clip

- **Source:** `spotlight_behavior_clip.npz` in `src/flygym_demo/spotlight_data/assets/` of https://github.com/NeLy-EPFL/flygym (NeuroMechFly / FlyGym, EPFL Neuroengineering Laboratory), at commit `a63dc91a7ce432452e6521c2f3dcc1a7c2c7c6bc`.
- **Licence:** Apache License, Version 2.0. Upstream ships no NOTICE file.
- **Papers:**
  - Wang-Chen S, Stimpfling VA, Azcorra M, Ramdya P. 2026. Precise kinematic and muscle recording in freely behaving flies (Spotlight, PoseForge). *bioRxiv* doi:10.64898/2026.03.11.711180.
  - Wang-Chen S et al. 2024. NeuroMechFly v2. *Nat Methods* 21:2353-2362. doi:10.1038/s41592-024-02497-y.
- **Our changes**, made by `FLY Social/lab/realism/bake_walk.py`: the clip's 3D leg keypoints are retargeted onto flybody's legs by inverse kinematics (the recorded segment directions, flybody's segment lengths). Stance claws are planted, and her travel is derived from the stance feet. Angles are stored in milliradians. The receipt inside the JSON gives the method and labels.

## Before anything ships

- The single-file game (`app/pet/dist/pet.html`, built by `build_pet_app.py`) carries `fly.glb`, the walk clip and the poses inside it, so publishing it redistributes flybody- and FlyGym-derived files. Its demo sheet and its "What is real here" sheet credit both teams and name our changes. "What is real here" also carries the full Apache-2.0 text (`LICENSE-Apache-2.0.txt` here, inlined by the build), since 2026-11-02.
- Still open: the dataset licence check (deferred on 2 October), before anything public.
