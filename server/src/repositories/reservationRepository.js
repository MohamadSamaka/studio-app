const { Op } = require("sequelize");
const {
  Reservation,
  ReservationsHasUsers,
  User,
  sequelize,
} = require("../models");

class ReservationRepository {
  async findAll() {
    return Reservation.findAll({
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

    return Reservation.findAll({
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
                  { time: { [Op.gte]: currentTime } }, // Current time
                ],
              },
            ],
          },
        ],
      },
      include: [
        {
          model: User,
          through: { attributes: [] },
          attributes: ["username"],
        },
      ],
    });
  }

  async getLatestReservationsByUser(userId, limit, transaction) {
    return Reservation.findAll({
      include: [
        {
          model: User,
          where: { id: userId },
          through: { attributes: [] },
        },
      ],
      order: [
        ["date", "DESC"],
        ["time", "DESC"],
      ],
      limit,
      transaction,
    });
  }

  async findById(id, options = {}) {
    return Reservation.findByPk(id, {
      include: [
        {
          model: User,
          through: { attributes: [] },
          attributes: ["username"],
        },
      ],
      ...options,
    });
  }

  // New method to fetch reservation with associated users (moving your code here)
  async findByIdWithUsers(reservationId, options = {}) {
    return Reservation.findByPk(reservationId, {
      include: [
        {
          model: User,
          attributes: ["id"],
          through: { attributes: [] },
        },
      ],
      ...options,
    });
  }

  /**
   * Fetches paginated reservations with optional filters.
   *
   * @param {Object} options - The options for fetching reservations.
   * @param {number} options.page - The current page number.
   * @param {number} options.limit - The number of reservations per page.
   * @param {string} [options.search] - The username to search for.
   * @param {Object} [options.dateFilter] - The date filter object.
   * @param {string} [options.dateFilter.single] - A single date to filter.
   * @param {string} [options.dateFilter.start] - The start date for range filtering.
   * @param {string} [options.dateFilter.end] - The end date for range filtering.
   * @param {Object} [options.timeFilter] - The time filter object.
   * @param {string} [options.timeFilter.single] - A single time to filter.
   * @param {string} [options.timeFilter.start] - The start time for range filtering.
   * @param {string} [options.timeFilter.end] - The end time for range filtering.
   *
   * @returns {Object} The paginated reservations with metadata.
   */
  async findAndCountAll({ page, limit, search, dateFilter, timeFilter }) {
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
          where.time = timeFilter.single;
        } else if (timeFilter.start && timeFilter.end) {
          where.time = {
            [Op.between]: [timeFilter.start, timeFilter.end],
          };
        }
      }

      // Build the 'include' clause for User with search filter
      const include = [
        {
          model: User,
          attributes: ["username", "id"],
          through: { attributes: [] }, // Omit junction table attributes if it's a many-to-many relationship
        },
      ];

      // Apply Search Filter (search by username)
      if (search) {
        include[0].where = {
          username: { [Op.like]: `%${search}%` }, // Case-insensitive search in MySQL
        };
        include[0].required = true; // Ensures INNER JOIN
      }

      // Define query options
      const queryOptions = {
        where, // Date and Time filters
        include, // User search filter
        limit: parsedLimit, // Number of records per page
        offset, // Offset for pagination
        distinct: true, // Ensures accurate count when using include
        order: [
          ["date", "DESC"],
          ["time", "ASC"],
        ],
      };

      // Execute the query
      const { rows: reservations, count: total } =
        await Reservation.findAndCountAll(queryOptions);

      // Organize Reservations by Date and Time
      const organizedReservations = {};
      reservations.forEach((reservation) => {
        const dateKey = reservation.date || null;
        const timeKey = reservation.time ? reservation.time.slice(0, 5) : null; // Assuming time is in 'HH:mm:ss' format

        if (!dateKey || !timeKey) return;

        if (!organizedReservations[dateKey]) {
          organizedReservations[dateKey] = {};
        }

        // If multiple reservations can exist at the same date and time, adjust accordingly
        if (!organizedReservations[dateKey][timeKey]) {
          organizedReservations[dateKey][timeKey] = {
            id: reservation.id,
            users: reservation.Users.map((user) => ({
              username: user.username,
              id: user.id,
            })),
          };
        } else {
          // If a reservation at the same date and time already exists, append users
          organizedReservations[dateKey][timeKey].users.push(
            ...reservation.Users.map((user) => ({
              username: user.username,
              id: user.id,
            }))
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
  async findByUserId(userId) {
    // Get current date and time
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // 'YYYY-MM-DD'
    const currentTime = now.toTimeString().split(" ")[0].slice(0, 5); // 'HH:mm'

    try {
      const reservations = await Reservation.findAll({
        where: {
          [Op.or]: [
            { date: { [Op.gt]: today } }, // Future dates
            {
              date: today,
              time: { [Op.gte]: currentTime }, // Today's reservations at or after current time
            },
          ],
        },
        attributes: ["id", "date", "time"],
        include: [
          {
            model: User,
            attributes: ["id", "username"],
            through: { attributes: [] },
            where: { id: { [Op.ne]: userId } }, // Exclude current user from otherUsers
            required: false,
          },
          {
            model: User,
            as: "CurrentUser", // Ensure this alias matches your association
            attributes: [],
            through: { attributes: [] },
            where: { id: userId }, // Include only the current user
            required: true, // Ensure reservations have the current user
          },
        ],
        order: [
          ["date", "ASC"],
          ["time", "ASC"],
        ],
      });

      // Map reservations to desired format
      return reservations.map((reservation) => ({
        id: reservation.id,
        date: reservation.date,
        time: reservation.time,
        otherUsers: reservation.Users
          ? reservation.Users.map((user) => user.username)
          : [],
      }));
    } catch (error) {
      console.error("Error fetching reservations:", error);
      throw error; // Propagate the error or handle it as needed
    }
  }

  async findReservationByDateTime(date, time, options = {}) {
    return Reservation.findOne({
      where: { date, time },
      ...options,
    });
  }

  async create(data, options = {}) {
    return Reservation.create({ date: data.date, time: data.time }, options);
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
    return Reservation.destroy({ where: { id }, ...options });
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
      const userIds = reservation.Users.map((user) => user.id);

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

module.exports = new ReservationRepository();
