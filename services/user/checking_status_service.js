'use strict';

const isUnregistratedTourist = (user) => user.command === 'tourist' && user.state === 'WAITING COMMAND';

const isWaitingProcessing = (user) => user.state === 'WAITING COMMAND'
                                   && user.command !== 'none'
                                   && user.command !== 'error';

const isAdminCommand = (command) => command === 'Set meeting place'
                                || command === 'Set meeting time'
                                || command === 'Send message';

const isWaitingTourName = (state) => state === 'WAITING TOUR NAME';

module.exports = {
  isUnregistratedTourist,
  isWaitingProcessing,
  isAdminCommand,
  isWaitingTourName
};
