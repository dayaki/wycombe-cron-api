// variables
const cron = require("node-cron");
const express = require("express");
const fs = require("fs");
const axios = require('axios');
app = express();

// Firebase setup
const firebase = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://mosque-c9993.firebaseio.com"
});

// cron job
// schedule tasks to be run on the server  59 23 * * *
// cron.schedule("* * * * *", function() {
//   console.log("---------------------");
//   console.log("Running Cron Job");
//   handleFirebase();
// });

const handleFirebase = () => {
  let db = firebase.database();
  let ref = db.ref("mosque");
  ref.once("value", function(snapshot) {
    const month = new Date().toLocaleString("en-us", { month: "long" });
    const monthDay = new Date().getDate();

    snapshot.val().filter(elem => {
      if (elem['monthName'] === month) {
        elem['days'].filter(status => {
          if (Number(status.Date) === monthDay) {
            handleData(status);
          };
        });
      };
    });
  });
}

const sortUsers = ()  => {
  let db = firebase.database();
  let ref = db.ref("users");
  ref.once("value", function(snapshot) {
    const temp = Object.values(snapshot.val());
    const { site_1, site_2, site_3, site_4, site_5 } = temp[0];
    if (site_1 !== undefined) {
      const playerIds = []
      for (const key of Object.keys(site_1)) {
        playerIds.push(site_1[key]['playerId'])
      }
      sortSitePrayers(playerIds, 'site1')
    }
    // if (site_2 !== undefined) {
    //   const playerIds = []
    //   for (const key of Object.keys(site_2)) {
    //     playerIds.push(site_2[key]['playerId'])
    //   }
    //   sortSitePrayers(playerIds, 'site2')
    // }
    // if (site_3 !== undefined) {
    //   const playerIds = []
    //   for (const key of Object.keys(site_3)) {
    //     playerIds.push(site_3[key]['playerId'])
    //   }
    //   sortSitePrayers(playerIds, 'site3')
    // }
    // if (site_4 !== undefined) {
    //   const playerIds = []
    //   for (const key of Object.keys(site_4)) {
    //     playerIds.push(site_4[key]['playerId'])
    //   }
    //   sortSitePrayers(playerIds, 'site4')
    // }
    // if (site_5 !== undefined) {
    //   const playerIds = []
    //   for (const key of Object.keys(site_5)) {
    //     playerIds.push(site_5[key]['playerId'])
    //   }
    //   sortSitePrayers(playerIds, 'site5')
    // }
  });
}

sortSitePrayers = (users, site) => {
  const month = new Date().toLocaleString("en-us", { month: "long" });
  const monthDay = new Date().getDate();

  let db1 = firebase.database();
  let ref1 = db1.ref(site);
  ref1.once("value", function(snapshot) {
    snapshot.val()['congregationalPrayers'].filter(elem => {
      if (elem['monthName'] === month) {
        elem['days'].filter(status => {
          if (Number(status.Date) === monthDay) {
            prepareSiteNotification(site, users, status);
          };
        });
      };
    });
  });
}

const handleData = (dates) => {
  // console.log(dates)
  sendNotification(dates.Sunrise, 'Sunrise Prayer');
  sendNotification(dates.Prayer1, 'Prayer 1');
  sendNotification(dates.Prayer2, 'Prayer 2');
  sendNotification(dates.Prayer3, 'Prayer 3');
  sendNotification(dates.Prayer4, 'Prayer 4');
  sendNotification(dates.Prayer5, 'Prayer 5');
}

const sendNotification = (date, type) => {
  // console.log(date)
  //const setTime = new Date(new Date().setHours(Number(date.split(":")[0]), date.split(":")[1])).toUTCString();
  // let setTime = new Date(new Date().setHours(21, 10)).toString();
  //console.log(setTime)
  // console.log(new Date(new Date().setHours(Number(date.split(":")[0]) + 1, date.split(":")[1])))

  axios.defaults.headers.common['Authorization'] = 'Basic NzJlYjYxNzAtMTkxOS00ZTAyLWEwMDQtNDQ2ZDUzNmU1NmE1';
  axios.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
  axios.post('https://onesignal.com/api/v1/notifications', {
    app_id: '88a283bb-dcc8-453f-b0ca-1b50df5f07e2',
    included_segments: ['General Prayers'],
    send_after: new Date(new Date().setHours(Number(date.split(":")[0]) + 1, date.split(":")[1])),
    // send_after: new Date(),
    contents: {
      'en': type  + ' has started!!!.'
    },
    headings: {
      'en': 'Wycombe Mosque'
    },
    android_sound: 'notification',
    priority: 10
  }).then(function (response) {
    console.log(response.data);
  }).catch(function (error) {
    console.log(error);
  });
}

const prepareSiteNotification = (site, users, times) => {
  const time = Object.values(times).slice(1);
  time.forEach(time => sendSiteNotification(users, time))
}

const sendSiteNotification = (users, time) => {
  let setTime = new Date(new Date().setHours(Number(time.split(":")[0]) + 1, time.split(":")[1]));

  axios.defaults.headers.common['Authorization'] = 'Basic NzJlYjYxNzAtMTkxOS00ZTAyLWEwMDQtNDQ2ZDUzNmU1NmE1';
  axios.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
  axios.post('https://onesignal.com/api/v1/notifications', {
    app_id: '88a283bb-dcc8-453f-b0ca-1b50df5f07e2',
    include_player_ids: users,
    send_after: setTime,
    contents: {
      'en': 'Site prayer has started.'
    },
    headings: {
      'en': 'Wycombe Mosque'
    },
    android_sound: 'notification',
    priority: 10
  }).then(function (response) {
    console.log(response.data);
  }).catch(function (error) {
    console.log(error);
  });
}

// function check() {
//   axios.defaults.headers.common['Authorization'] = 'Basic NzJlYjYxNzAtMTkxOS00ZTAyLWEwMDQtNDQ2ZDUzNmU1NmE1';
//   axios.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
//   axios.get('https://onesignal.com/api/v1/notifications/e16fe2b0-e385-4a84-a192-8038c8c5f889?app_id=88a283bb-dcc8-453f-b0ca-1b50df5f07e2')
//   .then(function (response) {
//     // handle success
//     console.log(response.data);
//   })
//   .catch(function (error) {
//     // handle error
//     console.log(error);
//   })
//   .then(function () {
//     // always executed
//   });
// }

handleFirebase();
// sortUsers();
// check()

app.listen(3128);