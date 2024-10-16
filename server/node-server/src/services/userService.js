const userRepository = require("../repositories/userRepository");
const reservationRepository = require("../repositories/availableReservationsRepository");
const { sequelize } = require("../models/index");
const { hashPassword } = require("../utils/hashUtils");
const { trimString } = require("../utils/helpers");

class UserService {
  async getAllUsers() {
    return await userRepository.findAll();
  }

  async getAllTrainers() {
    try {
      const trainers = await userRepository.findAllTrainers()
      return trainers;
    } catch (error) {
      console.error("Error fetching trainers:", error);
      throw error;
    }
  }

  async getUserById(id) {
    return await userRepository.findById(id);
  }

  async getUserByToken(token) {
    return await userRepository.findByToken(token);
  }

  async getUserByUsername(username) {
    return await userRepository.findByUsername(username);
  }

  async createUser(data) {
    const { username, password } = data;

    const trimmedUserName = trimString(username);

    const existingUser = await this.getUserByUsername(trimmedUserName);

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(password);

    return await userRepository.create({
      ...data,
      username: trimmedUserName,
      password: hashedPassword,
    });
  }

  async updateUser(id, updates) {
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }
    if (updates.username) {
      updates.username = trimString(updates.username);
    }
    return await userRepository.update(id, updates);
  }

  async updateUserLanguage(userId, newLanguage) {
    // Optionally, validate the new language
    const validLanguages = ["AR", "EN", "HE"];
    if (!validLanguages.includes(newLanguage)) {
      throw new Error("Invalid language code.");
    }

    // Update the language using the repository
    const updatedUser = await userRepository.updateLanguage(
      userId,
      newLanguage
    );

    if (!updatedUser) {
      console.log("uset not found");
      throw new Error("User not found.");
    }

    return updatedUser;
  }

  async IncreaseUserCreditByOne(userIds) {
    try {
      await userRepository.IncreaseDecreaseUsersCredits(userIds, 1);
    } catch (error) {
      throw error;
    }
  }

  async DecreaseDecreaseUserCredits(userId) {
    try {
      await userRepository.IncreaseDecreaseUsersCredits(userIds, -1);
    } catch (error) {
      throw error;
    }
  }

  // async deleteUser(id) {
  //   return await userRepository.delete(id);
  // }

  async deleteUser(id) {
    return await sequelize.transaction(async (transaction) => {
      // Find the user and include related reservations
      const user = await userRepository.findById(id, {
        includeReservations: true,
        transaction,
      });

      if (!user) {
        throw new Error(`User with id ${id} not found`);
      }

      // Ensure user.Reservations is an array
      if (user.Reservations && user.Reservations.length > 0) {
        // Loop through each reservation the user is associated with
        for (const reservation of user.Reservations) {
          // Remove the user from the reservation
          await reservationRepository.removeUserFromReservation(
            user.id,
            reservation.id,
            { transaction }
          );

          // Check if any other users remain in the reservation
          const remainingUsers =
            await reservationRepository.countUsersInReservation(
              reservation.id,
              { transaction }
            );

          // If no users remain, delete the reservation
          if (remainingUsers === 0) {
            await reservationRepository.delete(reservation.id, { transaction });
          }
        }
      }

      // Now, delete the user
      await userRepository.delete(id, { transaction });

      return { message: "User deleted successfully", user };
    });
  }

  async findById(id, { includeReservations = false, transaction } = {}) {
    return await User.findOne({
      where: { id },
      include: includeReservations
        ? [
            {
              model: Reservation,
              through: { attributes: [] }, // Many-to-Many relationship
            },
          ]
        : [],
      transaction,
    });
  }

  async updateUserToken(id, token) {
    return await userRepository.updateUserToken(id, token);
  }

  async nullifyUserTokens(id) {
    try {
      const user = await userRepository.findById(id);
      if (!user) {
        throw new Error(`User with id ${id} not found`);
      }

      await userRepository.updateTokensToNull(id);
      return { message: `Tokens for user with id ${id} have been nullified` };
    } catch (error) {
      console.error(`Error nullifying tokens for user with id ${id}:`, error);
      throw new Error(`Could not nullify tokens for user with id ${id}`);
    }
  }
}

module.exports = new UserService();
