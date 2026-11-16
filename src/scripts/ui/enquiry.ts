/**
 * Enquiry forms: the booking form and the newsletter form.
 *
 * Neither has a service behind it yet. So that the forms still do something
 * real and honest, they open an email to the hotel with the details filled in.
 * When a booking engine is connected (`site.booking.engineUrl`), the booking
 * form sends the visitor there instead.
 */
import { dayAfter, toInputValue, toReadable } from '../lib/dates';
import { find } from '../lib/dom';

function openEmail(to: string, subject: string, body: string) {
  const query = new URLSearchParams({ subject, body }).toString().replace(/\+/g, '%20');
  window.location.href = `mailto:${to}?${query}`;
}

export function initBookingForm(): void {
  const form = find<HTMLFormElement>('[data-booking-form]');
  const arrive = form && find<HTMLInputElement>('[data-booking-arrive]', form);
  const leave = form && find<HTMLInputElement>('[data-booking-leave]', form);
  const status = form && find('[data-booking-status]', form);
  if (!form || !arrive || !leave) return;

  // Guests cannot arrive in the past, or leave before they arrive.
  arrive.min = toInputValue(new Date());
  leave.min = dayAfter(arrive.min);
  arrive.addEventListener('change', () => {
    if (!arrive.value) return;
    leave.min = dayAfter(arrive.value);
    if (leave.value && leave.value < leave.min) leave.value = leave.min;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const details = new FormData(form);
    const guests = String(details.get('guests') ?? '');

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

export function initNewsletterForm(): void {
  const form = find<HTMLFormElement>('[data-newsletter]');
  const status = form && find('[data-newsletter-status]', form);
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const address = String(new FormData(form).get('email') ?? '');
    const hotelEmail = find<HTMLFormElement>('[data-booking-form]')?.dataset.enquiryEmail ?? '';
    openEmail(
      hotelEmail,
      'Please add me to your letters',
      `Hello,\n\nPlease send your letters to ${address}.\n\nThank you.`,
    );
    if (status) status.textContent = 'We have opened an email for you to send. Thank you.';
  });
}
