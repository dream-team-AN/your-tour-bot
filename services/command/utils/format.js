'use strict';

const formatDate = (date) => {
  let dd = date.getDate();
  if (dd < 10) dd = `0${dd}`;

  let mm = date.getMonth() + 1;
  if (mm < 10) mm = `0${mm}`;

  const yy = date.getFullYear();

  return `${dd}.${mm}.${yy}`;
};

module.exports = formatDate;
