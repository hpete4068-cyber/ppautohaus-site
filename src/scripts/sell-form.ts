/**
 * Photos are not uploaded.
 * FormSubmit's AJAX endpoint (SELL_FORM_ENDPOINT) accepts a JSON POST and
 * returns a result we can show inline. File attachments are only documented
 * for a multipart POST to https://formsubmit.co/<email>, which navigates away
 * from the page (and can stop on reCAPTCHA), so success and error states
 * would be lost. Step 3 still accepts up to 5 images: we record the file
 * names in a follow-up enquiry and ask the customer to email the files.
 */

type Step = 1 | 2 | 3 | 'done';

const SUBJECT = 'New sell/consign enquiry';

function track(form: HTMLFormElement, event: 'step1_complete' | 'form_submit') {
  const w = window as Window & { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event });
  form.dataset.lastEvent = event;
}

function val(form: HTMLFormElement, name: string) {
  const el = form.elements.namedItem(name);
  if (el instanceof RadioNodeList) return el.value.trim();
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    return el.value.trim();
  }
  return '';
}

function checked(form: HTMLFormElement, name: string) {
  const el = form.elements.namedItem(name);
  return el instanceof HTMLInputElement ? el.checked : false;
}

function fieldBox(input: Element) {
  return input.closest('.field, fieldset');
}

