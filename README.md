## [Your-tour telegram bot](https://t.me/@YooourTourBot) 🚍🌍


### What is Your-tour bot ❓

We will create a little helper for our clients - a telegram bot.

Why is Telegram? Most of the people who choose the bus tour are young people. This is more difficult for elders to endure long journeys in a seated position, very fast pace of excursions, night walks and lack of sleep. But young people put it off with a bang, they will not even notice how the 8 hours of the bus ride fly by.

When you buy a bus tour the most often doubts arise due to the fact that it is not known in which hotel you will stay for the night or how friendly the guide will come across. We've fixed that. Now you are the one who decides everything! After registering for the tour, about a week before the start, the bot will send you a quiz: in which hotel you would like to stay (the quiz is anonymous, of course), and which guide you would like to see. This way you can read hotel reviews, see photos and make a decision. The same situation is with the guide.

After the start of the tour, the assistant will always be with you, tell you the schedule of the day, at what place and at what time the general meeting, remind you of it with an alert, and give you weather data. Whatever you are late, the telegram bot will send you notifications 1 hour, 30 minutes and 15 minutes before the scheduled meeting time. With him you will always be in the know and save yourself from unnecessary worries.

During the tour, many varied and informative excursions await you, but what if you don't know which one to choose? The bot is happy to help you. It will provide you with a very detailed description of the excursion.

Our bot will always be with you, so less worry and more vivid impressions 😉

### Available commands ✔

▶ /start <br>
Greetings, request to choose are you tourist or admin.<br>
#### Then in 1nd case:
Request to enter a name -> checking the presence of a name in the database -> if the person is in the database, then the definition of the purchased tour, otherwise the bot will recommend contacting the travel agency office and stop its work.<br>
#### Or in 2nd case:
Login as administrator, the bot asks for a password, if entered correctly the bot displays a list of possible actions:<br>
🔹 Send message: the bot asks what you want to send (for example, a vote), the name of the tour and the date to determine which users to send it to.<br>
🔹 Set meeting time: the bot asks for the time, day of the tour, name and date of its start.<br>
🔹 Set meeting place: the bot asks for the place, day of the tour, name and start date.<br>
press button "I am admin"<br>
▶ /help <br>
Output of all commands with their description.<br>
▶ /meeting <br>
The bot will display the time, the meeting place, which will be marked on the google map and how to get to it.<br>
▶ /excursions <br>
The bot will display a list of excursions, when you click on the name, it will display the description of the excursion.<br>
▶ /time <br>
The bot will display the time for the city where you are.<br>
▶ /weather <br>
The bot will display the weather (for today and tomorrow) for the city where you are.<br>

### How it works ❓

When registering a user, the bot checks the presence of his full name in the travel agency database. If a match is found, the work will continue.

The user can view the time and place of the meeting (will be displayed using static maps from Google), which will be stored in a separate info file. Also, the user can see the route to the destination (created using the Directions Google API service). The tourist will receive notifications about the approaching time of meeting with the guide, which are generated using the Node Schedule technology (a flexible task scheduler like Cron).

A person can get detailed information about excursions(what awaits you, date, meeting point, price), which is parsed from the site https://experience.tripster.ru/. First, the user is given the opportunity to select the city in which he wants to see the excursions (only the cities that are on the tour are displayed; and only those excursions that can be booked on the day the tourist is in the selected city are displayed).

A tourist can see the current time in the city in which he is located (it will be calculated based on the data received from weather api. As well as the weather for today and tomorrow.

Our bot has an administrator mode for travel agency employees. To enter this mode, you must enter the same password for all. When trying to send a message, the bot first checks the compliance of the person's name with the tour and the date entered by the admin. When a match is found, the bot takes the chat ID from the variable with the data of the bot users. And after that it sends a message. Also, the administrator can set the time and place of the meeting, which are saved in the info file. The admin will set the meeting place by choosing from several available options.

Since the bot will be launched on a free plan, when used on long polling, problems may arise with constant requests to telegrams for updates, which is of course unacceptable for the comfortable work of the assistant bot. Therefore, it becomes necessary to receive updates in a smarter way - a webhook. Another plus is that all applications hosted on Heroku are hosted on a sub-domain and automatically receive the SLL certificate required to configure the webhook. Fastify will be used as a web server.

### Technologies 💻

⏹ Google Maps. It will be used to help the user get to the meeting point.<br>
⏹ Weather API. It will tell the tourist what is the exact time and weather in the city in which he is located. <br>
⏹ Node Schedule<br>
⏹ MongoDB<br>
⏹ Fastify<br>  
⏹ JsDOM
