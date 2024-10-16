const roleRepository = require('../repositories/roleRepository');

class RoleService {
  async getAllRoles() {
    try {
      return await roleRepository.findAll();
    } catch (error) {
      throw new Error(`Error fetching roles: ${error.message}`);
    }
  }

  async getRoleById(id) {
    try {
      const role = await roleRepository.findById(id);
      if (!role) {
        throw new Error(`Role with ID ${id} not found`);
      }
      return role;
    } catch (error) {
      throw new Error(`Error fetching role with ID ${id}: ${error.message}`);
    }
  }

  async createRole(data) {
    try {
      return await roleRepository.create(data);
    } catch (error) {
      throw new Error(`Error creating role: ${error.message}`);
    }
  }

  async updateRole(id, data) {
    try {
      // Only update the name field
      const updateData = { name: data.name };
      return await roleRepository.update(id, updateData);
    } catch (error) {
      throw new Error(`Error updating role with ID ${id}: ${error.message}`);
    }
  }

  async deleteRole(id) {
    try {
      return await roleRepository.delete(id);
    } catch (error) {
      throw new Error(`Error deleting role with ID ${id}: ${error.message}`);
    }
  }
}

module.exports = new RoleService();
