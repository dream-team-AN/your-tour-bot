'use strict';

const show = async (req, send) => {
  const helping = `Ты можешь управлять мной, отправляя такие команды: \n
/start - Начало работы \r
/help - Отобразить список команд с их описанием \r
/meeting - Посмотреть время и место встречи группы \r
/time - Узнать текущее время в городе, в котором вы находитесь \r
/weather - Узнать погоду на сегодня и завтра в городе, в котором вы находитесь \r
/excursions - Посмотреть список экскурсий, доступных в туре `;
  send(helping, 'none');
  return 'WAITING COMMAND';
};

module.exports = {
  show
};
