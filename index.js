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

  // site 3
  let site3Ref = db.ref("site3");
  site3Ref.once("value", function(snapshot) {
    snapshot.val()['congregationalPrayers'].filter(elem => {
      if (elem['monthName'] === month) {
        elem['days'].filter(status => {
          if (Number(status.Date) === monthDay) {
            handleSitePrayers(status, 'site_3');
          };
        });
      };
    });
  });

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
        const playerIds = []
        for (const key of Object.keys(prayer_1)) {
          playerIds.push(prayer_1[key].playerId)
        }
        handleDailySiteNotification(playerIds, 'Prayer1', prayerTimes);
      }
      if (prayer_2 !== undefined) {
        const playerIds = []
        for (const key of Object.keys(prayer_2)) {
          playerIds.push(prayer_2[key].playerId)
        }
        handleDailySiteNotification(playerIds, 'Prayer2', prayerTimes);
      }
      if (prayer_3 !== undefined) {
        const playerIds = []
        for (const key of Object.keys(prayer_3)) {
          playerIds.push(prayer_3[key].playerId)
        }
        handleDailySiteNotification(playerIds, 'Prayer3', prayerTimes);
      }
      if (prayer_4 !== undefined) {
        const playerIds = []
        for (const key of Object.keys(prayer_4)) {
          playerIds.push(prayer_4[key].playerId)
        }
        handleDailySiteNotification(playerIds, 'Prayer4', prayerTimes);
      }
      if (prayer_5 !== undefined) {
        const playerIds = []
        for (const key of Object.keys(prayer_5)) {
          playerIds.push(prayer_5[key].playerId)
        }
        handleDailySiteNotification(playerIds, 'Prayer5', prayerTimes);
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

function handleDailySiteNotification(ids, type, times) {
  const sendTime = times[type];
  const setTime = new Date(new Date().setHours(Number(sendTime.split(":")[0]) + 1, sendTime.split(":")[1]));

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



todayNotification();
// handleFirebase();
// sortUsers();
// check()

app.listen(3128);