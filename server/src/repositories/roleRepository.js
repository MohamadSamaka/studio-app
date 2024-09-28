const Role = require('../models/role'); // Import the Sequelize model

class RoleRepository {
  async findAll() {
    return await Role.findAll();
  }

  async findById(id) {
    return await Role.findByPk(id); // Sequelize's equivalent to Prisma's `findUnique`
  }

  async create(data) {
    return await Role.create(data);
  }

  async update(id, data) {
    return await Role.update(data, { where: { id } });
  }

  async delete(id) {
    return await Role.destroy({ where: { id } });
  }
}

module.exports = new RoleRepository();
