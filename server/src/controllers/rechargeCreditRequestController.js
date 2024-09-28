const rechargeCreditRequestService = require('../services/rechargeCreditRequestService');

class RechargeCreditRequestController {
  async getAllRequests(req, res) {
    try {
      const requests = await rechargeCreditRequestService.getAllRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getRequest(req, res) {
    try {
      const { id } = req.params;
      const request = await rechargeCreditRequestService.getRequestById(parseInt(id));
      res.json(request);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async getUserRequests(req, res){
    try {
      const id = req.user.id
      const request = await rechargeCreditRequestService.getRequestsByUserId(id);
      res.json(request);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async createRequest(req, res) {
    try {
      const request = await rechargeCreditRequestService.createRequest(req.body);
      res.status(201).json(request);
    } catch (error) {
      console.log("error: ", error)
      res.status(400).json({ message: error.message });
    }
  }


  async updateRequestStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body; // Assuming you pass id and status in the request body
      const updatedRequest = await rechargeCreditRequestService.updateRechargeRequestStatus(id, status);
      if (updatedRequest) {
        return res.status(200).json({ message: 'Status updated successfully', data: updatedRequest });
      }
      return res.status(404).json({ message: 'Request not found' });
    } catch (error) {
      console.log("errror: ", error)
      return res.status(500).json({ message: error.message });
    }
  }

  async deleteRequest(req, res) {
    try {
      const { id } = req.params;
      await rechargeCreditRequestService.deleteRequest(parseInt(id));
      res.sendStatus(204);
    } catch (error) {
      console.log("del error: ", error)
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new RechargeCreditRequestController();
