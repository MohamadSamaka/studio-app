const ReservationsGhosts = require('../models/reservationsGhosts');
const User = require('../models/user');

class ReservationsGhostsRepository {
  async create(data) {
    return await ReservationsGhosts.create(data);
  }

  async findGhosts(reservationId) {
    return await ReservationsGhosts.findAll({
      where: { reservations_id: reservationId },
      include: { model: User, attributes: ['username'] },
    });
  }

}

module.exports = new ReservationsGhostsRepository();
