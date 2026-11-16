import { collection, getSettings } from '../db/jsonStore.js';
import { HttpError } from './http.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DAYS_AHEAD = 60;
const SUNDAY_LAST_SLOT_MINS = 13 * 60; // Sunday: half day, last slot 1 PM

const toMins = (slot) => {
  const [, h, m, ap] = slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
  return ((Number(h) % 12) + (ap.toUpperCase() === 'PM' ? 12 : 0)) * 60 + Number(m);
};

// Shop's local date/time (IST), independent of the server's timezone.
const nowIST = () => {
  const d = new Date(Date.now() + 5.5 * 3600 * 1000);
  return { date: d.toISOString().slice(0, 10), mins: d.getUTCHours() * 60 + d.getUTCMinutes() };
};

export async function slotsFor(date) {
  if (!DATE_RE.test(String(date))) throw new HttpError(400, 'Pick a valid date', { field: 'date' });
  const { date: today, mins: nowMins } = nowIST();
  if (date < today) throw new HttpError(400, 'That date is in the past', { field: 'date' });
  const days = (Date.parse(date) - Date.parse(today)) / 864e5;
  if (days > MAX_DAYS_AHEAD) throw new HttpError(400, `Bookings open up to ${MAX_DAYS_AHEAD} days ahead`, { field: 'date' });

  const settings = await getSettings();
  const isSunday = new Date(`${date}T00:00:00Z`).getUTCDay() === 0;
  const taken = {};
  const count = (slot) => (taken[slot] = (taken[slot] || 0) + 1);
  (await collection('bookings').find((b) => b.date === date && b.status !== 'cancelled')).forEach((b) => count(b.slot));
  (await collection('orders').find((o) => o.installation?.date === date && o.status !== 'cancelled')).forEach((o) =>
    count(o.installation.slot),
  );

  return settings.installationSlots.map((slot) => {
    const mins = toMins(slot);
    let reason = null;
    if (isSunday && mins > SUNDAY_LAST_SLOT_MINS) reason = 'closed';
    else if (date === today && mins <= nowMins + 60) reason = 'past';
    else if ((taken[slot] || 0) >= settings.bookingsPerSlot) reason = 'full';
    return { slot, available: !reason, reason };
  });
}

export async function assertSlotFree(date, slot) {
  const slots = await slotsFor(date);
  const match = slots.find((s) => s.slot === slot);
  if (!match) throw new HttpError(400, 'Pick a valid time slot', { field: 'slot' });
  if (!match.available) throw new HttpError(409, 'Sorry, that slot was just taken. Please choose another.', { field: 'slot' });
}
