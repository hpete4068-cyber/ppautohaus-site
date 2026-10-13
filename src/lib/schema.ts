import { SITE } from './site';
// AutoDealer schema using only verified details. No ratings, hours or geo until confirmed.
export const dealerSchema = {
  '@context': 'https://schema.org', '@type': 'AutoDealer', '@id': `${SITE.url}/#dealer`,
  name: SITE.name, legalName: SITE.legalName, url: SITE.url, telephone: SITE.phone, email: SITE.email,
  identifier: { '@type': 'PropertyValue', propertyID: 'motorDealerLicence', value: SITE.licenceNumber },
  description: 'Brisbane-based prestige, classic and supercar specialist buying and selling Australia-wide.',
  address: { '@type': 'PostalAddress', streetAddress: SITE.address.street, addressLocality: SITE.address.locality,
    addressRegion: SITE.address.region, postalCode: SITE.address.postcode, addressCountry: SITE.address.country },
  areaServed: { '@type': 'Country', name: 'Australia' },
};
