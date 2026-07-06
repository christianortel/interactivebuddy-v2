# reference/screens/

Normalized reference images of the original game. Requirements:

- Native stage resolution, no browser zoom, no smoothing/rescaling. If a capture is not
  native, record the scale factor in `reference/evidence-index.json` and prefer replacing it.
- PNG, full stage in frame, no cropped edges.
- File name = evidence ID, e.g. `EV-0007-shop-page2.png`.
- Every file gets a record in `reference/evidence-index.json` before it is used to
  justify a value.

Wanted set (one file each, minimum): default boot; idle Buddy close state; every top-level
menu open; every submenu open; every shop/store page and scroll position; every skin
equipped; every dialog (reset/options/help/about); money display close-up; each reaction
face state.

Do not commit captures containing anything you do not have the right to store in this
private repository lane. This directory may be gitignored if desired; evidence records
must still describe each file.
