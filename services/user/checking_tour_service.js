'use strict';

const tourChecker = async (req, user, tour) => {
  const TourController = require('../controller/meeting/tour');
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;
  const commandAdminFunctions = {
    'WAITING TOUR DATE': TourController.checkTourName,
    'WAITING DAY': TourController.checkTourDate,
    'WAITING MESSAGE': TourController.checkTourDate,
    'WAITING PLACE': TourController.checkDay,
    'WAITING TIME': TourController.checkDay
  };
  const stateHandler = commandAdminFunctions[user[chatId].state];
  return await stateHandler(user[chatId].command, sentMessage, tour);
};

module.exports = tourChecker;
