const ReservationsHasUsers = require('../models/reservationsHasUsers');
const User = require('../models/user');

class ReservationsHasUsersRepository {
  async create(data) {
    return await ReservationsHasUsers.create({
      reservations_id: data.reservations_id,
      users_id: data.users_id,
    });
  }

  async findByReservationId(reservationId) {
    return await ReservationsHasUsers.findAll({
      where: { reservations_id: reservationId },
      include: { model: User, attributes: ['username'] },
    });
  }

  async deleteByReservationId(reservationId) {
    return await ReservationsHasUsers.destroy({
      where: { reservations_id: reservationId },
    });
  }

  async updateReservationUsers(reservationId, userIds) {
    await this.deleteByReservationId(reservationId);

    const creations = userIds.map(userId =>
      this.create({ reservations_id: reservationId, users_id: userId })
    );

    return Promise.all(creations);
  }
}

module.exports = new ReservationsHasUsersRepository();
