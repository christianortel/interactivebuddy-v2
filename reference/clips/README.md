# reference/clips/

Reference video clips (or clip metadata) of original behavior. Requirements:

- Constant frame rate capture at or above the original frame rate; record capture fps.
- Native resolution as with screens.
- File name = evidence ID, e.g. `EV-0031-grenade-mid-power.mp4`.
- Each clip gets an evidence record listing the behaviors it evidences and the
  timestamp ranges used for measurements.

Wanted set: hand grab/drag/throw/release; each tool at low/mid/high power from selection
to payout; each Buddy reaction with onset and recovery; a full clean-save purchase
sequence; each reset flow; long idle behavior.

Measurements taken from clips are logged in `docs/MEASUREMENT_LOG.md` as
machine-readable fixtures under `tests/fixtures/` once created.
