const ReservationsHasUsers = require('../models/reservationsHasUsers');
const User = require('../models/user');

class ReservationsHasUsersRepository {
  async create(data) {
    return await ReservationsHasUsers.create({
      reservationId: data.reservationId,
      userId: data.userId,
    });
  }

  async findByReservationId(reservationId) {
    return await ReservationsHasUsers.findAll({
      where: { reservationId: reservationId },
      include: { model: User, attributes: ['username'] },
    });
  }

  async deleteByReservationId(reservationId) {
    return await ReservationsHasUsers.destroy({
      where: { reservationId: reservationId },
    });
  }

  async updateReservationUsers(reservationId, userIds) {
    await this.deleteByReservationId(reservationId);

    const creations = userIds.map(userId =>
      this.create({ reservationId: reservationId, userId: userId })
    );

    return Promise.all(creations);
  }

}

module.exports = new ReservationsHasUsersRepository();
