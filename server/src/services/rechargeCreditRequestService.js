const rechargeCreditRequestRepository = require("../repositories/rechargeCreditRequestRepository");
const reservationRepository = require("../repositories/reservationRepository");

const { sequelize } = require("../models/index");

class RechargeCreditRequestService {
  async getAllRequests() {
    try {
      return await rechargeCreditRequestRepository.findAll();
    } catch (error) {
      throw new Error(
        `Error fetching recharge credit requests: ${error.message}`
      );
    }
  }

  async getRequestById(id) {
    try {
      const request = await rechargeCreditRequestRepository.findById(id);
      if (!request) {
        throw new Error(`Recharge credit request with ID ${id} not found`);
      }
      return request;
    } catch (error) {
      throw new Error(
        `Error fetching recharge credit request with ID ${id}: ${error.message}`
      );
    }
  }

  async getRequestsByUserId(id) {
    try {
      const request =
        await rechargeCreditRequestRepository.findRequestsByUserId(id);
      if (!request) {
        throw new Error(`Recharge credit request with ID ${id} not found`);
      }
      return request;
    } catch (error) {
      throw new Error(
        `Error fetching recharge credit request with ID ${id}: ${error.message}`
      );
    }
  }

  async createRequest(data) {
    try {
      return await rechargeCreditRequestRepository.create(data);
    } catch (error) {
      throw new Error(
        `Error creating recharge credit request: ${error.message}`
      );
    }
  }

  async updateRequest(id, data) {
    try {
      return await rechargeCreditRequestRepository.update(id, data);
    } catch (error) {
      throw new Error(
        `Error updating recharge credit request with ID ${id}: ${error.message}`
      );
    }
  }

  async updateRechargeRequestStatus(id, status) {
    const validTransitions = {
      pending: ["failed", "awaiting_payment"],
      awaiting_payment: ["success", "failed"],
    };

    // Begin transaction
    const transaction = await sequelize.transaction();
    try {
      // Fetch recharge request
      const rechargeRequest = await rechargeCreditRequestRepository.findById(
        id
      );
      if (
        !rechargeRequest ||
        !validTransitions[rechargeRequest.status].includes(status)
      ) {
        throw new Error("Invalid status transition");
      }

      // Fetch associated user and subscription
      const user = await rechargeCreditRequestRepository.findUserById(
        rechargeRequest.users_id,
        transaction
      );
      const subscription =
        await rechargeCreditRequestRepository.findSubscriptionById(
          rechargeRequest.subscription_type,
          transaction
        );

      if (!user || !subscription) {
        throw new Error("User or subscription not found");
      }

      const subscriptionCredits = subscription.meetings_num; // Number of credits from subscription

      // Handle credits when transitioning states
      if (status === "awaiting_payment") {
        // Add credits when moving to 'awaiting_payment'
        user.credits += subscriptionCredits;
      } else if (
        rechargeRequest.status === "awaiting_payment" &&
        status === "failed"
      ) {
        // Subtract credits if moving from 'awaiting_payment' to 'failed'
        let restoringCredits = user.credits - subscriptionCredits;

        if (restoringCredits < 0) {
          // Need to remove reservations
          const reservationsToDelete = Math.abs(restoringCredits);

          // Fetch the latest reservations the user made
          const userReservations =
            await reservationRepository.getLatestReservationsByUser(
              user.id,
              reservationsToDelete,
              transaction
            );

          // Remove the latest reservations and delete if no users remain
          for (const reservation of userReservations) {
            // Remove the user from the reservation
            await reservationRepository.removeUserFromReservation(
              user.id,
              reservation.id,
              transaction
            );

            // Check if any users remain in the reservation
            const remainingUsers =
              await reservationRepository.countUsersInReservation(
                reservation.id,
                transaction
              );

            // If no users remain, delete the reservation
            if (remainingUsers === 0) {
              await reservationRepository.delete(reservation.id, {
                transaction,
              });
            }
          }

          restoringCredits = 0; // Set credits to 0 after deleting the necessary reservations
        }

        user.credits = Math.max(restoringCredits, 0);
      }

      // Update user credits
      await rechargeCreditRequestRepository.updateUserCredits(
        user,
        user.credits,
        transaction
      );

      // Update recharge request status
      const updatedRequest = await rechargeCreditRequestRepository.updateStatus(
        id,
        status,
        transaction
      );

      // Commit transaction
      await transaction.commit();

      return updatedRequest;
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      throw new Error("Error updating request status: " + error.message);
    }
  }

  async deleteRequest(id) {
    try {
      return await rechargeCreditRequestRepository.delete(id);
    } catch (error) {
      throw new Error(
        `Error deleting recharge credit request with ID ${id}: ${error.message}`
      );
    }
  }
}

module.exports = new RechargeCreditRequestService();
