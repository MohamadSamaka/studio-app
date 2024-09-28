const businessBreakHourService = require('../services/businessBreakHourService');

class BusinessBreakHourController {
  async getAll(req, res) {
    try {
      const breakHours = await businessBreakHourService.getAllBusinessBreakHours();
      res.json(breakHours);
    } catch (error) {
      res.status(500).json({ error: error.message || 'An error occurred while fetching business break hours.' });
    }
  }

  async getById(req, res) {
    try {
      const breakHour = await businessBreakHourService.getBusinessBreakHourById(req.params.id);
      res.json(breakHour);
    } catch (error) {
      res.status(500).json({ error: error.message || `Could not fetch business break hour with id ${req.params.id}` });
    }
  }

  async create(req, res) {
    try {
      const newBreakHour = await businessBreakHourService.createBusinessBreakHour(req.body);
      res.status(201).json(newBreakHour);
    } catch (error) {
      res.status(500).json({ error: error.message || 'Could not create business break hour' });
    }
  }

  async update(req, res) {
    try {
      const updatedBreakHour = await businessBreakHourService.updateBusinessBreakHour(req.params.id, req.body);
      res.json(updatedBreakHour);
    } catch (error) {
      res.status(500).json({ error: error.message || `Could not update business break hour with id ${req.params.id}` });
    }
  }

  async delete(req, res) {
    try {
      const deletedBreakHour = await businessBreakHourService.deleteBusinessBreakHour(req.params.id);
      res.json(deletedBreakHour);
    } catch (error) {
      res.status(500).json({ error: error.message || `Could not delete business break hour with id ${req.params.id}` });
    }
  }
}

module.exports = new BusinessBreakHourController();
