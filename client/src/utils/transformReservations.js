import moment from 'moment';

/**
 * Transforms the nested reservation data from the API into a flat array.
 * @param {Object} data - The nested reservation data from the API.
 * @returns {Array} - The transformed reservations array.
 */
export const transformReservations = (data) => {
  const transformed = [];

  // Iterate over each date
  Object.keys(data).forEach((date) => {
    // Iterate over each time slot within the date
    Object.keys(data[date]).forEach((time) => {
      const reservation = data[date][time];
      const id = reservation.id;
      const duration = reservation.duration;
      const title = reservation.title;
      const trainer = reservation.trainer || "N/A";
      const participants = Array.isArray(reservation.participants) ? reservation.participants : [];

      let formattedTime = time;

      // Validate and format time
      if (!moment(time, 'HH:mm', true).isValid()) {
        const parsedTime = moment(time, ['h:mm A', 'H:mm'], true);
        if (parsedTime.isValid()) {
          formattedTime = parsedTime.format('HH:mm');
        } else {
          console.warn(
            `Invalid time format detected: ${time}. Setting to '00:00'.`
          );
          formattedTime = '00:00';
        }
      }

      transformed.push({
        id,
        date,
        time: formattedTime,
        duration,
        title,
        trainer,
        participants, // Correctly mapped and ensured as an array
      });
    });
  });

  return transformed;
};
