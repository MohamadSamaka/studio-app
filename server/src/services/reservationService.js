const userRepository = require("../repositories/userRepository"); // Using your existing userRepository
const reservationRepository = require("../repositories/reservationRepository");
const availabilityExceptionRepository = require("../repositories/availabilityExceptionRepository");
const businessHourRepository = require("../repositories/businessHourRepository");
const notificationService = require("../services/notificationService");
const sequelize = require("../config/database");
const { Op } = require("sequelize");

const {
  isWithinRefundThreshold,
  isValidTimeSlot,
  isFutureDateTime,
  isTimeInRange,
} = require("../utils/timeUtils");

const {
  RESERVATIONS_CANCELLATION_REFUND_THRESHOLD_TIME,
  RESERVATIONS_MAX_USERS_PER_RESERVATION,
  RESERVATIONS_TIMESLOTS_DURATION,
} = require("../config/env");
const userService = require("./userService");

class ReservationService {
  async getAllReservations() {
    return reservationRepository.findAll();
  }

  async getReservationById(id) {
    return reservationRepository.findById(id);
  }

  async getReservationsByUserId(userId) {
    return reservationRepository.findByUserId(userId);
  }

  async getOrganizedReservationsByDateAndTime() {
    const reservations = await reservationRepository.findAllExcludePast();
    const organizedReservations = {};

    reservations.forEach((reservation) => {
      const dateKey = reservation.date || null;
      const timeKey = reservation.time ? reservation.time.slice(0, 5) : null;

      if (!dateKey || !timeKey) return;

      if (!organizedReservations[dateKey]) {
        organizedReservations[dateKey] = {};
      }

      if (!organizedReservations[dateKey][timeKey]) {
        organizedReservations[dateKey][timeKey] = [];
      }

      // Extract usernames directly from the associated Users
      const users = reservation.Users.map((user) => user.username);
      organizedReservations[dateKey][timeKey].push(...users);
    });

    return organizedReservations;
  }
  async validateReservation(data) {
    if (!isFutureDateTime(data.date, data.time)) {
      return {
        status: "error",
        code: 400,
        message: "Reservation time must be in the future.",
      };
    }

    if (!isValidTimeSlot(data.time, RESERVATIONS_TIMESLOTS_DURATION)) {
      return {
        status: "error",
        code: 400,
        message: `Invalid reservation time. Times must align with ${RESERVATIONS_TIMESLOTS_DURATION} intervals.`,
      };
    }

    return null;
  }

  async getPaginatedReservationsByDateAndTime(
    page,
    limit,
    search,
    dateFilter,
    timeFilter
  ) {
    try {
      const organizedReservations = await reservationRepository.findAndCountAll(
        {
          page,
          limit,
          search,
          dateFilter,
          timeFilter,
        }
      );

      return organizedReservations;
    } catch (error) {
      console.error("Error in getPaginatedReservationsByDateAndTime:", error);
      throw error;
    }
  }

  async fetchUserAndCheckCredits(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      return { status: "error", code: 404, message: "User not found." };
    }

    if (user.credits <= 0) {
      return {
        status: "no_credits",
        code: 403,
        message: "Insufficient credits. Please recharge to make a reservation.",
      };
    }

