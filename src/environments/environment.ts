// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyB8X1uymOu-tBJfvXgfOM1kOAXwV5t0FM4",
    authDomain: "time-pomodoro.firebaseapp.com",
    databaseURL: "https://time-pomodoro.firebaseio.com",
    projectId: "time-pomodoro",
    storageBucket: "time-pomodoro.appspot.com",
    messagingSenderId: "1013565129781"
  }
};
