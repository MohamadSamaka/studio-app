const userRepository = require("../repositories/userRepository");
const AvailableReservationsRepository = require("../repositories/availableReservationsRepository");
const ReservationsGhostsRepository = require("../repositories/reservationsGhostsRepository");
const notificationService = require("./notificationService");
const sequelize = require("../config/database");
const { isDateTimePast, getCurrentTime } = require("../utils/timeUtils");
const { Op } = require("sequelize");
const { userLogger, errorLogger } = require('../utils/logger')

const {
  isWithinRefundThreshold,
  isValidTimeSlot,
  isFutureDateTime,
} = require("../utils/timeUtils");

const {
  RESERVATIONS_CANCELLATION_REFUND_THRESHOLD_TIME,
  RESERVATIONS_MAX_USERS_PER_RESERVATION,
  RESERVATIONS_TIMESLOTS_DURATION,
} = require("../config/env");
const userService = require("./userService");
const { loggers } = require("winston");

class ReservationService {
  async getAllReservations() {
    return AvailableReservationsRepository.findAll();
  }

  async getReservationById(id) {
    return AvailableReservationsRepository.findById(id);
  }

  async getReservationsByUserId(userId) {
    return AvailableReservationsRepository.findByUserId(userId);
  }

  async getOrganizedReservationsByDateAndTime(username) {
    const reservations =
      await AvailableReservationsRepository.findAllWithTrainer();
    const organizedReservations = {};

    reservations.forEach((reservation) => {
      const dateKey = reservation.date || null;
      const timeKey = reservation.startTime
        ? reservation.startTime.slice(0, 5)
        : null;

      if (!dateKey || !timeKey) return;

      if (!organizedReservations[dateKey]) {
        organizedReservations[dateKey] = {};
      }

      if (!organizedReservations[dateKey][timeKey]) {
        organizedReservations[dateKey][timeKey] = {
          attendees: [],
          trainer: null,
        };
      }

      organizedReservations[dateKey][timeKey]["id"] = reservation.id;
      organizedReservations[dateKey][timeKey]["title"] = reservation.title;
      organizedReservations[dateKey][timeKey]["maxParticipants"] =
        reservation.maxParticipants;
      organizedReservations[dateKey][timeKey]["duration"] =
        reservation.duration;

      // Extract usernames directly from the associated Users (Attendees)
      const users = reservation.Participants.map((user) => ({
        id: user.id,
        name: user.username,
      }));
      organizedReservations[dateKey][timeKey]["attendees"].push(...users);

      // Add Trainer's information
      if (reservation.Trainer) {
        organizedReservations[dateKey][timeKey]["trainer"] = {
          id: reservation.Trainer.id,
          name: reservation.Trainer.username,
        };
      } else {
        organizedReservations[dateKey][timeKey]["trainer"] = null;
      }

      organizedReservations[dateKey][timeKey]["isReserved"] = users.some(
        (user) => user.name === username
      );
    });

    return organizedReservations;
  }

