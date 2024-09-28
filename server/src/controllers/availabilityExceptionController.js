const availabilityExceptionService = require('../services/availabilityExceptionService');
const availabilityExceptionRepository = require('../repositories/availabilityExceptionRepository');

class AvailabilityExceptionController {
  async getAvailabilityExceptions(req, res) {
    try {
      // Retrieve exceptions
      const exceptions = await availabilityExceptionService.getAllAvailabilityExceptions();
  
      // Convert to plain objects and potentially modify data
      const modifiedExceptions = exceptions.map((exception) => {
        try {
          const exceptionData = exception.toJSON(); // Convert Sequelize instance to plain object
  
          if (exceptionData.is_closed) {
            const { start_time, end_time, ...rest } = exceptionData;
            return rest;
          }
          return exceptionData;
        } catch (error) {
          console.error(`Error converting exception with ID ${exception.id}`, error);
          // You can choose to return a default object or handle the error differently here
          return {}; 
        }
      });
  
      res.json(modifiedExceptions);
    } catch (error) {
      console.error("Error retrieving availability exceptions:", error);
      res.status(500).json({ error: 'An error occurred while retrieving availability exceptions.' });
    }
  }


  async createAvailabilityException(req, res) {
    try {
      const data = req.body;
      let exception;

      // Check if data is an array (i.e., multiple exceptions)
      if (Array.isArray(data)) {
        exception = await availabilityExceptionService.createMultipleExceptions(data);
      } else {
        exception = await availabilityExceptionService.createAvailabilityException(data);
      }


      res.json(exception);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while creating the availability exception(s).' });
    }
  }


  async updateAvailabilityException(req, res) {
    try {
      const { id } = req.params;
      const exception = await availabilityExceptionService.updateAvailabilityException(parseInt(id), req.body);
      res.json(exception);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while updating the availability exception.' });
    }
  }

  async deleteAvailabilityException(req, res) {
    const { id } = req.params;
    try {
      await availabilityExceptionRepository.delete(id)
      res.status(200).json({ message: 'Availability exception deleted successfully.' });
    }
    catch (error) {
      console.log(error)
      res.status(400).json({ message: error });
    }
  }
}


module.exports = new AvailabilityExceptionController();
