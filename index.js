// variables
const cron        = require("node-cron");
const express     = require("express");
const fs          = require("fs");
const axios       = require('axios');
const moment      = require('moment');

const app         = express();

// Firebase setup
const firebase = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://mosque-c9993.firebaseio.com"
});

// cron job
//schedule tasks to be run on the server 
// run the script every 11:59pm use - 59 23 * * *
//     * * * * * *
//     | | | | | |
//     | | | | | day of week
//     | | | | month
//     | | | day of month
//     | | hour
//     | minute
//     second ( optional )
//
// 10 01 * * * = every 01:01am daily
//  5 * * * *
//

// cron.schedule('* * * * *', () => {
//   console.log('running a task every minute');
// }); 0,30 * * * *
//0 8 * * * every day (including weekdays) at 8am

cron.schedule('*/2 * * * *', () => {
  console.log("---------------------");
  console.log("Running Cron Job");
  // handleFirebase();
  testCronJob();
});

function testCronJob() {
  axios.defaults.headers.common['Authorization'] = 'Basic NzJlYjYxNzAtMTkxOS00ZTAyLWEwMDQtNDQ2ZDUzNmU1NmE1';
    axios.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
    axios.post('https://onesignal.com/api/v1/notifications', {
      app_id: '88a283bb-dcc8-453f-b0ca-1b50df5f07e2',
      include_player_ids: ['ee27ddbc-a639-44d2-a805-19758e13ac1f'],
      send_after: new Date(),
      contents: {
        // 'en': `${type} will be starting in ${60 - moment(setTime).get('minute')} minutues.`
        'en': `Testing Cron jobs`
      },
      headings: {
        'en': 'Wycombe Mosque'
      },
      android_sound: 'notification',
      priority: 10
    }).then(function (response) {
      console.log(response.data);
    }).catch(function (error) {
      console.log(error.response.data);
    });
}

// Get prayer times for each day
function todayNotification() {
  let db = firebase.database();
  const month = new Date().toLocaleString("en-us", { month: "long" });
  const monthDay = new Date().getDate();

  // General Prayers
  let generalRef = db.ref("mosque");
  generalRef.once("value", function(snapshot) {
    snapshot.val().filter(elem => {
      if (elem['monthName'] === month) {
        elem['days'].filter(status => {
          if (Number(status.Date) === monthDay) {
            handleGeneralPrayers(status)
          };
        });
      };
    });
  });

  // site 1
  let site1Ref = db.ref("site1");
  site1Ref.once("value", function(snapshot) {
    snapshot.val()['congregationalPrayers'].filter(elem => {
      if (elem['monthName'] === month) {
        elem['days'].filter(status => {
          if (Number(status.Date) === monthDay) {
            handleSitePrayers(status, 'site_1');
          };
        });
      };
    });
  });

  // site 2
  let site2Ref = db.ref("site2");
  site2Ref.once("value", function(snapshot) {
    snapshot.val()['congregationalPrayers'].filter(elem => {
      if (elem['monthName'] === month) {
        elem['days'].filter(status => {
          if (Number(status.Date) === monthDay) {
            handleSitePrayers(status, 'site_2');
          };
        });
      };
    });
  });

  // // site 3
  // let site3Ref = db.ref("site3");
  // site3Ref.once("value", function(snapshot) {
  //   snapshot.val()['congregationalPrayers'].filter(elem => {
  //     if (elem['monthName'] === month) {
  //       elem['days'].filter(status => {
  //         if (Number(status.Date) === monthDay) {
  //           handleSitePrayers(status, 'site_3');
  //         };
  //       });
  //     };
  //   });
  // });

  // site 4
  // let site4Ref = db.ref("site4");
  // site4Ref.once("value", function(snapshot) {
  //   snapshot.val()['congregationalPrayers'].filter(elem => {
  //     if (elem['monthName'] === month) {
  //       elem['days'].filter(status => {
  //         if (Number(status.Date) === monthDay) {
  //           handleSitePrayers(status, 'site_4');
  //         };
  //       });
  //     };
  //   });
  // });

  // site 5
  // let site5Ref = db.ref("site5");
  // site5Ref.once("value", function(snapshot) {
  //   snapshot.val()['congregationalPrayers'].filter(elem => {
  //     if (elem['monthName'] === month) {
  //       elem['days'].filter(status => {
  //         if (Number(status.Date) === monthDay) {
  //           handleSitePrayers(status, 'site_5');
  //         };
  //       });
  //     };
  //   });
  // });

}

function handleGeneralPrayers(prayerTimes) {
  let db = firebase.database();
  let ref = db.ref("users");
  ref.once("value", function(snapshot) {
    const temp = Object.values(snapshot.val());
    const { general } = temp[0];
    const { prayer_1, prayer_2, prayer_3, prayer_4, prayer_5 } = general;
    if (prayer_1 !== undefined) {
      const playerIds = []
      for (const key of Object.keys(prayer_1)) {
        playerIds.push(prayer_1[key].playerId)
      }
      handleDailyNotification(playerIds, 'Prayer1', prayerTimes);
    }
    if (prayer_2 !== undefined) {
      const playerIds = []
      for (const key of Object.keys(prayer_2)) {
        playerIds.push(prayer_2[key].playerId)
      }
      handleDailyNotification(playerIds, 'Prayer2', prayerTimes);
    }
    if (prayer_3 !== undefined) {
      const playerIds = []
      for (const key of Object.keys(prayer_3)) {
        playerIds.push(prayer_3[key].playerId)
      }
      handleDailyNotification(playerIds, 'Prayer3', prayerTimes);
    }
    if (prayer_4 !== undefined) {
      const playerIds = []
      for (const key of Object.keys(prayer_4)) {
        playerIds.push(prayer_4[key].playerId)
      }
      handleDailyNotification(playerIds, 'Prayer4', prayerTimes);
    }
    if (prayer_5 !== undefined) {
      const playerIds = []
      for (const key of Object.keys(prayer_5)) {
        playerIds.push(prayer_5[key].playerId)
      }
      handleDailyNotification(playerIds, 'Prayer5', prayerTimes);
    }
  });
}

