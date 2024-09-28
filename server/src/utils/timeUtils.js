const moment = require('moment'); // Assuming you are using moment.js for date-time handling

// Function to check if start_time is smaller than end_time
function isStartTimeBeforeEndTime(startTimeStr, endTimeStr) {
    const startTime = moment(startTimeStr, 'HH:mm:ss');
    const endTime = moment(endTimeStr, 'HH:mm:ss');
    return startTime.isBefore(endTime);
}

function isTimeInRange(time, startTime, endTime) {
    const format = 'HH:mm:ss';

    const timeToCheck = moment(time, format);
    const start = moment(startTime, format);
    const end = moment(endTime, format);

    // Check if the time falls between the start and end times
    return timeToCheck.isBetween(start, end, null, '[)');
}

function isWithinRefundThreshold(reservationDateStr, currentTimeStr, thresholdTime) {
    const reservationTime = moment(`${reservationDateStr} ${currentTimeStr}`, 'YYYY-MM-DD HH:mm:ss');
    const currentTime = moment(currentTimeStr, 'HH:mm:ss');
    const [hours, minutes] = thresholdTime.split(':').map(Number);
    const thresholdInHours = hours + minutes / 60;
    const hoursDifference = reservationTime.diff(currentTime, 'hours', true);
    return hoursDifference >= thresholdInHours;
}

// Function to validate time slot duration
function isValidTimeSlot(time, duration) {
    const durationMinutes = moment.duration(duration).asMinutes();
    const totalMinutes = moment(time, "HH:mm").hours() * 60 + moment(time, "HH:mm").minutes();

    return totalMinutes % durationMinutes === 0;
}

// Function to check if the reservation is in the future
function isFutureDateTime(date, time) {
    const now = moment();
    const reservationDateTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");

    return reservationDateTime.isAfter(now);
}

// Exporting the functions to use them in other files
module.exports = {
    isTimeInRange,
    isWithinRefundThreshold,
    isValidTimeSlot,
    isFutureDateTime,
    isStartTimeBeforeEndTime,
};
