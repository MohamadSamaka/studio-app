const userService = require('../services/userService');

class UserController {
  async getUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error.message || 'An error occurred while fetching users.' });
    }
  }

  async getTrainers(req, res) {
    try {
      const users = await userService.getAllTrainers();
      res.json(users);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error.message || 'An error occurred while fetching trainers.' });
    }
  }

  async createUser(req, res) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user); // Return 201 status for a created resource
    } catch (error) {
      console.log("Error Creating User: ", error)
      res.status(400).json({ error: error.message || 'An error occurred while creating the user.' });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.updateUser(parseInt(id), req.body);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message || 'An error occurred while updating the user.' });
    }
  }

  async updateLanguage(req, res) {
    console.log("langauge called")
    try {
      const userId = req.user.id;
      const { language } = req.body; 
      if (!language) {
        return res.status(400).json({ message: 'Language is required.' });
      }

      const updatedUser = await userService.updateUserLanguage(userId, language.toUpperCase());

      return res.status(200).json({
        message: 'Language updated successfully.',
        user: {
          id: updatedUser.id,
          default_lang: updatedUser.default_lang,
        },
      });
    } catch (error) {
      if (error.message === 'Invalid language code.') {
        return res.status(400).json({ message: error.message });
      } else if (error.message === 'User not found.') {
        console.log('user not found? why: ', error)
        return res.status(404).json({ message: error.message });
      } else {
        console.error('Error updating language:', error);
        return res.status(500).json({ message: 'Internal server error.' });
      }
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await userService.deleteUser(parseInt(id));
      res.sendStatus(204);
    } catch (error) {
      console.log("[-] deleting user: ", error)
      res.status(500).json({ error: error.message || 'An error occurred while deleting the user.' });
    }
  }
}

module.exports = new UserController();


