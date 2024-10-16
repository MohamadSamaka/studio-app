import moment from 'moment';

export const transformReservations = (data) => {
  const transformed = [];
  Object.keys(data).forEach((date) => {
    Object.keys(data[date]).forEach((time) => {
      const users = data[date][time];
      let formattedTime = time;
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
        id: `${date}-${formattedTime}`,
        date,
        time: formattedTime,
        users,
      });
    });
  });
  return transformed;
};
