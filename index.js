const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const app = express();
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
//load config
dotenv.config({ path: "./config/config.env" });
let var_arr = ["Refresh the browser to see your events"];



// handlebars
app.engine(
  ".hbs",
  exphbs({
    defaultLayout: "main",
    extname: ".hbs",
  })
);

app.set("view engine", ".hbs");

//static folder
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", (req, res) => {
  const tkn = req.body.token;


  // If modifying these scopes, delete token.json.
  const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  const TOKEN_PATH = "token.json";

  // Load client secrets from a local file.
  fs.readFile("credentials.json", (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);
    // Authorize a client with credentials, then call the Google Calendar API.
    authorize(JSON.parse(content), listEvents);
  });

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  function getAccessToken(oAuth2Client, callback) {
    //   const authUrl = oAuth2Client.generateAuthUrl({
    //     access_type: 'offline',
    //     scope: SCOPES,
    //   });
    //   console.log('Authorize this app by visiting this url:', authUrl);
    //   const rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout,
    //   });

    oAuth2Client.getToken(tkn, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  }

  /**
   * Lists the next 10 events on the user's primary calendar.
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  function listEvents(auth) {
    async  function fun() {
      const calendar =  google.calendar({ version: "v3", auth });
      calendar.events.list(
        {
          calendarId: "primary",
          timeMin: new Date().toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: "startTime",
        },
        (err, res) => {
          if (err) return console.log("The API returned an error: " + err);
          const events = res.data.items;
          if (events.length) {
            console.log("Upcoming 10 events:", events);
            events.map((event, i) => {
              //   const start = event.start.dateTime || event.start.date;
              var_arr.push(event);
            });
          } else {
            console.log("No upcoming events found.");
          }
        }
      );
    }
    fun();
  }
  res.send(var_arr);
  res.render("index");
});

// const eventStartTime = new Date()

// eventStartTime.setDate(eventStartTime.getDay() + 4)

// const eventEndTime= new Date()
// eventEndTime.setDate(eventEndTime.getDay() + 4)
// eventEndTime.setMinutes(eventEndTime.getMinutes() + 45)

// const event ={
//     summary : 'Interview with Busbus',
//     location:'344 Herbert Macaulay Way, Yaba 101245, Lagos',
//     description :"Meeting with Ayo to talk about my skills and experience in coding",
//     start:{
//         dateTime: eventStartTime,
//         timeZone: 'America/Denver'
//     },
//     end:{
//         dateTime: eventEndTime,
//         timeZone: 'America/Denver'
//     },
//     colorId:1
// }

// calender.freebusy.query({
//     resource:{
//         timeMin:eventStartTime,
//         timeMax  :eventEndTime,
//         timeZone: 'America/Denver',
//         items:[{id:'primary'}]
//     }
// },(err,res)=>{
//     if(err){
//      return   console.error('free busy query error: ',err)
//     }
//     const events = res.data.calendars.primary.busy
//     if (events.length === 0) {
//         return calender.events.insert({calendarId:'primary', resource: event},(err)=>{
//             if(err){
//                 return   console.error('calendar creation  error: ',err)
//                }
//                return console.log('calendar event created')
//         })
//     }

//     return console.log('sorry i am busy')
// })

// app.post("/events", (req, res) => {
//   const { OAuth2 } = google.auth;
//   const oAuth2Client = new OAuth2();
//   oAuth2Client.setCredentials({
//     refresh_token: refresh_token,
//   });

//   const calender = google.calendar({ version: "v3", auth: oAuth2Client });
//   const eventStartTime = new Date();

//   eventStartTime.setDate(eventStartTime.getDay() + 4);

//   const eventEndTime = new Date();
//   eventEndTime.setDate(eventEndTime.getDay() + 4);
//   eventEndTime.setMinutes(eventEndTime.getMinutes() + 45);
  
//   const event ={
//         summary : req.body.summary,
//         location:'344 Herbert Macaulay Way, Yaba 101245, Lagos',
//         description :req.body.description,
//         start:{
//             dateTime: eventStartTime
//         },
//         end:{
//             dateTime: eventEndTime
//         },
//         colorId:6
//     }
    
    
//     calender.freebusy.query({
//             resource:{
//                 timeMin:eventStartTime,
//                 timeMax  :eventEndTime,
//                 timeZone: 'America/Denver',
//                 items:[{id:'primary'}]
//             }
//         },(err,res)=>{
//             if(err){
//              return   console.error('free busy query error: ',err)
//             }
//             const events = res.data.calendars.primary.busy
//             if (events.length === 0) {
//                 return calender.events.insert({calendarId:'primary', resource: event},(err)=>{
//                     if(err){
//                         return   console.error('calendar creation  error: ',err)
//                        }
//                        return console.log('calendar event created')
//                 })
//             }
        
//             return console.log('sorry i am busy')
//         })
    
    
// });

const port =  process.env.PORT || 3000

app.listen(port, () => {
  console.log("Server started on port "+ port);
});
