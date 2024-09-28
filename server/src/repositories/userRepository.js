const User = require("../models/user");
const Role = require("../models/role");
const Reservation = require("../models/reservation");
const Notification = require("../models/notification");
const Sequelize = require("../config/database");

class UserRepository {
  async findAll() {
    return await User.findAll();
  }

  // async findById(id) {
  //   return await User.findByPk(id);
  // }
  async findById(id, { includeReservations = false, transaction = null } = {}) {
    const options = {
      where: { id },
      transaction, // Attach the transaction if provided
    };

    // Conditionally include reservations if requested
    if (includeReservations) {
      options.include = [
        { model: Role },
        {
          model: Reservation,
          through: { attributes: [] }, // Ensure the many-to-many relationship is properly loaded
        },
      ];
    }

    return await User.findOne(options);
  }

  async findByUsername(username) {
    const user = await User.findOne({
      where: { username },
      attributes: {
        include: [
          [
            Sequelize.fn("COUNT", Sequelize.col("Notifications.id")),
            "notificationCount",
          ],
        ],
      },
      include: [
        { model: Role, as: "Role" }, // Ensure the alias matches your association
        {
          model: Notification,
          where: {
            read: false,
          },
          attributes: [],
          required: false,
        },
      ],
      group: ["User.id", "Role.role_id"], // Group by User and Role's correct column name
    });
    return user;
  }

  async findByIdWithRole(id) {
    return await User.findOne({
      where: { id },
      include: [
        { model: Role }, // Include the associated role
      ],
    });
  }

  async create(data) {
    return await User.create(data);
  }

  async update(id, updates) {
    return await User.update(updates, { where: { id } });
  }

  async updateTokens(id, token, refreshToken) {
    return await User.update({ token, refreshToken }, { where: { id } });
  }

  async IncreaseDecreaseUsersCredits(userIds, val) {
    try {
      // Find all users by their IDs
      const users = await User.findAll({
        where: {
          id: userIds,
        },
      });

      if (users.length === 0) {
        throw new Error("No users found");
      }

      // Increment each user's credits by one
      for (const user of users) {
        user.credits += val;
        await user.save();
      }
    } catch (error) {
      console.error("Error increasing user credits:", error);
    }
  }

  async findByToken(token) {
    return await User.findOne({ where: { token } });
  }

  async findByRefreshToken(refreshToken) {
    return await User.findOne({
      where: { refreshToken },
      include: { model: Role },
    });
  }

  async updateUserToken(id, token) {
    return await User.update({ token }, { where: { id } });
  }

  async updateTokensToNull(id) {
    return await User.update(
      { token: null, refreshToken: null },
      { where: { id } }
    );
  }

  async updateLanguage(userId, newLanguage) {
    try {
      const [updatedRowsCount, updatedRows] = await User.update(
        { default_lang: newLanguage },
        {
          where: { id: userId },
          returning: true,
          plain: true,
        }
      );

      if (updatedRowsCount === 0) {
        console.log("updated rows is 0");
        return null;
      }
      console.log("updated rows: ", updatedRows);
      return updatedRows; // Return the updated user
    } catch (error) {
      console.log("error: ", error);
      throw error;
    }
  }

  async delete(id, { transaction }) {
    return await User.destroy({ where: { id }, transaction });
  }
}

module.exports = new UserRepository();
