const availabilityExceptionRepository = require('../repositories/availabilityExceptionRepository');
const availabilityExceptionBreaksRepository = require('../repositories/availabilityExceptionBreaksRepository');
const { sequelize } = require('../models');


class AvailabilityExceptionService {
  async getAllAvailabilityExceptions() {
    return availabilityExceptionRepository.findAll();
  }

  async getAvailabilityExceptionById(id) {
    return availabilityExceptionRepository.findById(id);
  }

  // async createAvailabilityException(data) {
  //   return availabilityExceptionRepository.create(data); // Single exception
  // }
  async createAvailabilityException(data) {
    const transaction = await sequelize.transaction();

  try {
    // Validate required fields
    console.log("recieved data: ", data)

    const { date, start_time, end_time, breaks, is_closed } = data;
    if (!is_closed && (!date || !start_time || !end_time)) {
      throw new Error('Missing required fields: date, start_time, or end_time');
    }

    if (breaks && !Array.isArray(breaks)) {
      throw new Error('Breaks should be an array of break objects');
    }

    // Create availabilityException with nested breaks
    const availabilityException = await availabilityExceptionRepository.create(data, transaction);
    await transaction.commit();
    return availabilityException;

  } catch (error) {
    await transaction.rollback();
    console.error('Service error while creating availability exception:', error);
    throw new Error('An error occurred while creating the availability exception.');
  }
}
  

  
  async createMultipleExceptions(dataArray) {
    const transaction = await sequelize.transaction();
    try {
      const exceptions = await availabilityExceptionRepository.bulkCreate(dataArray, transaction);
      await transaction.commit();
      return exceptions;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }


  async updateAvailabilityException(id, data) {
  const transaction = await sequelize.transaction();

  try {
    // Update the AvailabilityException
    const { AvailabilityExceptionBreaks, ...exceptionData } = data;

    await availabilityExceptionRepository.update(id, exceptionData);

    // Find existing breaks for this AvailabilityException
    const existingBreaks = await availabilityExceptionBreaksRepository.findByAvailabilityExceptionId(id);
    // const existingBreaks = await AvailabilityExceptionBreaksRepository.findByAvailabilityExceptionId(id);

    // Prepare break IDs for deletion (breaks that no longer exist in the request)
    const existingBreakIds = existingBreaks.map(breakItem => breakItem.id);
    const newBreakIds = AvailabilityExceptionBreaks.map(breakItem => breakItem.id).filter(Boolean); // Filter out new breaks (without id)
    
    const breaksToDelete = existingBreakIds.filter(existingId => !newBreakIds.includes(existingId));

    // Delete removed breaks
    for (let breakId of breaksToDelete) {
      await availabilityExceptionBreaksRepository.delete(breakId);
      // await AvailabilityExceptionBreaksRepository.delete(breakId);
    }

    // Update existing breaks
    for (let breakItem of AvailabilityExceptionBreaks) {
      if (breakItem.id) {
        // Update existing break
        await availabilityExceptionBreaksRepository.update(breakItem.id, breakItem);
      } else {
        // Create new break (no id)
        await availabilityExceptionBreaksRepository.create({
          ...breakItem,
          availability_exception_id: id, // Associate with the AvailabilityException
        });
      }
    }

    // Commit the transaction after all operations
    await transaction.commit();
    console.log('AvailabilityException and breaks updated successfully');
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating AvailabilityException with breaks:', error);
    throw error;
  }
}

async upsertAvailabilityException(data) {
  const transaction = await sequelize.transaction();

  try {
    const { date, AvailabilityExceptionBreaks, ...exceptionData } = data;

    // Check if an exception already exists for the given date
    const existingException = await availabilityExceptionRepository.findByDate(date);

    if (existingException) {
      // If it exists, delete the exception (this will automatically delete associated breaks)
      console.log(`AvailabilityException for date ${date} exists, deleting...`);
      await availabilityExceptionRepository.delete(existingException.id);
    }

    // Create a new AvailabilityException with its breaks in one step
    await availabilityExceptionRepository.create(
      {
        date, 
        ...exceptionData,
        AvailabilityExceptionBreaks, // Create the breaks along with the exception
      },
      {
        include: [{ model: AvailabilityExceptionBreaks }] // Ensure breaks are included in the creation
      }
    );

    // Commit the transaction
    await transaction.commit();
    console.log('AvailabilityException and breaks successfully created/updated');
  } catch (error) {
    await transaction.rollback();
    console.error('Error upserting AvailabilityException:', error);
    throw error;
  }
}




  async deleteAvailabilityException(id) {
    return availabilityExceptionRepository.delete(id);
  }
  
  async findByDate(date) {
    try {
        const availabilityException = await availabilityExceptionRepository.findByDate(date);
        return availabilityException;
    } catch (error) {
        console.error('Error in AvailabilityExceptionService.findByDate:', error);
        throw new Error('Failed to retrieve availability exception.');
    }
}
}

module.exports = new AvailabilityExceptionService();