    return user;
  }

  async processReservation(data, user, transaction) {
    let reservation = await reservationRepository.findReservationByDateTime(
      data.date,
      data.time,
      { transaction }
    );

    if (!reservation) {
      reservation = await reservationRepository.create(data, { transaction });
    }

    const userAlreadyAttached = await reservationRepository.userAlreadyAttached(
      reservation.id,
      user.id,
      { transaction }
    );

    if (userAlreadyAttached) {
      return {
        status: "already_booked",
        code: 200,
        message: "You are already attached to this reservation.",
      };
    }

    const userCount = await reservationRepository.countUsersInReservation(
      reservation.id,
      { transaction }
    );

    if (userCount >= RESERVATIONS_MAX_USERS_PER_RESERVATION) {
      return {
        status: "fully_booked",
        code: 403,
        message: `Reservation failed: The maximum number of ${RESERVATIONS_MAX_USERS_PER_RESERVATION} users has been reached.`,
      };
    }

    await reservationRepository.createReservationWithUser(
      reservation.id,
      user.id,
      { transaction }
    );

    user.credits -= 1;
    await user.save({ transaction });
    return {
      status: "success",
      code: 201,
      message:
        "User successfully attached to the reservation. Credits deducted by 1.",
    };
  }

  async checkAvailability(date, time) {
    try {
      const dayOfWeek = new Date(date).toLocaleString("en-us", {
        weekday: "long",
      });
      const timeObj = new Date(`1970-01-01T${time}`);

      // Check for AvailabilityException first
      const availabilityException =
        await availabilityExceptionRepository.findByDate(date);

      if (availabilityException) {
        if (availabilityException.is_closed) {
          return {
            status: "error",
            code: 403,
            message:
              "The business is closed on this day due to an availability exception.",
          };
        }

        const start_time = availabilityException.start_time;
        const end_time = availabilityException.end_time;

        if (!isTimeInRange(time, start_time, end_time))
          return {
            status: "error",
            code: 403,
            message: "Reservation time is outside business hours.",
          };

        // Check if the time falls within any break periods
        const isInBreak =
          availabilityException.AvailabilityExceptionBreaks.some((break_) => {
            const breakStart = new Date(`1970-01-01T${break_.start_time}`);
            const breakEnd = new Date(`1970-01-01T${break_.end_time}`);
            return timeObj >= breakStart && timeObj < breakEnd;
          });

        if (isInBreak) {
          return {
            status: "error",
            code: 403,
            message:
              "Reservation time falls within a break period during the availability exception.",
          };
        }
        return {
          status: "success",
          code: 200,
          message: "Reservation time is available.",
        };
      }
      const businessHour = await businessHourRepository.findByDayOfWeek(
        dayOfWeek
      );

      if (!businessHour) {
        return {
          status: "error",
          code: 403,
          message: "Business is closed on this day.",
        };
      }

      const openTime = new Date(`1970-01-01T${businessHour.open_time}`);
      const closeTime = new Date(`1970-01-01T${businessHour.close_time}`);

      if (timeObj < openTime || timeObj >= closeTime) {
        return {
          status: "error",
          code: 403,
          message: "Reservation time is outside business hours.",
        };
      }

      // Check if the time falls within any break periods
      const isInBreak = businessHour.breaks.some((break_) => {
        const breakStart = new Date(`1970-01-01T${break_.start_time}`);
        const breakEnd = new Date(`1970-01-01T${break_.end_time}`);
        return timeObj >= breakStart && timeObj < breakEnd;
      });

      if (isInBreak) {
        return {
          status: "error",
          code: 403,
          message: "Reservation time falls within a break period.",
        };
      }

      return {
        status: "success",
        code: 200,
        message: "Reservation time is available.",
      };
    } catch (error) {
      console.error("Error in checkAvailability:", error);
      return {
        status: "error",
        code: 500,
        message:
          "An internal server error occurred while checking availability.",
      };
    }
  }

  async createReservation(data, userId) {
    const transaction = await sequelize.transaction();
    try {
      // Validate reservation date and time
      const validationResponse = await this.validateReservation(data, userId);
      if (validationResponse) return validationResponse;

      const user = await this.fetchUserAndCheckCredits(userId);
      if (user.status) return user; // If it's an error response, return it

      const availabilityCheck = await this.checkAvailability(
        data.date,
        data.time
      );

      if (availabilityCheck.status == "error") return availabilityCheck; // If it's an error response, return it

      const reservationResponse = await this.processReservation(
        data,
        user,
        transaction
      );

      if (reservationResponse.status !== "success") {
        await transaction.rollback();
        return reservationResponse;
      }
      await transaction.commit();
      return {
        status: "success",
        code: 201,
        message:
          "User successfully attached to the reservation. Credits deducted by 1.",
      };
    } catch (error) {
      await transaction.rollback();
      console.error("Error creating reservation with user:", error);
      return {
        status: "error",
        code: 500,
        message:
          "Failed to create reservation with user due to a server error.",
      };
    }
  }

  async updateReservation(id, data) {
    return reservationRepository.update(id, data);
  }

  async deleteReservation(id, userId, userRole) {
    console.log("delete reservation:");
    if (userRole === "admin") {
      // Admin deletes the reservation
      const { userIds, reservation } =
        await reservationRepository.deleteReservationAndGetUserIds(id);
      await notificationService.sendUsersRemovedNotification(
        userIds,
        reservation
      );
      userService.IncreaseUserCreditByOne(userIds);
      // // Send notifications to affected users
      // await notificationService.sendReservationCancelledNotifications(
      //   userIds,
      //   reservationDate,
      //   reservationTime
      // );

      // Optionally, you can return some data or a confirmation message
      return { message: "Reservation cancelled successfully by admin" };
    } else {
      // Non-admin users use the regular cancellation method
      await this.cancelReservation(id, userId);

      // Optionally, return a confirmation message
      return { message: "Reservation cancelled successfully" };
    }
  }

  async removeUserFromReservation(
    reservationId,
    targetUserId,
    userRole,
    silent = false
  ) {
    if (userRole === "admin") {
      // Admin removes a user from a reservation
      const reservationDetails = await this.cancelReservation(
        reservationId,
        targetUserId
      );

      // const reservationId = await this.cancelReservation(reservationId, targetUserId);

      // Optionally, send a notification to the user
      // await notificationService.sendUserRemovedNotification(
      //   targetUserId,
      //   reservationDetails
      // );

      return { message: "User removed from reservation successfully by admin" };
    } else {
      throw new Error(
        "Unauthorized action: Only admins can remove a user from a reservation"
      );
    }
  }

  async cancelReservation(id, userId, silent = false) {
    // Fetch the reservation with associated users
    const reservation = await reservationRepository.findByIdWithUsers(id);

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    // Check if the user is part of the reservation
    const userIsInReservation = reservation.Users.some(
      (user) => user.get("id") === Number(userId)
    );

    if (!userIsInReservation) {
      throw new Error("User is not part of this reservation");
    }

    // Remove the user from the reservation
    await reservationRepository.removeUserFromReservation(userId, id);
    await notificationService.sendUsersRemovedNotification(
      [userId],
      reservation
    );

    await userService.IncreaseUserCreditByOne(userId);

    // Check if there are any users left in the reservation
    const remainingUsersCount =
      await reservationRepository.countUsersInReservation(id);

    if (remainingUsersCount === 0) {
      // Delete the reservation if no users are left
      await reservationRepository.delete(id);
    }
    return reservation.id;
  }
}

module.exports = new ReservationService();