  async validateReservation(data) {
    if (!isFutureDateTime(data.date, data.startTime)) {
      return {
        status: "error",
        code: 400,
        message: "Reservation time must be in the future.",
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
      const organizedReservations =
        await AvailableReservationsRepository.findAndCountAll({
          page,
          limit,
          search,
          dateFilter,
          timeFilter,
        });

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

  async createReservationSlot(data) {
    try {
      const reservationData = {
        title: data.title,
        date: data.date,
        startTime: data.startTime,
        duration: data.duration,
        trainerId: data.trainerId,
        maxParticipants: data.maxParticipants,
      };
      return await AvailableReservationsRepository.create(reservationData);
    } catch (error) {
      throw error;
    }
  }

  async processReservation(reservationId, userId, transaction) {
    let reservation = await AvailableReservationsRepository.findById(
      reservationId,
      {
        transaction,
      }
    );
    // Ensure that reservation has the Participants included properly
    if (!reservation || !reservation.Participants) {
      throw new Error("Reservation not found or participants not loaded");
    }

    // Check if the user is already attached to the reservation
    const userAlreadyAttached = reservation.Participants.some(
      (participant) => participant.id === Number(userId)
    );

    if (userAlreadyAttached) {
      userLogger.info(`[-] User tried to book but he was already attached to reservation at ${reservation.date} ${reservation.startTime}`, { 
        userId: userId,
        reservationId: reservation.id
      });

      return {
        status: "already_booked",
        code: 200,
        message: "You are already attached to this reservation.",
      };
    }

    // Check if the reservation is fully booked
    const userCount = reservation.Participants.length;
    const maxParticipants = reservation.maxParticipants;
    if (userCount >= maxParticipants) {
      userLogger.info(`[-] User tried to book but reservation is already full`, { 
        userId: userId,
        reservationId: reservation.id,
      });
      return {
        status: "fully_booked",
        code: 403,
        message: `Reservation failed: The maximum number of ${maxParticipants} users has been reached.`,
      };
    }

    // Attach user to reservation
    await AvailableReservationsRepository.attachUserToReservation(
      reservationId,
      userId,
      { transaction }
    );

    userLogger.info(`[+] User been attached to the reservation ${reservation.date} ${reservation.startTime}`, { 
      userId: userId,
      reservationId: reservation.id,
    });

    // Deduct user's credits
    await userRepository.IncreaseDecreaseUsersCredits(
      [userId],
      -1,
      transaction
    );

    return {
      status: "success",
      code: 201,
      message:
        "User successfully attached to the reservation. Credits deducted by 1.",
    };
  }
  
  async bookReservation(reservationId, userId) {
    const transaction = await sequelize.transaction();
    try {
      const user = await this.fetchUserAndCheckCredits(userId);
      if (user.status) return user; // If it's an error response, return it
      const reservationResponse = await this.processReservation(
        reservationId,
        userId,
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
      console.error("Error booking reservation ", error);
      errorLogger.error('An unexpected error occurred', {
        errorMessage: error.message,
        stackTrace: error.stack,
        additionalInfo: {
          location: "availableReservationService.bookReservation"
        },
      });
      return {
        status: "error",
        code: 500,
        message:
          "Failed to create reservation with user due to a server error.",
      };
    }
  }

  async updateReservation(id, data) {
    return AvailableReservationsRepository.update(id, data);
  }

  async deleteReservation(id, userId, userRole) {
    if (userRole === "admin") {
      // Admin deletes the reservation
      const { userIds, reservation } =
        await AvailableReservationsRepository.deleteReservationAndGetUserIds(
          id
        );
      await notificationService.sendUsersRemovedNotification(
        userIds,
        reservation
      );
      // force
      userService.IncreaseUserCreditByOne(userIds);

      // Optionally, you can return some data or a confirmation message
      return { message: "Reservation cancelled successfully by admin" };
    } else {
      // Non-admin users use the regular cancellation method
      const {reservationId, punished} = await this.cancelReservation(id, userId, false, false);
      await ReservationsGhostsRepository.create({
        reservationId: reservationId,
        punished: !punished,
        cancellationTime: getCurrentTime(),
        userId: userId,
        
      })
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
        targetUserId,
        false
      );

      return { message: "User removed from reservation successfully by admin" };
    } else {
      throw new Error(
        "Unauthorized action: Only admins can remove a user from a reservation"
      );
    }
  }

  async cancelReservation(id, userId, cancelReservaionOnZero = true, byPassPastCheck = true) {
    // Fetch the reservation with associated users
    const reservation = await AvailableReservationsRepository.findByIdWithUsers(
      id
    );
    
    
    if (!reservation) {
      throw new Error("Reservation not found");
    }

    const isPast = isDateTimePast(reservation.date, reservation.startTime);

    const user = await userRepository.findById(userId) 
    // console.log("found user is : ", user)

    if(isPast && !byPassPastCheck){
      userLogger.warn(`[-] User ${user.username} tried to cancel a reservaion that exists in the past`, { 
        user: {
          userId: userId,
          username: user.username,
        },
        reservation: {
          reservationId: reservation.id,
          reservationDate: reservation.date,
          reservationStartTime: reservation.startTime
        }
      });
      throw new Error("Regular users are not allowed to cancel old reservations");
    }


    // Check if the user is part of the reservation
    const userIsInReservation = reservation.Participants.some(
      (user) => user.get("id") === Number(userId)
    );

    if (!userIsInReservation) {
      userLogger.warn(`[-] User ${user.username} is trying to cancel a reservation that he is not in`, { 
        user: {
          userId: userId,
          username: user.username,
        },
        reservation: {
          reservationId: reservation.id,
          reservationDate: reservation.date,
          reservationStartTime: reservation.startTime
        }
      });
      throw new Error("User is not part of this reservation");
    }

    // Remove the user from the reservation
    await AvailableReservationsRepository.removeUserFromReservation(userId, id);
    userLogger.info(`[+] User ${user.username} been successfully removed from reservation`, { 
      user: {
        userId: userId,
        username: user.username,
      },
      reservation:{
        reservationId: reservation.id,
        reservationDate: reservation.date,
        reservationStartTime: reservation.startTime
      }
      
    });
    
    await notificationService.sendUsersRemovedNotification(
      [userId],
      reservation
    );


    const shouldIncreaseCredits = isWithinRefundThreshold( reservation.date, reservation.startTime)

    if (shouldIncreaseCredits){
      await userService.IncreaseUserCreditByOne(userId);
      userLogger.info(`[+] ${user.username}'s credits has been increased by one`, { 
        user: {
          userId: userId,
          username: user.username,
        },
        reservation: {
          reservationId: reservation.id,
          reservationDate: reservation.date,
          reservationStartTime: reservation.startTime,
          shouldIncreaseCredits
        }
      });
    }


    // Check if there are any users left in the reservation
    const remainingUsersCount =
      await AvailableReservationsRepository.countUsersInReservation(id);

    if (cancelReservaionOnZero && remainingUsersCount === 0){
      await AvailableReservationsRepository.delete(id);
      userLogger.info(`[+] reservation has been completly deleted`, { 
        reservation: {
          date: reservation.date,
          time: reservation.startTime
        }
      })
    }

    return {reservationId: reservation.id, punished: shouldIncreaseCredits};
  }
}

module.exports = new ReservationService();
