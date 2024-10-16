const businessHourService = require('../services/businessHourService');

class BusinessHourController {
  async getBusinessCalendar(req, res) {
    try {
        // const calendarData = await businessHourService.getBusinessCalender();
        const calendarData = await businessHourService.getCalendarData();
        res.status(200).json(calendarData);
    } catch (error) {
      console.log(error)
        res.status(500).json({ error: 'An error occurred while fetching business hours.' });
    }
  }
  
  async getBusinessHours(req, res) {
    try {
      const hours = await businessHourService.getAllBusinessHours();
      res.json(hours);
    } catch (error) {
      console.error('Error fetching business hours:', error);
      res.status(500).json({ message: 'An error occurred while fetching business hours.' });
    }
  }

  async createBusinessHour(req, res) {
    try {
      const hour = await businessHourService.createBusinessHour(req.body);
      res.status(201).json(hour);
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async updateBusinessHourById(req, res) {
    const { id } = req.params;
    try {
      const hour = await businessHourService.updateBusinessHour(parseInt(id), req.body);
      if (!hour) {
        return res.status(404).json({ message: 'Business hour not found.' });
      }
      res.json(hour);
    } catch (error) {
      console.error(`Error updating business hour with ID ${id}:`, error);
      res.status(500).json({ message: 'An error occurred while updating the business hour.' });
    }
  }


  async updateBusinessHourByDateOfWeek(req, res) {
    const { dayOfWeek } = req.params; // Accept `day_of_week` from the request parameters
    try {
      const hour = await businessHourService.updateBusinessHour(dayOfWeek, req.body);
      if (!hour) {
        return res.status(404).json({ message: `Business hour for ${dayOfWeek} not found.` });
      }
      res.json(hour);
    } catch (error) {
      console.error(`Error updating business hour for ${dayOfWeek}:`, error);
      res.status(500).json({ message: `An error occurred while updating business hours for ${dayOfWeek}.` });
    }
  }

  async deleteBusinessHourById(req, res) {
    const { id } = req.params;
    try {
      const result = await businessHourService.deleteBusinessHourById(parseInt(id));
      if (result === 0) {
        return res.status(404).json({ message: 'Business hour not found.' });
      }
      res.sendStatus(204); // 204 No Content
    } catch (error) {
      console.error(`Error deleting business hour with ID ${id}:`, error);
      res.status(500).json({ message: 'An error occurred while deleting the business hour.' });
    }
  }
  async deleteBusinessHourByDateOfWeek(req, res) {
    const { dayOfWeek } = req.params;
    try {
      const result = await businessHourService.deleteBusinessHourByWeek(dayOfWeek);
      
      // Return success
      res.sendStatus(204); // 204 No Content
    } catch (error) {
      console.error(`Error deleting business hour for ${dayOfWeek}:`, error);
      
      // Return the appropriate error response
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new BusinessHourController();
