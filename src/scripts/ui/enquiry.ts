/**
 * Enquiry: what happens when a booking form is sent. There are two of them,
 * one in the booking section and one in the booking window.
 *
 * There is no booking engine behind them yet. So that the form still does
 * something real and honest, it opens an email to the hotel with the details
 * filled in. When a booking engine is connected (`site.booking.engineUrl`),
 * the form sends the visitor there instead.
 */
import { toReadable } from '../lib/dates';
import { find, findAll } from '../lib/dom';

function openEmail(to: string, subject: string, body: string) {
  const query = new URLSearchParams({ subject, body }).toString().replace(/\+/g, '%20');
  window.location.href = `mailto:${to}?${query}`;
}

export function initBookingForms(): void {
  findAll<HTMLFormElement>('[data-booking-form]').forEach(setUpForm);
}

function setUpForm(form: HTMLFormElement): void {
  const arrive = find<HTMLInputElement>('[data-date-input="arrive"]', form);
  const leave = find<HTMLInputElement>('[data-date-input="leave"]', form);
  const status = find('[data-booking-status]', form);
  if (!arrive || !leave) return;

  // The form says what is missing in its own words, beside the fields.
  form.noValidate = true;
  form.addEventListener('change', () => {
    if (status && arrive.value && leave.value) status.textContent = '';
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!arrive.value || !leave.value) {
      if (status) {
        status.textContent = arrive.value
          ? 'Please choose the day you leave.'
          : 'Please choose the day you arrive, and the day you leave.';
      }
      // Open the calendar on the date that is missing.
      const missing = arrive.value ? 'leave' : 'arrive';
      const trigger = find<HTMLButtonElement>(`[data-date-trigger="${missing}"]`, form);
      if (trigger?.getAttribute('aria-expanded') !== 'true') trigger?.click();
      return;
    }

    const guests = String(new FormData(form).get('guests') ?? '');
    const engineUrl = form.dataset.engineUrl;
    if (engineUrl) {
      const query = new URLSearchParams({ arrive: arrive.value, leave: leave.value, guests });
      window.location.assign(`${engineUrl}?${query}`);
      return;
    }

    openEmail(
      form.dataset.enquiryEmail ?? '',
      'Availability at Niyara',
      [
        'Hello,',
        '',
        'I would like to know if you have a room for these dates.',
        '',
        `Arriving: ${toReadable(arrive.value)}`,
        `Leaving: ${toReadable(leave.value)}`,
        `Guests: ${guests}`,
        '',
        'Thank you.',
      ].join('\n'),
    );
    if (status) {
      status.textContent =
        'We have opened an email with your dates. Send it, and we will reply within a day.';
    }
  });
}
