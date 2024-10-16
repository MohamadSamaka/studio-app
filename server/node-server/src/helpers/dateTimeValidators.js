const moment = require('moment'); // Assuming you are using moment.js for date-time handling

// Function to validate time slot duration
function isValidTimeSlot(time, duration) {
    const durationMinutes = moment.duration(duration).asMinutes();
    const minutes = moment(time, "HH:mm").minutes();

    return minutes % durationMinutes === 0;
}

// Function to check if the reservation is in the future
function isFutureDateTime(date, time) {
    const now = moment();
    const reservationDateTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");

    return reservationDateTime.isAfter(now);
}

// Exporting the functions to use them in other files
module.exports = {
    isValidTimeSlot,
    isFutureDateTime,
};