function clearErrors(form: HTMLFormElement) {
  form.querySelectorAll<HTMLElement>('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
  form.querySelectorAll<HTMLElement>('.field-error').forEach(el => {
    el.hidden = true;
    el.textContent = '';
  });
  const live = form.querySelector<HTMLElement>('#sell-errors');
  if (live) live.textContent = '';
}

function setFieldError(input: HTMLElement, message: string) {
  input.setAttribute('aria-invalid', 'true');
  const box = fieldBox(input);
  const error = box?.querySelector<HTMLElement>('.field-error');
  if (error) {
    error.hidden = false;
    error.textContent = message;
    if (error.id) input.setAttribute('aria-describedby', error.id);
  }
}

function showLive(form: HTMLFormElement, message: string) {
  const live = form.querySelector<HTMLElement>('#sell-errors');
  if (live) live.textContent = message;
}

function showSendFailure(form: HTMLFormElement, leadIn?: string) {
  const live = form.querySelector<HTMLElement>('#sell-errors');
  if (!live) return;
  const phone = form.dataset.phone || '';
  const email = form.dataset.email || '';
  const phoneLink = document.createElement('a');
  phoneLink.href = form.dataset.phoneHref || '#';
  phoneLink.textContent = phone;
  const emailLink = document.createElement('a');
  emailLink.href = `mailto:${email}`;
  emailLink.textContent = email;
  live.replaceChildren();
  if (leadIn) live.append(leadIn);
  live.append(
    document.createTextNode(leadIn ? ' Call ' : "We couldn't send that just now. Call "),
    phoneLink,
    document.createTextNode(' or email '),
    emailLink,
    document.createTextNode(" and we'll take it from here."),
  );
  live.focus();
}

function mobileOk(raw: string) {
  const d = raw.replace(/[\s()-]/g, '');
  return /^(?:\+?61|0)4\d{8}$/.test(d);
}

function yearOk(raw: string) {
  if (!/^\d{4}$/.test(raw)) return false;
  const y = Number(raw);
  return y >= 1950 && y <= new Date().getFullYear() + 1;
}

interface Lead {
  lookup: 'rego' | 'make';
  rego: string;
  state: string;
  make: string;
  model: string;
  year: string;
  km: string;
  intent: string;
  name: string;
  mobile: string;
  email: string;
  postcode: string;
  contact: string;
}

function readLead(form: HTMLFormElement): Lead {
  return {
    lookup: val(form, 'lookup') === 'make' ? 'make' : 'rego',
    rego: val(form, 'rego'),
    state: val(form, 'state') || 'QLD',
    make: val(form, 'make'),
    model: val(form, 'model'),
    year: val(form, 'year'),
    km: val(form, 'odometer').replace(/[, ]/g, ''),
    intent: val(form, 'intent'),
    name: val(form, 'name'),
    mobile: val(form, 'mobile'),
    email: val(form, 'email'),
    postcode: val(form, 'postcode'),
    contact: val(form, 'contact'),
  };
}

function validateStep1(form: HTMLFormElement) {
  const lead = readLead(form);
  const errors: { el: HTMLElement; message: string }[] = [];
  if (lead.lookup === 'rego') {
    const rego = form.elements.namedItem('rego');
    const state = form.elements.namedItem('state');
    if (!lead.rego && rego instanceof HTMLElement) errors.push({ el: rego, message: 'Enter the registration.' });
    if (!lead.state && state instanceof HTMLElement) errors.push({ el: state, message: 'Choose a state.' });
  } else {
    const make = form.elements.namedItem('make');
    const model = form.elements.namedItem('model');
    const year = form.elements.namedItem('year');
    if (lead.make.length < 2 && make instanceof HTMLElement) errors.push({ el: make, message: 'Enter the make.' });
    if (lead.model.length < 1 && model instanceof HTMLElement) errors.push({ el: model, message: 'Enter the model.' });
    if (!yearOk(lead.year) && year instanceof HTMLElement) errors.push({ el: year, message: 'Enter a four-digit year.' });
  }
  const kmEl = form.elements.namedItem('odometer');
  if (!/^\d+$/.test(lead.km) || Number(lead.km) > 2000000) {
    if (kmEl instanceof HTMLElement) errors.push({ el: kmEl, message: 'Enter the odometer in kilometres.' });
  }
  const intent = form.querySelector<HTMLInputElement>('input[name="intent"]');
  if (!lead.intent && intent) errors.push({ el: intent, message: 'Choose sell, consign, or not sure.' });
  return errors;
}

function validateStep2(form: HTMLFormElement) {
  const lead = readLead(form);
  const errors: { el: HTMLElement; message: string }[] = [];
  const name = form.elements.namedItem('name');
  const mobile = form.elements.namedItem('mobile');
  const email = form.elements.namedItem('email');
  const postcode = form.elements.namedItem('postcode');
  const contact = form.querySelector<HTMLInputElement>('input[name="contact"]');
  const consent = form.elements.namedItem('consent');
  if (lead.name.length < 2 && name instanceof HTMLElement) errors.push({ el: name, message: 'Enter your full name.' });
  if (!mobileOk(lead.mobile) && mobile instanceof HTMLElement) errors.push({ el: mobile, message: 'Enter an Australian mobile number.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) && email instanceof HTMLElement) errors.push({ el: email, message: 'Enter a valid email address.' });
  if (!/^\d{4}$/.test(lead.postcode) && postcode instanceof HTMLElement) errors.push({ el: postcode, message: 'Enter a four-digit postcode.' });
  if (!lead.contact && contact) errors.push({ el: contact, message: 'Choose how you would like to be contacted.' });
  if (!checked(form, 'consent') && consent instanceof HTMLElement) errors.push({ el: consent, message: 'Please confirm we can contact you about this appraisal.' });
  return errors;
}

function applyErrors(form: HTMLFormElement, errors: { el: HTMLElement; message: string }[]) {
  clearErrors(form);
  if (!errors.length) return true;
  errors.forEach(({ el, message }) => setFieldError(el, message));
  const summary = errors.map(e => e.message).join(' ');
  showLive(form, summary);
  errors[0].el.focus();
  return false;
}

function leadPayload(form: HTMLFormElement, lead: Lead, extra: Record<string, string> = {}) {
  const body: Record<string, string> = {
    _subject: SUBJECT,
    _template: 'table',
    _honey: val(form, '_honey'),
    _replyto: lead.email,
    _captcha: 'false',
    Intent: lead.intent,
    'Odometer (km)': lead.km,
    'Full name': lead.name,
    Mobile: lead.mobile,
    Email: lead.email,
    Postcode: lead.postcode,
    'Preferred contact': lead.contact,
    Consent: 'Yes',
    ...extra,
  };
  if (lead.lookup === 'rego') {
    body.Registration = lead.rego.toUpperCase();
    body.State = lead.state;
    body['Identified by'] = 'Registration';
  } else {
    body.Make = lead.make;
    body.Model = lead.model;
    body.Year = lead.year;
    body['Identified by'] = 'Make and model';
  }
  return body;
}

async function postEnquiry(endpoint: string, body: Record<string, string>) {
  // URL-encoded, not JSON: a JSON content type triggers a CORS preflight that
  // FormSubmit's AJAX endpoint does not approve. This is the same body their
  // own AJAX example sends.
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: new URLSearchParams(body),
  });
  let data: { success?: string | boolean; message?: string } | null = null;
  try { data = await res.json(); } catch { data = null; }
  const ok = res.ok && data?.success !== false && data?.success !== 'false';
  if (!ok) throw new Error(data?.message || `HTTP ${res.status}`);
}

function photoFiles(form: HTMLFormElement) {
  const input = form.elements.namedItem('photos');
  if (!(input instanceof HTMLInputElement) || !input.files) return [];
  return [...input.files];
}

function syncLookup(form: HTMLFormElement) {
  const lookup = val(form, 'lookup') === 'make' ? 'make' : 'rego';
  form.querySelectorAll<HTMLElement>('[data-lookup]').forEach(el => {
    el.hidden = el.dataset.lookup !== lookup;
  });
}

function showStep(form: HTMLFormElement, step: Step) {
  form.dataset.step = String(step);
  form.querySelectorAll<HTMLElement>('[data-panel]').forEach(panel => {
    panel.hidden = panel.dataset.panel !== String(step);
  });
  form.querySelectorAll<HTMLElement>('.progress li').forEach(li => {
    const n = Number(li.dataset.step);
    li.classList.toggle('is-done', step === 'done' || (typeof step === 'number' && n < step));
    if (step !== 'done' && n === step) li.setAttribute('aria-current', 'step');
    else li.removeAttribute('aria-current');
  });
  const panel = form.querySelector<HTMLElement>(`[data-panel="${step}"]`);
  const heading = panel?.querySelector<HTMLElement>('h2');
  if (heading) {
    heading.tabIndex = -1;
    heading.focus();
  }
}

function setBusy(form: HTMLFormElement, busy: boolean) {
  form.setAttribute('aria-busy', busy ? 'true' : 'false');
  form.querySelectorAll<HTMLButtonElement>('button').forEach(btn => {
    btn.disabled = busy;
  });
}

export function mountSellForm(form: HTMLFormElement) {
  const endpoint = form.dataset.endpoint || '';
  let step: Step = 1;
  let sent = false;

  form.querySelectorAll<HTMLInputElement>('input[name="lookup"]').forEach(input => {
    input.addEventListener('change', () => {
      syncLookup(form);
      clearErrors(form);
    });
  });
  syncLookup(form);

  const photos = form.elements.namedItem('photos');
  photos?.addEventListener('change', () => {
    if (!(photos instanceof HTMLInputElement)) return;
    const files = photoFiles(form);
    const note = form.querySelector<HTMLElement>('[data-photo-count]');
    if (files.length > 5) {
      photos.value = '';
      if (note) note.textContent = '';
      clearErrors(form);
      setFieldError(photos, 'Choose up to 5 photos.');
      showLive(form, 'Choose up to 5 photos.');
      photos.focus();
      return;
    }
    const notImage = files.find(file => file.type && !file.type.startsWith('image/'));
    if (notImage) {
      photos.value = '';
      if (note) note.textContent = '';
      clearErrors(form);
      setFieldError(photos, 'Photos need to be image files.');
      showLive(form, 'Photos need to be image files.');
      photos.focus();
      return;
    }
    clearErrors(form);
    if (note) note.textContent = files.length ? `${files.length} of 5 selected. They stay on this device.` : '';
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (step === 1) {
      if (!applyErrors(form, validateStep1(form))) return;
      clearErrors(form);
      track(form, 'step1_complete');
      step = 2;
      showStep(form, step);
      return;
    }
    if (step === 2) {
      if (!applyErrors(form, validateStep2(form))) return;
      clearErrors(form);
      void sendLead();
      return;
    }
    if (step === 3) void sendNotes();
  });

  form.querySelector('[data-back]')?.addEventListener('click', () => {
    if (step !== 2) return;
    clearErrors(form);
    step = 1;
    showStep(form, step);
  });

  form.querySelector('[data-skip]')?.addEventListener('click', () => {
    if (step !== 3 || !sent) return;
    finish(false);
  });

  async function sendLead() {
    if (val(form, '_honey')) {
      sent = true;
      step = 'done';
      showStep(form, step);
      return;
    }
    const lead = readLead(form);
    setBusy(form, true);
    try {
      await postEnquiry(endpoint, leadPayload(form, lead, {
        Notes: 'None yet. The customer may still add notes.',
        Photos: 'None attached. File upload is not supported on this form.',
      }));
      sent = true;
      track(form, 'form_submit');
      step = 3;
      clearErrors(form);
      showStep(form, step);
    } catch {
      showSendFailure(form);
    } finally {
      setBusy(form, false);
    }
  }

  async function sendNotes() {
    const notes = val(form, 'notes');
    const files = photoFiles(form);
    if (!notes && !files.length) {
      finish(false);
      return;
    }
    if (files.length > 5) {
      const input = form.elements.namedItem('photos');
      if (input instanceof HTMLElement) {
        clearErrors(form);
        setFieldError(input, 'Choose up to 5 photos.');
        showLive(form, 'Choose up to 5 photos.');
        input.focus();
      }
      return;
    }
    if (val(form, '_honey')) {
      finish(files.length > 0);
      return;
    }
    const lead = readLead(form);
    const photoNote = files.length
      ? `${files.length} selected, not attached (FormSubmit AJAX cannot accept file uploads). Filenames: ${files.map(file => file.name).join(', ')}. Please ask the customer to email the photos.`
      : 'None selected.';
    setBusy(form, true);
    try {
      await postEnquiry(endpoint, leadPayload(form, lead, {
        _subject: 'New sell/consign enquiry — notes',
        Notes: notes || 'No written notes.',
        Photos: photoNote,
      }));
      finish(files.length > 0);
    } catch {
      showSendFailure(form, 'Your appraisal request was already sent, but the notes did not go through.');
    } finally {
      setBusy(form, false);
    }
  }

  function finish(hadPhotos: boolean) {
    step = 'done';
    const photoLine = form.querySelector<HTMLElement>('[data-photo-followup]');
    if (photoLine) photoLine.hidden = !hadPhotos;
    showStep(form, step);
  }
}
