const roleService = require('../services/roleService');

class RoleController {
  async getRoles(req, res) {
    try {
      const roles = await roleService.getAllRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createRole(req, res) {
    try {
      const role = await roleService.createRole(req.body);
      res.status(201).json(role);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const role = await roleService.updateRole(parseInt(id), req.body);
      res.json(role);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteRole(req, res) {
    try {
      const { id } = req.params;
      await roleService.deleteRole(parseInt(id));
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new RoleController();
