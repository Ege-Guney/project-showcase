# Third-party data in `app/pet/brain/`

Every data file here is derived from BANC.

## BANC: her brain and nerve cord

- **Source:** BANC, the brain and nerve cord connectome of one adult female *Drosophila melanogaster*, version 888. Cell metadata and wiring come from the Harvard Dataverse deposit (doi:10.7910/DVN/7WTH1N). Region outlines and neuron skeletons come from the BANC team's public bucket, `lee-lab_brain-and-nerve-cord-fly-connectome` (`region_outlines/`, `neuron_skeletons/swcs-from-pcg-skel/`).
- **Licence:** Creative Commons Attribution 4.0 International (CC BY 4.0), https://creativecommons.org/licenses/by/4.0/.
- **Paper:** Bates, Phelps, Kim, Yang et al. 2026. Distributed control circuits across a brain-and-cord connectome. *Nature*. doi:10.1038/s41586-026-10735-w.
- **The fly:** BANC's fly was a 5-6-day-old female, imaged by electron microscopy. Credit her and the BANC team wherever this data appears.

## What we made from it (CC BY 4.0 asks us to say)

- **`receipts.json`, `fired.bin`, `driven.bin`** (made by `lab/flybrain/export_receipts.py`):
  - Each of these is a run of this project's model on BANC v888 wiring, or on a sister's copy of that wiring with re-rolled synapse counts. The model is a leaky integrate-and-fire network after Shiu et al. 2024.
  - The files hold the spike counts and first-spike times of each recorded trial the pet replays, and the routes the lab's trace rule finds through them.
  - Nothing here is a BANC measurement.
- **`geometry.json`, `cells.bin`, `shells.bin`, `skeletons.bin`** (made by `lab/flybrain/export_brain_geometry.py`):
  - **Positions:** every cell's position, quantised to 16 bits and turned so that her brain is up and her left is on the viewer's left. One far-off position is clamped and hidden.
  - **Region outlines:** a subset (the Ito brain neuropils, the MANC nerve-cord neuropils and nerves, and the whole-CNS outline), decimated by vertex clustering.
  - **Skeletons:** the skeletons of the cells on her paths, quantised. Some are filed under an older proofreading version of the same neuron; `geometry.json` lists which.
- **Downloads:** the raw downloads stay in the git-ignored `lab/data/banc_shapes/`, with SHA-256 sums. They are fetched by `lab/flybrain/fetch_banc_shapes.py`.

## Before anything ships

- **Cell names:**
  - The cell type names and classes come from BANC's annotation columns.
  - BANC was proofread and annotated on the FlyWire platform, whose terms place user annotations under CC BY-NC 4.0.
  - We have not yet asked BANC's authors whether the deposit's CC BY 4.0 covers these columns; the question is drafted, not sent.
  - Until that is settled, the names are not for commercial use.
- **Credit:** the app's about screen must credit BANC (the citation above) and link the licence.
