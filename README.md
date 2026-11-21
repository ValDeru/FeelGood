# FeelGood

A small web app (installable on a phone's home screen) that helps people aged 50+ keep body and mind fit, with a focus on older adults (70+) and dementia prevention. Italian and English.

## What it does

- **Two age groups: 50+ and 70+.** No personal names: you pick your group. 50+ gets the full range (posture, strength, pilates, yoga, Jivamukti). 70+ gets gentle exercises, seated or with support, balance work every day, and no yoga, pilates or floor work (the family area can turn these back on, or set a group to seated only).
- **A different plan every day.** Each day focuses on one body part (rotating), with a warm-up, balance work, focus exercises, strength on 2–3 days a week, a cool-down, a walk goal and a mind game. Exercises done in the last few days are avoided, so the plan doesn't repeat. Any exercise can be swapped.
- **Family area (PIN).** Log the physio's own exercises, mark familiar ones (they appear more often), hide unsuitable ones, adjust each group's settings, and copy all data to another phone with a transfer code.
- **Mind games in Italian.** Memory, anagrams, quick maths, colours (Stroop), number sequence and one-minute words. Difficulty adapts to results.
- **Progress** against WHO targets: 150 active minutes a week, strength on 2+ days, balance on 3+ days (daily for 70+).
- **Safety and accessibility.** Safety notice before starting, "hold a chair" warnings, stop signs, large text with three sizes, 56px+ buttons, read-aloud, light and dark themes.

## Medical basis

- WHO Guidelines on Physical Activity and Sedentary Behaviour (2020), older adults.
- WHO Risk Reduction of Cognitive Decline and Dementia guidelines (2019); Lancet Commission on dementia (2024) for daily tips (hearing, social contact, blood pressure, etc.).
- Balance and strength exercises follow common fall-prevention programmes (Otago-style: heel/toe raises, sit-to-stand, heel-to-toe, side leg raises, all with support).

This app gives general information and does not replace a doctor or physiotherapist.

## Tech

Plain HTML, CSS and JavaScript, no build step. Data stays on the device (localStorage). `sw.js` caches the app for offline use. Hosted with GitHub Pages from the `main` branch root.

Run locally: open `index.html`, or `python3 -m http.server` and visit http://localhost:8000.
