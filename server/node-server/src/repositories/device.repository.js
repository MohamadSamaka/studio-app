const Device = require("../models/device");
const { Sequelize } = require("sequelize");

class DeviceRepository {
  async findAll(userId) {
    await Device.findAll({
      where: {
        userId: userId,
      },
    });
  }
}


module.exports = new DeviceRepository();
