async function run(tab) {
  const target = { tabId: tab.id };
  await promisify(chrome.debugger.attach)(target, "1.1");

  const sendCommand = promisify(chrome.debugger.sendCommand);
  await sendCommand(target, "Network.enable");
  await sendCommand(target, "Network.setCacheDisabled", {
    cacheDisabled: true,
  });
  await sendCommand(target, "Network.emulateNetworkConditions", {
    offline: false,
    latency: 2000,
    downloadThroughput: 188743,
    uploadThroughput: 40320,
    connectionType: "cellular3g",
  });
  await sendCommand(target, "Emulation.setCPUThrottlingRate", {
    rate: 4,
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !/\/localhost[:/]/i.test(tab.url)) {
    return;
  }
  run(tab);
});

function promisify(fn) {
  return (...args) =>
    new Promise((resolve, reject) => {
      fn(...args, (...result) => {
        if (chrome.runtime.lastError) {
          console.log("heheheh", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        }
        resolve(result);
      });
    });
}
