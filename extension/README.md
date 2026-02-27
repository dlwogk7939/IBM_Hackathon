# MaintAIn (Manifest V3)

## Popup layout
1. Main timer (`Studying timer`)
2. `Top 5 websites` list (domain + time)
3. Control buttons (`Start`, `Stop`, `Pause`, `Resume`)
4. `Open Dashboard` button

## Website color rules
- Study websites: blue
- Distracting websites: red
- Others: neutral dark gray

## Timer behavior
- `Start` / `Resume`: timer becomes `RUNNING`
- `Pause`: timer becomes `PAUSED` with manual reason
- `Stop`: timer becomes `STOPPED` with manual reason
- Distracting site while running: auto pause + toast
- Initial start on study site: `Start studying?` modal with `Start`
- Return to study site from auto distraction pause: auto resume + toast

## Privacy
- Never stores/transmits full URLs.
- Reads active tab URL only to extract hostname at runtime.
- Stores only:
  - `totalStudySeconds`
  - `websiteTotals` (hostname -> seconds)
  - timer state metadata

## Stored keys (chrome.storage.local)
- `timerState`: `RUNNING` | `PAUSED` | `STOPPED`
- `pauseReason`: `AUTO_DISTRACTION` | `MANUAL` | `null`
- `lastStartMs`: number | null
- `isStudyContext`: boolean
- `totalStudySeconds`: number
- `activeDomain`: hostname | null
- `lastContextMs`: number | null
- `websiteTotals`: `{ [hostname]: seconds }`

## Domain classification lists
Study:
- `carmen.osu.edu`
- `canvas.osu.edu`
- `docs.google.com`
- `drive.google.com`
- `www.overleaf.com`

Distracting:
- `instagram.com`
- `www.instagram.com`
- `tiktok.com`
- `www.tiktok.com`
- `youtube.com`
- `www.youtube.com`

## Dashboard
- `Open Dashboard` opens `https://naver.com`.

## Install
1. Open `chrome://extensions`
2. Enable Developer mode
3. Click Load unpacked
4. Select the `extension/` folder

## icon.png
- `manifest.json` references `icon.png`.
- Replace `extension/icon.png` with your own icon if needed.
