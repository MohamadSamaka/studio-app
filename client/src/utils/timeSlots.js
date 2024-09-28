// utils/timeSlots.js
import moment from 'moment';

export const generateTimeSlots = (date, businessHours, reservations, slotDuration, maxUsersPerSlot) => {
  const slots = [];
  const today = moment().startOf('day');
  const selectedDate = moment(date, 'YYYY-MM-DD');
  if (selectedDate.isBefore(today)) {
    return slots; // Don't generate slots for past dates
  }
  
  const existingReservations = reservations[date] || {};
  const dayOfWeek = selectedDate.format('dddd');
  const businessDay = businessHours[dayOfWeek];
  
  if (!businessDay) {
    return slots; // If no business day info, assume closed
  }

  let openTime, closeTime, breaks;
  const exception = businessDay.exceptions?.find(ex => ex.exceptionDate === date);
  
  if (exception) {
    if (exception.fully_closed) {
      return []; // Fully closed due to exception
    }
    openTime = exception.open_time ? moment(exception.open_time, 'HH:mm:ss') : moment(businessDay.openTime, 'HH:mm:ss');
    closeTime = exception.close_time ? moment(exception.close_time, 'HH:mm:ss') : moment(businessDay.closeTime, 'HH:mm:ss');
    breaks = exception.exceptionsBreaks?.length > 0
      ? exception.exceptionsBreaks.map(b => ({
          start: moment(b.start, 'HH:mm:ss'),
          end: moment(b.end, 'HH:mm:ss'),
        }))
      : businessDay.breaks.map(b => ({
          start: moment(b.start, 'HH:mm:ss'),
          end: moment(b.end, 'HH:mm:ss'),
        }));
  } else {
    openTime = moment(businessDay.openTime, 'HH:mm:ss');
    closeTime = moment(businessDay.closeTime, 'HH:mm:ss');
    breaks = businessDay.breaks.map(b => ({
      start: moment(b.start, 'HH:mm:ss'),
      end: moment(b.end, 'HH:mm:ss'),
    }));
  }

  let currentSlot = openTime.clone();
  const currentTime = moment();

  // Convert slotDuration from "HH:mm" to total minutes
  const [hours, minutes] = slotDuration.split(':').map(Number);
  const totalSlotMinutes = hours * 60 + minutes;

  // If the selected date is today, ensure slots start from the next available time
  if (selectedDate.isSame(today, 'day')) {
    const currentMinutes = currentTime.minute();
    const remainder = currentMinutes % totalSlotMinutes;
    console.log("type of slotDuration", typeof slotDuration);
    console.log("slotDuration", slotDuration);
    console.log("currentTime.minute()", currentMinutes);
    console.log("remainder: ", remainder);

    // Round the time up to the nearest slot duration (next valid slot)
    if (remainder > 0) {
      const minutesToNextSlot = totalSlotMinutes - remainder;
      currentSlot = currentTime.clone().add(minutesToNextSlot, 'minutes').startOf('minute');
    } else {
      currentSlot = moment.max(currentTime.startOf('minute'), openTime);
    }

    // Ensure the next slot is a valid time slot
    const nextSlotRemainder = currentSlot.minute() % totalSlotMinutes;
    if (nextSlotRemainder > 0) {
      currentSlot.add(totalSlotMinutes - nextSlotRemainder, 'minutes');
    }
  }

  console.log("[Updated] currentSlot", currentSlot);

  while (currentSlot.isBefore(closeTime)) {
    const endSlot = currentSlot.clone().add(totalSlotMinutes, 'minutes');
    // Ensure that the slot duration does not exceed the closing time
    if (endSlot.isAfter(closeTime)) {
      break;
    }

    const timeString = currentSlot.format('HH:mm');

    // Check if the current slot falls within any of the breaks
    const isDuringBreak = breaks.some(breakItem =>
      currentSlot.isBetween(breakItem.start, breakItem.end, null, '[)')
    );

    if (!isDuringBreak) {
      slots.push({
        time: timeString,
        nameList: existingReservations[timeString] || [],
        available: Math.max(0, maxUsersPerSlot - (existingReservations[timeString]?.length || 0)),
      });
    }

    currentSlot.add(totalSlotMinutes, 'minutes');
  }

  return slots;
};
