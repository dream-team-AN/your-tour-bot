'use strict';

const show = async (message, send) => {
  const helping = `Вы можете управлять мной, отправляя такие команды:
/start - Начало работы
/help - Отобразить список команд с их описанием
/meeting - Посмотреть время и место встречи группы
/time - Узнать текущее время в городе, в котором вы находитесь
/weather - Узнать погоду на сегодня и завтра в городе, в котором вы находитесь
/excursions - Посмотреть список экскурсий, доступных в туре `;
  send(helping, 'none');
  return 'WAITING COMMAND';
};

module.exports = {
  show
};
