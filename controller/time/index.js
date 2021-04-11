'use strict';

const show = async (req, reply) => {
  console.log(req.body.message.text);
  console.log('time');
  return 'WAITING COMMAND';
};

module.exports = {
  show
};
