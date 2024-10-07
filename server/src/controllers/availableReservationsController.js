const availableReservationService = require("../services/availableReservationService");

class ReservationController {
  async createReservationSlot(req, res) {
    const { reservationData } = req.body;
    try {
      if (!reservationData) throw new Error("Validate your sent data!");
      const reservation =
        await availableReservationService.createReservationSlot(
          reservationData
        );
      res.status(200).json(reservation);
    } catch (error) {
      if (error.errors && error.errors[0]?.type === "unique violation")
        return res
          .status(409)
          .json({ error: "This Reservation already exists" });
      res.status(500).json({ error: error.message });
    }
  }

  async getReservations(req, res) {
    try {
      const organizedReservations =
        await availableReservationService.getAllReservations();
      res.status(200).json(organizedReservations);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to fetch reservations" });
    }
  }

  async getUserReservations(req, res) {
    try {
      const requestedUserId = req.user.id;

      const reservations =
        await availableReservationService.getReservationsByUserId(
          requestedUserId
        );
      // console.log("reservations: ", reservations)
      return res.status(200).json(reservations);
    } catch (error) {
      console.error("Error fetching reservations for user:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch reservations for user due to a server error.",
      });
    }
  }

  async getOrganizedReservationsByDateAndTime(req, res) {
    try {
      const username = req.user.username
      const organizedReservations =
        await availableReservationService.getOrganizedReservationsByDateAndTime(username);
      res.status(200).json(organizedReservations);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to fetch organized reservations" });
    }
  }

  async getPaginatedReservationsByDateAndTime(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        dateSingle,
        dateStart,
        dateEnd,
        timeSingle,
        timeStart,
        timeEnd,
      } = req.query;
      console.log({
        page,
        limit,
        search,
        dateSingle,
        dateStart,
        dateEnd,
        timeSingle,
        timeStart,
        timeEnd,
      });
      // Construct filter objects
      const dateFilter = {};
      if (dateSingle) {
        dateFilter.single = dateSingle;
      } else if (dateStart && dateEnd) {
        dateFilter.start = dateStart;
        dateFilter.end = dateEnd;
      }

      const timeFilter = {};
      if (timeSingle) {
        timeFilter.single = timeSingle;
      } else if (timeStart && timeEnd) {
        timeFilter.start = timeStart;
        timeFilter.end = timeEnd;
      }

      const organizedReservations =
        await availableReservationService.getPaginatedReservationsByDateAndTime(
          parseInt(page, 10),
          parseInt(limit, 10),
          search,
          dateFilter,
          timeFilter
        );
      res.status(200).json(organizedReservations);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to fetch organized reservations" });
    }
  }

  async getReservationById(req, res) {
    try {
      const reservation = await availableReservationService.getReservationById(
        req.params.id
      );
      if (req.user.role.name === "Admin") {
        res.json(reservation);
      } else {
        res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async bookReservation(req, res) {
    try {
      // Ensure the reservation is always created for the logged-in user
      const { reservationId } = req.body;
      const userId = req.user.id
      console.log("reservationId: ", reservationId)
      console.log("userId: ", userId)

      const reservation = await availableReservationService.bookReservation(
        reservationId,
        userId
      );
      res.json(reservation);
    } catch (error) {
      console.log("error: ", error);
      res.status(500).json({ message: error.message });
    }
  }

  async updateReservation(req, res) {
    try {
      const reservation = await availableReservationService.getReservationById(
        req.params.id
      );
      if (
        req.user.role.name === "Admin" ||
        reservation.userId === req.user.id
      ) {
        const updatedReservation =
          await availableReservationService.updateReservation(
            req.params.id,
            req.body
          );
        res.json(updatedReservation);
      } else {
        res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteReservation(req, res) {
    const currentUserId = req.user.id; // Get current user ID
    const userRole = req.user.Role.name.toLowerCase();
    const { id, userId: targetUserIdParam } = req.params; // Reservation ID and optional target user ID
    const targetUserId = targetUserIdParam || req.body.userId || currentUserId; // User ID to remove

    try {
      await availableReservationService.deleteReservation(
        id,
        currentUserId,
        userRole,
        targetUserId
      );
      return res
        .status(200)
        .json({ message: "Reservation updated successfully" });
    } catch (error) {
      console.error("Error in deleteReservation:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  async removeUserFromReservation(req, res) {
    const userRole = req.user.Role.name.toLowerCase();
    const { id, userId } = req.params; // Reservation ID and user ID to remove
    console.log("id : ", id)
    console.log("userId : ", userId)

    try {
      await availableReservationService.removeUserFromReservation(
        id,
        userId,
        userRole
      );
      return res
        .status(200)
        .json({ message: "User removed from reservation successfully" });
    } catch (error) {
      console.error("Error in removeUserFromReservation:", error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ReservationController();
