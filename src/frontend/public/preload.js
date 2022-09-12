// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge } = require("electron");

// the env vars should be TOKEN and ORG, the last
// 2 vars of the window process env

// Here we use the exposeInMainWorld API to expose the browsers
// and node versions to the main window.  We can use the contextbridge
// to pass in our env vars that can be accessed in the window object in react.
//  For now, this will work, as ipcrenderer seems to throw all sorts of problems
// in react
process.once("loaded", () => {
  contextBridge.exposeInMainWorld('window_env', 
  {
    token: window.process.env.TOKEN,
    org: window.process.env.ORG
  });
});