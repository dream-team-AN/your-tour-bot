'use strict';

const withoutTime = (dateTime) => {
  const date = new Date(dateTime.getTime());
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const formatDate = (date, reverse) => {
  let dd = date.getDate();
  if (dd < 10) dd = `0${dd}`;

  let mm = date.getMonth() + 1;
  if (mm < 10) mm = `0${mm}`;

  const yy = date.getFullYear();

  return reverse ? `${yy}-${mm}-${dd}` : `${dd}.${mm}.${yy}`;
};

module.exports = {
  withoutTime,
  formatDate
};
