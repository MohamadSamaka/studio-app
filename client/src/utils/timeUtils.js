import moment from "moment";

function isDateTimePast(date, time) {
    const inputDateTime = moment(
      `${date} ${time}`,
      ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm"],
      true // Strict parsing
    );
    const currentDateTime = moment();
  
    if (!inputDateTime.isValid()) {
      throw new Error("Invalid date or time format. Use YYYY-MM-DD HH:mm:ss or YYYY-MM-DD HH:mm.");
    }
  
    return inputDateTime.isBefore(currentDateTime); // Returns true if the date-time is in the past
  }

export {
    isDateTimePast
}