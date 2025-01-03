const { Op } = require("sequelize");
const {
  AvailableReservations,
  ReservationsHasUsers,
  ReservationsGhosts,
  User,
  sequelize,
} = require("../models");

class AvailableReservationsRepository {
  async findAll() {
    return AvailableReservations.findAll({
      include: [
        {
          model: User,
          through: { attributes: [] },
          attributes: ["username"],
        },
      ],
    });
  }

  // async findAllExcludePast() {
  async findAllWithTrainer() {
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // Get current date in YYYY-MM-DD
    const currentTime = now.toTimeString().split(" ")[0].slice(0, 5); // Get current time in HH:mm

    return AvailableReservations.findAll({
      // where: {
      //   [Op.and]: [
      //     {
      //       // Exclude past dates
      //       date: {
      //         [Op.gte]: today, // Today's date or future
      //       },
      //     },
      //     {
      //       // For today's date, exclude past times
      //       [Op.or]: [
      //         {
      //           date: {
      //             [Op.gt]: today, // Future date
      //           },
      //         },
      //         {
      //           // If the date is today, only include reservations for the current time or later
      //           [Op.and]: [
      //             { date: today },
      //             { startTime: { [Op.gte]: currentTime } }, // Current time
      //           ],
      //         },
      //       ],
      //     },
      //   ],
      // },
      include: [
        {
          model: User,
          as: "Trainer", // Alias must match the association defined in models
          attributes: ["id", "username"], // Specify the attributes you want from Trainer
        },
        {
          model: User,
          as: "Participants", // Alias must match the association defined in models
          through: { attributes: [] }, // Exclude attributes from the join table
          attributes: ["id", "username"], // Specify the attributes you want from Participants
        },
      ],
      order: [
        ["date", "ASC"],
        ["startTime", "ASC"],
      ], // Optional: Order by date and time
    });
  }

  async getLatestReservationsByUser(userId, limit, transaction) {
    return AvailableReservations.findAll({
      include: [
        {
          model: User,
          as: "Participants",
          where: { id: userId },
          through: { attributes: [] },
        },
      ],
      order: [
        ["date", "DESC"],
        ["startTime", "DESC"],
      ],
      limit,
      transaction,
    });
  }

  async findById(id, options = {}) {
    return AvailableReservations.findByPk(id, {
      include: [
        {
          model: User,
          as: "Trainer", // Include the Trainer association
          attributes: ["id", "username"],
        },
        {
          model: User,
          as: "Participants", // Include the Participants association
          attributes: ["id", "username"],
          through: { attributes: [] }, // Omit the join table attributes if not needed
        },
      ],
      ...options,
    });
  }

  // New method to fetch reservation with associated users (moving your code here)
  // async findByIdWithUsers(reservationId, options = {}) {
  //   return AvailableReservations.findByPk(reservationId, {
  //     include: [
  //       {
  //         model: User,
  //         attributes: ["id"],
  //         through: { attributes: [] },
  //       },
  //     ],
  //     ...options,
  //   });
  // }

  async findByIdWithUsers(reservationId) {
    return AvailableReservations.findByPk(reservationId, {
      include: [
        {
          model: User,
          as: "Trainer", // Specify the alias for the trainer association
          attributes: ["id", "username"],
        },
        {
          model: User,
          as: "Participants", // Specify the alias for participants
          attributes: ["id", "username"],
          through: { attributes: [] }, // Hide the junction table attributes if not needed
        },
      ],
    });
  }


