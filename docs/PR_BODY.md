## Summary
Redesign foundation for ppautohaus.com.au. It's an Astro 5 static site, ready for Cloudflare Pages but not deployed.
- Design system: ivory and off-black with a racing-green accent, Cormorant Garamond headings and Inter body text. The wordmark is text: "Peters Prestige Autohaus".
- Home page sections: hero, Buy / Sell & Consign / Source paths, featured stock, bought & sold track record, services, and a contact CTA.
- Other pages: /stock, /contact (the only page that shows the Darra address) and a 404 page.
- Stock data: reads a Google Sheet CSV from `STOCK_CSV_URL`. If that's missing or fails, it falls back to `src/data/stock.sample.json`.
- SEO: AutoDealer schema with the real address, phone and email, and no ratings. Each page has its own title, meta, canonical and Open Graph tags. Includes a sitemap and robots.txt.

## Sample and placeholder content
- All 4 stock cars are SAMPLE: the make is "SAMPLE", each has a red badge, and prices are POA.
- All images are labelled placeholders.
- The bought & sold names are taken from the current site.

## Open items
- Dealer licence number for the footer (needs confirming)
- Real photography, with clear licensing
- Individual vehicle pages, filters and Vehicle schema
- Enquiry, sell and sourcing forms, plus GA4 tracking
- Node 22+, so the site can move to the latest Astro

## Before and after
| | 1280 | 390 |
|---|---|---|
| Before | ![](docs/screenshots/before-home-1280.png) | ![](docs/screenshots/before-home-390.png) |
| After | ![](docs/screenshots/after-home-1280.png) | ![](docs/screenshots/after-home-390.png) |

Do not merge without review.