function handleSitePrayers(prayerTimes, site) {
  let db = firebase.database();
  let ref = db.ref("users");
  ref.once("value", function(snapshot) {
    const temp = Object.values(snapshot.val());
    const siteDetails = temp[0][site];
    if (siteDetails !== undefined) {
      const { prayer_1, prayer_2, prayer_3, prayer_4, prayer_5 } = siteDetails;
      if (prayer_1 !== undefined) {
        const playerIds = []; const playerSnooze = [];
        for (const key of Object.keys(prayer_1)) {
          playerIds.push(prayer_1[key].playerId);
          playerSnooze.push(prayer_1[key].snooze)
        }
        handleDailySiteNotification(playerIds, playerSnooze, 'Prayer1', prayerTimes);
      }
      if (prayer_2 !== undefined) {
        const playerIds = []; const playerSnooze = [];
        for (const key of Object.keys(prayer_2)) {
          playerIds.push(prayer_2[key].playerId);
          playerSnooze.push(prayer_2[key].snooze)
        }
        handleDailySiteNotification(playerIds, playerSnooze, 'Prayer2', prayerTimes);
      }
      if (prayer_3 !== undefined) {
        const playerIds = []; const playerSnooze = [];
        for (const key of Object.keys(prayer_3)) {
          playerIds.push(prayer_3[key].playerId);
          playerSnooze.push(prayer_3[key].snooze)
        }
        handleDailySiteNotification(playerIds, playerSnooze, 'Prayer3', prayerTimes);
      }
      if (prayer_4 !== undefined) {
        const playerIds = []; const playerSnooze = [];
        for (const key of Object.keys(prayer_4)) {
          playerIds.push(prayer_4[key].playerId);
          playerSnooze.push(prayer_4[key].snooze)
        }
        handleDailySiteNotification(playerIds, playerSnooze, 'Prayer4', prayerTimes);
      }
      if (prayer_5 !== undefined) {
        const playerIds = []; const playerSnooze = [];
        for (const key of Object.keys(prayer_5)) {
          playerIds.push(prayer_5[key].playerId);
          playerSnooze.push(prayer_5[key].snooze)
        }
        handleDailySiteNotification(playerIds, playerSnooze, 'Prayer5', prayerTimes);
      } 
    }
  });
}

function handleDailyNotification(ids, type, times) {
  const sendTime = times[type];
  let setTime = new Date(new Date().setHours(Number(sendTime.split(":")[0]) + 1, sendTime.split(":")[1]));
  // console.log(setTime + " - " + new Date())
  axios.defaults.headers.common['Authorization'] = 'Basic NzJlYjYxNzAtMTkxOS00ZTAyLWEwMDQtNDQ2ZDUzNmU1NmE1';
  axios.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
  axios.post('https://onesignal.com/api/v1/notifications', {
    app_id: '88a283bb-dcc8-453f-b0ca-1b50df5f07e2',
    include_player_ids: ids,
    send_after: setTime,
    contents: {
      'en': `${type} prayer has started`
    },
    headings: {
      'en': 'Wycombe Mosque'
    },
    android_sound: 'notification',
    priority: 10
  }).then(function (response) {
    console.log(response.data);
  }).catch(function (error) {
    console.log(error.response.data);
  });
}

function handleDailySiteNotification(ids, snooze, type, times) {
  const sendTime = times[type];
  
  ids.forEach((elem, index) => {
    const tempTime = new Date(new Date().setHours(Number(sendTime.split(":")[0]) + 1, sendTime.split(":")[1]));
    const setTime = moment(tempTime).subtract(snooze[index], 'minutes').toISOString();

    axios.defaults.headers.common['Authorization'] = 'Basic NzJlYjYxNzAtMTkxOS00ZTAyLWEwMDQtNDQ2ZDUzNmU1NmE1';
    axios.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
    axios.post('https://onesignal.com/api/v1/notifications', {
      app_id: '88a283bb-dcc8-453f-b0ca-1b50df5f07e2',
      include_player_ids: elem.split(),
      send_after: setTime,
      contents: {
        // 'en': `${type} will be starting in ${60 - moment(setTime).get('minute')} minutues.`
        'en': `${type} will be starting in ${snooze[index]} minutues.`
      },
      headings: {
        'en': 'Wycombe Mosque'
      },
      android_sound: 'notification',
      priority: 10
    }).then(function (response) {
      console.log(response.data);
    }).catch(function (error) {
      console.log(error.response.data);
    });

  });
}



// todayNotification();
// handleFirebase();
// sortUsers();
// check()

app.listen(3128);