  async findByUserId(userId) {
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // 'YYYY-MM-DD'
    const currentTime = now.toTimeString().split(" ")[0].slice(0, 5); // 'HH:mm'
  
    try {
      // 1) Fetch All Reservations
      const reservations = await AvailableReservations.findAll({
        attributes: ["id", "date", "startTime", "duration", "title"],
        include: [
          {
            model: User,
            as: "Trainer",
            attributes: ["id", "username"],
          },
          {
            model: User,
            as: "Participants",
            attributes: ["id", "username"],
            through: { attributes: [] },
          },
          {
            model: ReservationsGhosts,
            as: "GhostLogs",
            required: false,
            attributes: ["cancellationTime", "punished", "userId"],
          },
        ],
        order: [
          ["date", "ASC"],
          ["startTime", "ASC"],
          ["duration", "ASC"],
        ],
      });
  
      // 2) Filter reservations where the user is either still in it or has ghost logs
      const filteredReservations = reservations.filter((reservation) => {
        const isCurrentParticipant = reservation.Participants.some(
          (p) => p.id === userId
        );
        const hasGhostLog = reservation.GhostLogs.some(
          (g) => g.userId === userId
        );
        return isCurrentParticipant || hasGhostLog;
      });
  
      // 3) Transform each reservation
      const allTransformed = filteredReservations.map((r) => {
        // Current participant check
        const isCurrentParticipant = r.Participants.some((p) => p.id === userId);
  
        // Collect ghost logs specifically for this user
        const userGhostLogs = r.GhostLogs.filter((g) => g.userId === userId);
  
        // Build array of other participants
        const otherParticipants = r.Participants
          .filter((p) => p.id !== userId)
          .map((u) => u.username);
  
        // Return a simpler object
        return {
          id: r.id,
          date: r.date,
          title: r.title,
          startTime: r.startTime,
          duration: r.duration,
          trainer: r.Trainer ? r.Trainer.username : "N/A",
          participants: otherParticipants,
          // Keep ghostInfo for multiple cancellations
          ghostInfo: userGhostLogs.map((g) => ({
            cancellationTime: g.cancellationTime,
            punished: g.punished,
          })),
          // We'll use this flag just to split them into active vs canceled
          isCurrentParticipant,
        };
      });
  
      // 4) Separate into active vs canceled
      const activeReservations = [];
      const canceledReservations = [];
  
      allTransformed.forEach((res) => {
        if (res.isCurrentParticipant) {
          // Keep ghostInfo if you want to show prior cancellations
          activeReservations.push({
            id: res.id,
            date: res.date,
            title: res.title,
            startTime: res.startTime,
            duration: res.duration,
            trainer: res.trainer,
            participants: res.participants,
            ghostInfo: res.ghostInfo,
          });
        } else {
          // user is not a participant, so this is canceled
          canceledReservations.push({
            id: res.id,
            date: res.date,
            title: res.title,
            startTime: res.startTime,
            duration: res.duration,
            trainer: res.trainer,
            participants: res.participants,
            ghostInfo: res.ghostInfo,
          });
        }
      });
  
      return {
        activeReservations,
        canceledReservations,
      };
    } catch (error) {
      console.error("Error fetching reservations:", error);
      throw error;
    }
  }

  async findAndCountAll({
    page,
    limit,
    search,
    dateFilter,
    timeFilter,
    userId,
  }) {
    try {
      const offset = (page - 1) * limit;
      const parsedLimit = parseInt(limit, 10);
      const parsedPage = parseInt(page, 10);
  
      const where = {};
  
      // === DATE FILTERS ===
      if (dateFilter) {
        if (dateFilter.single) {
          where.date = dateFilter.single;
        } else if (dateFilter.start && dateFilter.end) {
          where.date = {
            [Op.between]: [dateFilter.start, dateFilter.end],
          };
        }
      }
  
      // === TIME FILTERS ===
      if (timeFilter) {
        if (timeFilter.single) {
          where.startTime = timeFilter.single;
        } else if (timeFilter.start && timeFilter.end) {
          where.startTime = {
            [Op.between]: [timeFilter.start, timeFilter.end],
          };
        }
      }
  
      // === INCLUDE TRAINER ===
      const trainerInclude = {
        model: User,
        as: "Trainer",
        attributes: ["id", "username"],
        required: false,
      };
  
      // === INCLUDE PARTICIPANTS (CURRENT) ===
      const participantsInclude = {
        model: User,
        as: "Participants",
        attributes: ["id", "username"],
        through: { attributes: [] },
        required: false,
      };
  
      // === INCLUDE GHOST LOGS (PAST REMOVED USERS) ===
      const ghostsInclude = {
        model: ReservationsGhosts,
        as: "GhostLogs",
        include: [
          {
            model: User,
            as: "User",
            attributes: ["id", "username"],
          },
        ],
        required: false,
        attributes: ["cancellationTime", "punished", "userId"],
      };
  
      // === APPLY SEARCH (IF ANY) ===
      if (search) {
        trainerInclude.where = {
          username: { [Op.iLike]: `%${search}%` },
        };
        participantsInclude.where = {
          username: { [Op.iLike]: `%${search}%` },
        };
      }
  
      // === FINAL INCLUDE ARRAY ===
      const include = [trainerInclude, participantsInclude, ghostsInclude];
  
      // === QUERY OPTIONS ===
      const queryOptions = {
        where,
        include,
        limit: parsedLimit,
        offset,
        distinct: true,
        order: [
          ["date", "DESC"],
          ["startTime", "ASC"],
        ],
      };
  
      // === EXECUTE THE QUERY ===
      const { rows: reservations, count: total } =
        await AvailableReservations.findAndCountAll(queryOptions);
  
      // === ORGANIZE OUTPUT (MULTIPLE GHOST LOGS PER USER) ===
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
  
        // Build an array of current participants
        // Each participant starts with an empty ghostLogs array
        const currentParticipants = reservation.Participants.map((u) => ({
          id: u.id,
          username: u.username,
          isCurrentParticipant: true,
          ghostLogs: [], // no ghost logs if they're currently in
        }));
  
        // For each ghost log, store the user plus the single canceled entry
        // userId references the user who was removed
        // We'll later accumulate multiple logs if they canceled multiple times
        const ghostEntries = reservation.GhostLogs.map((ghost) => ({
          userId: ghost.userId,
          username: ghost.User.username,
          cancellationTime: ghost.cancellationTime,
          punished: ghost.punished,
        }));
  
        // Combine them into a single participants dictionary keyed by userId
        const combinedUsers = {};
  
        // 1) Insert current participants
        currentParticipants.forEach((p) => {
          combinedUsers[p.id] = {
            ...p,
            // isCurrentParticipant: true
            // ghostLogs: []
          };
        });
  
        // 2) Process each ghost entry:
        ghostEntries.forEach((ge) => {
          // If there's no user record yet, create one with isCurrentParticipant = false
          if (!combinedUsers[ge.userId]) {
            combinedUsers[ge.userId] = {
              id: ge.userId,
              username: ge.username,
              isCurrentParticipant: false,
              ghostLogs: [],
            };
          }
          // Push a new ghost log record for each cancellation
          combinedUsers[ge.userId].ghostLogs.push({
            cancellationTime: ge.cancellationTime,
            punished: ge.punished,
          });
        });
  
        // Convert the object back to an array
        const finalParticipantArray = Object.values(combinedUsers);
  
        // If we haven't seen this date/time, create it
        if (!organizedReservations[dateKey][timeKey]) {
          organizedReservations[dateKey][timeKey] = {
            id: reservation.id,
            duration: reservation.duration,
            title: reservation.title,
            trainer: reservation.Trainer ? reservation.Trainer.username : "N/A",
            participants: finalParticipantArray,
          };
        } else {
          // If a reservation with the same date/time already exists (rare), merge participants
          organizedReservations[dateKey][timeKey].participants.push(
            ...finalParticipantArray
          );
        }
      });
  
