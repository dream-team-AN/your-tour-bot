'use strict';

const validDate = /^([0-9]{4}[-|.][0-9]{2}[-|.][0-9]{2})$/gm;
const validDay = /^[1-9][0-9]?$/gm;
const validTime = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/gm;
const validFullName = /^([А-Я][а-яёії]{1,15}|[A-Z][a-z]{1,15}) ([А-Я][а-яёії]{1,15}|[A-Z][a-z]{1,15})$/gm;

module.exports = {
  validDate, validDay, validFullName, validTime
};
