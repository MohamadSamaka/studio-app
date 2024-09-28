import { Alert } from 'react-native';

// user Section
export const validateForm = (fields) => {
  let errors = {};

  Object.keys(fields).forEach((field) => {
    const value = fields[field];

    // Check for empty fields
    if (!value || value.trim() === '') {
      errors[field] = `${field} is required.`;
    }

    // Check for phone number length (assuming the field is named 'phone_num')
    if (field === 'phone_num') {
      const strippedPhoneNumber = value.replace(/\D/g, ''); // Remove non-digit characters

      if (strippedPhoneNumber.length !== 10) {
        errors[field] = 'Phone number must be exactly 10 digits long.';
      }
    }
  });

  return errors;
};


export const isFormValid = (errors) => {
  return Object.keys(errors).length === 0;
};

export const validateBreakWithinBusinessHours = (open_time, close_time, breakTime, day, index) => {
  const openTime = new Date(`1970-01-01T${open_time}`);
  const closeTime = new Date(`1970-01-01T${close_time}`);
  const breakStartTime = new Date(`1970-01-01T${breakTime.start_time}`);
  const breakEndTime = new Date(`1970-01-01T${breakTime.end_time}`);

  // Convert times to local time zone
  openTime.setHours(openTime.getHours() + openTime.getTimezoneOffset() / 60);
  closeTime.setHours(closeTime.getHours() + closeTime.getTimezoneOffset() / 60);
  breakStartTime.setHours(breakStartTime.getHours() + breakStartTime.getTimezoneOffset() / 60);
  breakEndTime.setHours(breakEndTime.getHours() + breakEndTime.getTimezoneOffset() / 60);

  if (breakStartTime < openTime || breakEndTime > closeTime) {
    Alert.alert(
      'Validation Error',
      `Break ${index + 1} on ${day} must fall between open time (${open_time}) and close time (${close_time}). The break will be deleted.`
    );
    return false;
  }

  return true;
};


// BusinessHours Section
export const validateTimeRange = (start_time, end_time, alertMessageForMissingTimes, alertMessageForOrder) => {
  if (!start_time || !end_time) {
    Alert.alert('Validation Error', alertMessageForMissingTimes);
    return false;
  }
  const startTime = new Date(`1970-01-01T${start_time}`);
  const endTime = new Date(`1970-01-01T${end_time}`);
  if (startTime >= endTime) {
    Alert.alert('Validation Error', alertMessageForOrder);
    return false;
  }

  return true;
};


const validateDayData = (day, dayData) => {
  if (!dayData.open) return true;

  const openCloseValid = validateTimeRange(
    dayData.open_time,
    dayData.close_time,
    `Please provide both open and close times for ${day}`,
    `Open time must be earlier than close time for ${day}`
  );

  if (!openCloseValid) return false;

  for (let i = 0; i < dayData.breaks.length; i++) {
    const breakTime = dayData.breaks[i];

    const breakValid = validateTimeRange(
      breakTime.start_time,
      breakTime.end_time,
      `Please provide both start and end times for break ${i + 1} on ${day}`,
      `Break start time must be earlier than end time for ${day} - Break ${i + 1}`
    );
    if (!breakValid) return false;
    const isWithinOpenTime = validateBreakWithinBusinessHours(dayData.open_time, dayData.close_time, breakTime, day, i);

    if (!isWithinOpenTime) return false;
    // Ensure the break falls within open and close times, or it will be removed
  }

  return true;
};

export const validateChanges = (changedBusinessHours) => {
  for (const day in changedBusinessHours) {
    const dayData = changedBusinessHours[day];
    if(dayData.wasPreviouslyClosed === false) continue //continue if day is being switched to closed
    // console.log("day: ", day)
    // console.log("dayData: ", dayData)

    if (!validateDayData(day, dayData))
      return false;
  }
  return true;
};