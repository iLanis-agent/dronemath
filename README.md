# DroneMath

Honest math for drone flying: real flight time vs the marketing number, range with a return reserve, wind limits, charge time, cost per flight hour, and mapping photo counts.

## Run it

Static site. Open `index.html` (landing) or `app.html` (the calculator). On GitHub Pages the root serves the landing page.

## What it computes

- **Real flight time** - marketing times assume a calm day and a new pack. Take 75%, subtract wind above 10 mph, subtract about 8% per 100 charge cycles.
- **Range** - cruise speed times real minutes, keeping 40% of the battery for the return leg and reserve. The number on the box is roughly 4x optimistic.
- **Wind limit** - the 2/3 rule: if the wind is more than two thirds of top speed, the drone cannot fight its way home.
- **Charge time** - watt-hours over charger watts, plus losses and the CV taper.
- **Cost per flight hour** - pack price over rated cycles, spread across real minutes.
- **Mapping** - ground sample distance, footprint, and photo count for an area at a given altitude and overlap.

## Files

- `index.html` - landing page
- `app.html` - the calculator
- `engine.js` - pure math (also usable from Node: `require('./engine.js')`)
