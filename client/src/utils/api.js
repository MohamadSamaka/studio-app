import {
  getBusinessHours,
  updateBusinessHourByDayOfWeek,
  deleteBusinessHourByDayOfWeek,
  createBusinessHour,
  getAvailabilityExceptions,
  createAvailabilityException as axiosCreateAvailabilityException,
  updateAvailabilityException as axiosUpdateAvailabilityException,
  deleteAvailabilityException as axiosDeleteAvailabilityException 
} from './axios';
export const fetchBusinessHours = async () => {
  const response = await getBusinessHours();
  const businessHours = {};
  response.data.forEach((item) => {
    businessHours[item.day_of_week] = {
      id: item.id,
      open: true,
      open_time: item.open_time,
      close_time: item.close_time,
      breaks: item.breaks,
    };
  });

  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach((day) => {
    if (!businessHours[day]) businessHours[day] = { open: false, open_time: '', close_time: '', breaks: [] };
  });

  console.log("returned : ", JSON.stringify(businessHours, null, 2))

  return { businessHours, initialBusinessHours: { ...businessHours } };
};

export const saveBusinessHoursChanges = async (changedBusinessHours, initialBusinessHours) => {
  const promises = Object.keys(changedBusinessHours).map(async (day) => {
    const dayData = changedBusinessHours[day];
    const wasInitiallyClosed = !initialBusinessHours[day].open;
    console.log("op for day : ", day)
    
    if (dayData.open && wasInitiallyClosed) {
      console.log("op:  create", )
      console.log("dayData: ", dayData )
      console.log("dayData.business_hour_id", dayData)
      await createBusinessHour({
        day_of_week: day,
        open_time: dayData.open_time,
        close_time: dayData.close_time,
        breaks: dayData.breaks
      });
    } else if (dayData.open && !wasInitiallyClosed) {
      console.log("op:  update" )

      await updateBusinessHourByDayOfWeek(day, dayData);
    } else if (!dayData.open) {
      console.log("op:  delete" )
      await deleteBusinessHourByDayOfWeek(day);

    }
  });
  await Promise.all(promises);
};


// AvailabiltyExceptions


export const fetchAvailabiltyExceptions = async () => {
  const response = await getAvailabilityExceptions();
  const businessHours = {};
  response.data.forEach((item) => {
    businessHours[item.date] = {
      id: item.id,
      closed: item.is_closed, // If is_closed is true, open should be false
      // Only include start_time and end_time if they exist
      ...(item.start_time && { start_time: item.start_time }),
      ...(item.end_time && { end_time: item.end_time }),
      AvailabilityExceptionBreaks: item.AvailabilityExceptionBreaks || [], // Default to an empty array if no breaks
    };
  });

  return businessHours
}


export const createAvailabilityException = async (exceptionData) => {
  try {
    console.log("exceptionData: ", exceptionData)
    const response = await axiosCreateAvailabilityException(exceptionData)
    return response.data;
  } catch (error) {
    console.error('Error creating availability exception:', error);
    throw error;
  }
};

// Update Availability Exception
export const updateAvailabilityException = async (id, exceptionData) => {
  try {
    const response = await axiosUpdateAvailabilityException(id, exceptionData)
    return response.data;
  } catch (error) {
    console.error(`Error updating availability exception with ID ${id}:`, error);
    throw error;
  }
};

// Delete Availability Exception
export const deleteAvailabilityException = async (id) => {
  try {
    const response = await axiosDeleteAvailabilityException(id)
    return response.data;
  } catch (error) {
    console.error(`Error deleting availability exception with ID ${id}:`, error);
    throw error;
  }
};