'use strict';

const send = async (req, reply) => {
  console.log(req.body.message.text);
  console.log('message');
  return ['WAITING COMMAND'];
};

module.exports = {
  send
};
