const businessHourRepository = require("../repositories/businessHourRepository");
const availabilityExceptionRepository = require("../repositories/availabilityExceptionRepository");
const { sequelize } = require("../models");

class BusinessHourService {
  async getAllBusinessHours() {
    return await businessHourRepository.findAll();
  }

  async getBusinessHourById(id) {
    return await businessHourRepository.findById(id);
  }
  async createBusinessHour(data) {
    const transaction = await sequelize.transaction();
    try {
      // Validate required fields
      console.log("recieved data: ", data);

      const { day_of_week, open_time, close_time, breaks } = data;
      if (!day_of_week || !open_time || !close_time) {
        throw new Error(
          "Missing required fields: day_of_week, open_time, or close_time"
        );
      }

      // Optional: Validate breaks structure
      if (breaks && !Array.isArray(breaks)) {
        throw new Error("Breaks should be an array of break objects");
      }

      // Create BusinessHour with nested breaks
      const businessHour = await businessHourRepository.create(
        data,
        transaction
      );
      await transaction.commit();
      return businessHour;
    } catch (error) {
      await transaction.rollback();
      console.error("Service error while creating business hour:", error);
      throw new Error("An error occurred while creating the business hour.");
    }
  }

  async updateBusinessHour(dayOfWeek, data) {
    try {
      // Find the existing business hour by day_of_week
      const existingHour = await businessHourRepository.findByDayOfWeek(
        dayOfWeek
      );

      if (!existingHour) {
        throw new Error(`Business hour for ${dayOfWeek} not found`); // Throw error if not found
      }

      // Update the business hour if it exists
      return await businessHourRepository.updateByDayOfWeek(dayOfWeek, data);
    } catch (error) {
      console.error(`Error in BusinessHourService: ${error.message}`);
      throw error;
    }
  }

  async deleteBusinessHourById(id) {
    return await businessHourRepository.delete(id);
  }

  async deleteBusinessHourByWeek(dayOfWeek) {
    try {
      // Call the repository method to delete by day_of_week
      const result = await businessHourRepository.deleteByDayOfWeek(dayOfWeek);

      if (result === 0) {
        throw new Error(`Business hour for ${dayOfWeek} not found`);
      }

      return result; // Return success if deletion happens
    } catch (error) {
      // Log and throw the error for the controller to handle
      console.error(`Error in BusinessHourService: ${error.message}`);
      throw error;
    }
  }

  async findByDayOfWeek(date) {
    try {
      // Convert the date to the day of the week (e.g., 'Monday')
      const dayOfWeek = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
      }).format(new Date(date));

      const businessHour = await businessHourRepository.findByDayOfWeek(
        dayOfWeek
      );
      return businessHour;
    } catch (error) {
      console.error("Error in BusinessHourService.findByDayOfWeek:", error);
      throw new Error("Failed to retrieve business hours.");
    }
  }

  async getCalendarData() {
    const businessHours = await businessHourRepository.findAll();
    const availabilityExceptions =
      await availabilityExceptionRepository.findAll();
    return this.processBusinessHoursWithExceptions(
      businessHours,
      availabilityExceptions
    );
  }

  processBusinessHoursWithExceptions(businessHours, availabilityExceptions) {
    const calendarData = [];

    // Loop through each day of the week that has business hours
    for (const hour of businessHours) {
      const closestWeekDayDate = this.getDateInCurrentWeek(hour.day_of_week);
      const closestWeekDayNum = closestWeekDayDate.getUTCDay(); // Get the day number (0-6, where 0 is Sunday)

      // Check if there is an availability exception for this day
      const exceptionForThisDay = availabilityExceptions.find((exception) => {
        const exceptionDate = new Date(exception.date);
        const exceptionWeekDayNum = exceptionDate.getUTCDay(); // Get the day number (0-6, where 0 is Sunday)
        return closestWeekDayNum === exceptionWeekDayNum;
      });

      // Always include the default business hours
      const dayAvailability = {
        day: hour.day_of_week,
        open_time: this.formatTime(hour.open_time),
        close_time: this.formatTime(hour.close_time),
        breaks: (hour.breaks || []).map((b) => ({
          start_time: this.formatTime(b.start_time),
          end_time: this.formatTime(b.end_time),
        })),
        exceptions: [],
      };

      if (exceptionForThisDay) {
        // If an exception exists for this day, override or add the exception details
        const exceptionAvailability = {
          exceptionDate: exceptionForThisDay.date,
          fully_closed: exceptionForThisDay.is_closed,
          ...(!exceptionForThisDay.is_closed && {
            open_time:
              this.formatTime(exceptionForThisDay.start_time) ||
              dayAvailability.open_time,
            close_time:
              this.formatTime(exceptionForThisDay.end_time) ||
              dayAvailability.close_time,
            "exceptions-breaks": (
              exceptionForThisDay.AvailabilityExceptionBreaks || []
            ).map((b) => ({
              start_time: this.formatTime(b.start_time),
              end_time: this.formatTime(b.end_time),
            })),
          }),
        };

        dayAvailability.exceptions.push(exceptionAvailability);
      }

      calendarData.push(dayAvailability);
    }

    return calendarData;
  }

  formatTime(date) {
    if (date instanceof Date) {
      return date.toISOString().split("T")[1].slice(0, 8); // Extract time in HH:mm:ss
    }
    return date; // Return as is if it's not a Date object
  }

  getDateInCurrentWeek(weekdayName) {
    const today = new Date();
    const currentWeekdayNum = today.getUTCDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6 in UTC

    const targetWeekdayNum = this.convertDayOfWeekToIndex(weekdayName);

    let deltaDays = targetWeekdayNum - currentWeekdayNum;

    if (deltaDays < 0) {
      deltaDays += 7;
    }

    const targetDate = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() + deltaDays
      )
    );
    targetDate.setUTCHours(0, 0, 0, 0); // Ensure time is set to 00:00:00.000 UTC

    return targetDate; // Return date in ISO format (UTC)
  }

  convertDayOfWeekToIndex(day) {
    const days = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };
    return days[day];
  }
}

module.exports = new BusinessHourService();
