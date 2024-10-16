const { Op } = require("sequelize");
const {
  AvailableReservations,
  ReservationsHasUsers,
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

  async findAllExcludePast() {
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // Get current date in YYYY-MM-DD
    const currentTime = now.toTimeString().split(" ")[0].slice(0, 5); // Get current time in HH:mm

    return AvailableReservations.findAll({
      where: {
        [Op.and]: [
          {
            // Exclude past dates
            date: {
              [Op.gte]: today, // Today's date or future
            },
          },
          {
            // For today's date, exclude past times
            [Op.or]: [
              {
                date: {
                  [Op.gt]: today, // Future date
                },
              },
              {
                // If the date is today, only include reservations for the current time or later
                [Op.and]: [
                  { date: today },
                  { start_time: { [Op.gte]: currentTime } }, // Current time
                ],
              },
            ],
          },
        ],
      },
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
        ["start_time", "ASC"],
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
        ["start_time", "DESC"],
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
      const reservations = await AvailableReservations.findAll({
        where: {
          [Op.or]: [
            { date: { [Op.gt]: today } }, // Future dates
            {
              date: today,
              start_time: { [Op.gte]: currentTime }, // Today's reservations at or after current time
            },
          ],
        },
        attributes: ["id", "date", "start_time", "duration", "title"],
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
        ],
        order: [
          ["date", "ASC"],
          ["start_time", "ASC"],
          ["duration", "ASC"],
        ],
      });

      // Filter reservations to only include those where the user is a participant
      const filteredReservations = reservations.filter((reservation) =>
        reservation.Participants.some(
          (participant) => participant.id === userId
        )
      );

      // Map reservations to desired format
      return filteredReservations.map((reservation) => {
        const allParticipants = reservation.Participants || [];

        // Include all participants, then filter out the current user if needed
        const otherUsers = allParticipants
          .filter((participant) => participant.id !== userId)
          .map((user) => user.username);

        return {
          id: reservation.id,
          date: reservation.date,
          title: reservation.title,
          start_time: reservation.start_time,
          duration: reservation.duration,
          trainer: reservation.Trainer ? reservation.Trainer.username : "N/A",
          participants: otherUsers,
        };
      });
    } catch (error) {
      console.error("Error fetching reservations:", error);
      throw error; // Propagate the error or handle it as needed
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

      // Build the 'where' clause for Reservations based on date and time filters
      const where = {};

      // Apply Date Filters
      if (dateFilter) {
        if (dateFilter.single) {
          where.date = dateFilter.single;
        } else if (dateFilter.start && dateFilter.end) {
          where.date = {
            [Op.between]: [dateFilter.start, dateFilter.end],
          };
        }
      }

      // Apply Time Filters
      if (timeFilter) {
        if (timeFilter.single) {
          where.start_time = timeFilter.single;
        } else if (timeFilter.start && timeFilter.end) {
          where.start_time = {
            [Op.between]: [timeFilter.start, timeFilter.end],
          };
        }
      }

      // Build the 'include' clause for User (Trainer and Participants)
      const include = [
        {
          model: User,
          as: "Trainer", // Specify the 'Trainer' alias
          attributes: ["id", "username"],
        },
        {
          model: User,
          as: "Participants", // Specify the 'Participants' alias
          attributes: ["id", "username"],
          through: { attributes: [] }, // Omit join table attributes
        },
      ];

      // Apply Search Filter (search by username in Participants or Trainer)
      if (search) {
        // To search across both Trainer and Participants, you might need to use separate includes or adjust the query accordingly.
        // Here's an example where we search in Participants:
        include.push({
          model: User,
          as: "Participants",
          where: {
            username: {
              [Op.iLike]: `%${search}%`, // Adjust operator based on your DB dialect
            },
          },
          required: false, // Set to true if you want to filter reservations where Participants match the search
        });

        // Similarly, you can add a search for Trainer if needed:
        include.push({
          model: User,
          as: "Trainer",
          where: {
            username: {
              [Op.iLike]: `%${search}%`, // Adjust operator based on your DB dialect
            },
          },
          required: false,
        });
      }

      // Define query options
      const queryOptions = {
        where, // Date and Time filters
        include, // User associations with aliases
        limit: parsedLimit, // Number of records per page
        offset, // Offset for pagination
        distinct: true, // Ensures accurate count when using include
        order: [
          ["date", "DESC"],
          ["start_time", "ASC"],
        ],
      };

      // Execute the query
      const { rows: reservations, count: total } =
        await AvailableReservations.findAndCountAll(queryOptions);

      // Organize Reservations by Date and Time
      const organizedReservations = {};
      reservations.forEach((reservation) => {
        const dateKey = reservation.date || null;
        const timeKey = reservation.start_time
          ? reservation.start_time.slice(0, 5)
          : null; // Assuming time is in 'HH:mm:ss' format

        if (!dateKey || !timeKey) return;

        if (!organizedReservations[dateKey]) {
          organizedReservations[dateKey] = {};
        }

        // If multiple reservations can exist at the same date and time, adjust accordingly
        if (!organizedReservations[dateKey][timeKey]) {
          organizedReservations[dateKey][timeKey] = {
            id: reservation.id,
            duration: reservation.duration,
            title: reservation.title,
            trainer: reservation.Trainer ? reservation.Trainer.username : "N/A",
            participants: reservation.Participants.map((user) => {
              return {
                id: user.id,
                username: user.username,
              };
            }),
          };
        } else {
          // If a reservation at the same date and time already exists, append participants
          organizedReservations[dateKey][timeKey].participants.push(
            ...reservation.Participants.map((user) => user.username)
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
      reservations_id: reservationId,
      users_id: userId,
      options,
    });
  }

  async createReservationWithUser(reservationId, userId, options = {}) {
    return ReservationsHasUsers.create(
      {
        reservations_id: reservationId,
        users_id: userId,
      },
      options
    );
  }

  async userAlreadyAttached(reservationId, userId, options = {}) {
    return ReservationsHasUsers.findOne({
      where: { reservations_id: reservationId, users_id: userId },
      ...options,
    });
  }

  async countUsersInReservation(reservationId, options = {}) {
    return ReservationsHasUsers.count({
      where: { reservations_id: reservationId },
      ...options,
    });
  }

  async delete(id, options = {}) {
    return AvailableReservations.destroy({ where: { id }, ...options });
  }

  async removeUserFromReservation(userId, reservationId, options = {}) {
    return ReservationsHasUsers.destroy({
      where: {
        users_id: userId,
        reservations_id: reservationId,
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
}

module.exports = new AvailableReservationsRepository();
