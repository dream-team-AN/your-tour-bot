'use strict';

const withoutTime = (dateTime) => {
  const date = new Date(dateTime.getTime());
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

module.exports = withoutTime;
