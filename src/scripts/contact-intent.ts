// Anonymous intent events for a future analytics integration. No form values or URLs with messages.
type IntentWindow = Window & { dataLayer?: Record<string, unknown>[] };
function recordIntent(channel: 'phone' | 'whatsapp', source: string) {
 const event = { event: 'contact_intent', contact_channel: channel, contact_source: source, page_path: window.location.pathname, governorate: document.querySelector<HTMLElement>('[data-governorate]')?.dataset.governorate || undefined };
 const target = window as IntentWindow;
 (target.dataLayer ??= []).push(event);
 window.dispatchEvent(new CustomEvent('enjaz:contact-intent', { detail: event }));
}
document.addEventListener('click', (event) => {
 const link = event.target instanceof Element ? event.target.closest('a') : null;
 if (!link) return;
 const url = new URL(link.href, window.location.origin);
 if (url.protocol === 'tel:') recordIntent('phone', 'link');
 else if (url.hostname === 'wa.me' || url.hostname === 'api.whatsapp.com') recordIntent('whatsapp', 'link');
});
document.addEventListener('submit', (event) => {
 const form = event.target;
 if (form instanceof HTMLFormElement && ['quote-form', 'contact-form'].includes(form.id)) {
  recordIntent('whatsapp', form.id);
 }
});
