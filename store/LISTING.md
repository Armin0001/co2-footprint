# Chrome Web Store listing: copy and paste

Everything the developer dashboard asks for, in the order it asks.

## Package

Upload `dist/co2-footprint-1.0.0.zip`. The name, summary and icon are read from it.

## Store listing tab

**Description**

```
Ever wondered what visiting a web page costs the planet? Click the CO2 Footprint leaf on any website to see an estimate of the greenhouse gases emitted by one visit, in grams of CO2 equivalent.

WHAT YOU GET
• CO2 per visit for the page you're on
• An A+ to F rating showing how the page compares with the rest of the web
• Page size, number of files, and the footprint of 1,000 visits

HOW IT WORKS
CO2 Footprint adds up the data the page downloaded, using Chrome's built-in performance information. It converts that into energy and emissions with the Sustainable Web Design Model v4 (the method behind CO2.js and many website carbon calculators), assuming the global average electricity mix. When a server keeps the exact size of a file private, a typical size for that kind of file is used (HTTP Archive Web Almanac 2024).

It's an estimate: real emissions also depend on how the site is hosted, your network and your device.

PRIVACY
CO2 Footprint only runs when you click it, and only on the tab you're looking at. It collects nothing, stores nothing and sends nothing anywhere. No account, no analytics, no ads.
```

**Category:** Tools (alternative: Developer Tools)

**Language:** English

**Graphic assets** (all in this folder)

| Field | File |
| --- | --- |
| Store icon | `icon-128x128.png` |
| Screenshot | `screenshot-1280x800.png` |
| Small promo tile | `promo-440x280.png` |
| Marquee promo tile | leave empty (optional) |

**Official URL / Homepage URL / Support URL:** leave empty (all optional).

## Privacy tab

**Single purpose description**

```
Shows an estimate of the CO2 emitted by one visit to the web page in the current tab.
```

**Permission justification: activeTab**

```
Gives the extension access to the current tab only after the user clicks the toolbar button, so it can read that page's load statistics. No other tabs or sites are accessed.
```

**Permission justification: scripting**

```
After the user clicks, runs one small read-only function in the current tab that adds up the bytes the page downloaded, using the browser's Performance API. It does not change the page.
```

**Are you using remote code?** No, I am not using remote code.

**Data usage:** tick none of the data types. Tick all three certifications:
- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:** see step 5 of the guide in `README.md`.

## Distribution tab

- **Payments:** Free
- **Visibility:** Public
- **Distribution:** All regions
