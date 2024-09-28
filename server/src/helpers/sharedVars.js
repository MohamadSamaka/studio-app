const fs = require('fs');

const DEFAULT_VALUES = {
  "reservations": {
    "cancelation-refund-threshold-time": "6:00",
    "max-users-per-reservation": 6,
    "timeslots-duration": "1:30"
  }
};

function getConfiguration() {
  try {
    const data = fs.readFileSync('your_file.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading configuration file:', error);
    return DEFAULT_VALUES;
  }
}

const configuration = getConfiguration();

// Export variables individually, handling missing keys
module.exports = {
  cancelationRefundThresholdTime: configuration.reservations["cancelation-refund-threshold-time"] || DEFAULT_VALUES.reservations["cancelation-refund-threshold-time"],
  maxUsersPerReservation: configuration.reservations["max-users-per-reservation"] || DEFAULT_VALUES.reservations["max-users-per-reservation"],
  timeslotsDuration: configuration.reservations["timeslots-duration"] || DEFAULT_VALUES.reservations["timeslots-duration"]
};