      return {
        data: organizedReservations,
        currentPage: parsedPage,
        totalPages: Math.ceil(total / parsedLimit),
        totalReservations: total,
      };
    } catch (error) {
      console.error("Error in findAndCountAll:", error);
      throw error;
    }
  }

  async findReservationByDateTime(date, time, options = {}) {
    return AvailableReservations.findOne({
      where: { date, time },
      ...options,
    });
  }

  async create(data, options = {}) {
    return AvailableReservations.create(data, options);
  }

  async attachUserToReservation(reservationId, userId, options = {}) {
    return ReservationsHasUsers.create({
      reservationId: reservationId,
      userId: userId,
      options,
    });
  }

  async createReservationWithUser(reservationId, userId, options = {}) {
    return ReservationsHasUsers.create(
      {
        reservationId: reservationId,
        userId: userId,
      },
      options
    );
  }

  async userAlreadyAttached(reservationId, userId, options = {}) {
    return ReservationsHasUsers.findOne({
      where: { reservationId: reservationId, userId: userId },
      ...options,
    });
  }

  async countUsersInReservation(reservationId, options = {}) {
    return ReservationsHasUsers.count({
      where: { reservationId: reservationId },
      ...options,
    });
  }

  async delete(id, options = {}) {
    return AvailableReservations.destroy({ where: { id }, ...options });
  }

  async removeUserFromReservation(userId, reservationId, options = {}) {
    return ReservationsHasUsers.destroy({
      where: {
        userId: userId,
        reservationId: reservationId,
      },
      ...options,
    });
  }

  // Updated method using the new findByIdWithUsers method
  async deleteReservationAndGetUserIds(reservationId, options = {}) {
    // Start a transaction if not provided
    const transaction = options.transaction || (await sequelize.transaction());

    try {
      // Fetch the reservation along with associated users using the new method
      const reservation = await this.findByIdWithUsers(reservationId, {
        transaction,
      });

      if (!reservation) {
        throw new Error("Reservation not found");
      }

      // Extract user IDs
      console.log("reservation: ", reservation);
      const userIds = reservation.Participants.map((user) => user.id);

      // Delete the reservation
      await reservation.destroy({ transaction });

      // Commit the transaction if we started it
      if (!options.transaction) {
        await transaction.commit();
      }

      return { userIds, reservation };
    } catch (error) {
      // Rollback the transaction if we started it
      if (!options.transaction) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  async update(id, data, options = {}) {
    // Start a transaction if not provided
    const transaction = options.transaction || (await sequelize.transaction());

    try {
      const { trainerId, participant_ids, ...reservationData } = data;

      // Find the reservation by ID
      const reservation = await AvailableReservations.findByPk(id, {
        transaction,
        ...options,
      });

      if (!reservation) {
        throw new Error("Reservation not found");
      }

      // Update reservation fields
      await reservation.update(reservationData, { transaction, ...options });

      // Update Trainer association if trainerId is provided
      if (trainerId !== undefined) {
        await reservation.setTrainer(trainerId, { transaction, ...options });
      }

      // Update Participants association if participant_ids is provided
      if (participant_ids !== undefined) {
        await reservation.setParticipants(participant_ids, {
          transaction,
          ...options,
        });
      }

      // Fetch the updated reservation with associations before committing
      const updatedReservation = await this.findById(id, {
        transaction,
        ...options,
      });

      // Commit the transaction if we started it
      if (!options.transaction) {
        await transaction.commit();
      }

      // Return the updated reservation
      return updatedReservation;
    } catch (error) {
      // Rollback the transaction if we started it
      if (!options.transaction) {
        await transaction.rollback();
      }
      throw error;
    }
  }
}

module.exports = new AvailableReservationsRepository();
