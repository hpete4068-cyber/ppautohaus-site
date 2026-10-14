// Real business details taken from the current ppautohaus.com.au (audit 2026-10-13).
export const SITE = {
  name: 'Peters Prestige Autohaus',
  legalName: 'Winning Group Pty Ltd',
  licenceNumber: '4696898',
  url: 'https://ppautohaus.com.au',
  phone: '+61 467 067 535',
  phoneHref: 'tel:+61467067535',
  email: 'admin@ppautohaus.com.au',
  // Visible only on /contact.
  address: { street: '6/38 Limestone St', locality: 'Darra', region: 'QLD', postcode: '4076', country: 'AU' },
  storageUrl: 'https://ppaautostorage.com.au/',
};

/**
 * Sell/consign enquiries. FormSubmit AJAX keeps the visitor on the page and
 * returns JSON. Swap this string for a Cloudflare Pages Function later.
 * File uploads are not sent here: FormSubmit only documents them on a
 * multipart POST to the non-AJAX URL, which leaves the page.
 */
export const SELL_FORM_ENDPOINT = 'https://formsubmit.co/ajax/harry@ppautohaus.com.au';
