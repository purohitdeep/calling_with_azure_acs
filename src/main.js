import { CallClient } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import "./styles.css";

const tokenInput = document.querySelector("#token");
const displayNameInput = document.querySelector("#displayName");
const calleeInput = document.querySelector("#calleeId");
const initAgentButton = document.querySelector("#initAgent");
const startCallButton = document.querySelector("#startCall");
const holdCallButton = document.querySelector("#holdCall");
const resumeCallButton = document.querySelector("#resumeCall");
const endCallButton = document.querySelector("#endCall");
const acceptCallButton = document.querySelector("#acceptCall");
const rejectCallButton = document.querySelector("#rejectCall");
const incomingText = document.querySelector("#incomingText");
const statusText = document.querySelector("#statusText");

let callClient;
let callAgent;
let currentCall;
let incomingCall;

const setStatus = (message) => {
  statusText.textContent = message;
};

const setIncomingCallControls = ({ canAccept, canReject, label }) => {
  acceptCallButton.disabled = !canAccept;
  rejectCallButton.disabled = !canReject;
  incomingText.textContent = label;
};

const setCallControls = ({ canStart, canHold, canResume, canEnd }) => {
  startCallButton.disabled = !canStart;
  holdCallButton.disabled = !canHold;
  resumeCallButton.disabled = !canResume;
  endCallButton.disabled = !canEnd;
};

const setAgentReady = (ready) => {
  startCallButton.disabled = !ready;
  initAgentButton.disabled = ready;
};

const resetCall = () => {
  currentCall = undefined;
  setCallControls({ canStart: !!callAgent, canHold: false, canResume: false, canEnd: false });
};

const resetIncomingCall = () => {
  incomingCall = undefined;
  setIncomingCallControls({ canAccept: false, canReject: false, label: "No incoming call." });
};

const ensureCallClient = () => {
  if (!callClient) {
    callClient = new CallClient();
  }
  return callClient;
};

const ensureAgent = async () => {
  const token = tokenInput.value.trim();
  if (!token) {
    setStatus("Provide an ACS user access token before initializing the agent.");
    return;
  }

  try {
    const credential = new AzureCommunicationTokenCredential(token);
    const client = ensureCallClient();
    callAgent = await client.createCallAgent(credential, {
      displayName: displayNameInput.value.trim() || undefined
    });

    const deviceManager = await client.getDeviceManager();
    await deviceManager.askDevicePermission({ audio: true });

    callAgent.on("incomingCall", (event) => {
      incomingCall = event.incomingCall;
      const callerId = incomingCall.callerInfo?.identifier?.communicationUserId ?? "Unknown caller";
      setIncomingCallControls({
        canAccept: true,
        canReject: true,
        label: `Incoming call from ${callerId}.`
      });
      setStatus("Incoming call received. Accept or reject it.");
    });

    setAgentReady(true);
    setStatus("Call agent initialized. Ready to place a call.");
  } catch (error) {
    console.error(error);
    setStatus(`Failed to initialize call agent: ${error.message}`);
  }
};

const startCall = () => {
  if (!callAgent) {
    setStatus("Initialize the call agent first.");
    return;
  }

  const calleeId = calleeInput.value.trim();
  if (!calleeId) {
    setStatus("Provide a callee ACS user ID to start a call.");
    return;
  }

  currentCall = callAgent.startCall([{ communicationUserId: calleeId }]);
  setStatus("Calling...");
  setCallControls({ canStart: false, canHold: true, canResume: false, canEnd: true });

  currentCall.on("stateChanged", () => {
    setStatus(`Call state: ${currentCall.state}`);

    if (currentCall.state === "Connected") {
      setCallControls({ canStart: false, canHold: true, canResume: false, canEnd: true });
    }

    if (currentCall.state === "Disconnected") {
      setStatus("Call ended.");
      resetCall();
    }
  });
};

const acceptIncomingCall = async () => {
  if (!incomingCall) {
    setStatus("No incoming call to accept.");
    return;
  }

  try {
    currentCall = await incomingCall.accept();
    resetIncomingCall();
    setStatus("Incoming call accepted.");
    setCallControls({ canStart: false, canHold: true, canResume: false, canEnd: true });

    currentCall.on("stateChanged", () => {
      setStatus(`Call state: ${currentCall.state}`);

      if (currentCall.state === "Disconnected") {
        setStatus("Call ended.");
        resetCall();
      }
    });
  } catch (error) {
    console.error(error);
    setStatus(`Unable to accept call: ${error.message}`);
  }
};

const rejectIncomingCall = async () => {
  if (!incomingCall) {
    setStatus("No incoming call to reject.");
    return;
  }

  try {
    await incomingCall.reject();
    setStatus("Incoming call rejected.");
  } catch (error) {
    console.error(error);
    setStatus(`Unable to reject call: ${error.message}`);
  } finally {
    resetIncomingCall();
  }
};

const holdCall = async () => {
  if (!currentCall) {
    setStatus("No active call to hold.");
    return;
  }

  try {
    await currentCall.hold();
    setCallControls({ canStart: false, canHold: false, canResume: true, canEnd: true });
    setStatus("Call on hold.");
  } catch (error) {
    console.error(error);
    setStatus(`Unable to hold call: ${error.message}`);
  }
};

const resumeCall = async () => {
  if (!currentCall) {
    setStatus("No held call to resume.");
    return;
  }

  try {
    await currentCall.resume();
    setCallControls({ canStart: false, canHold: true, canResume: false, canEnd: true });
    setStatus("Call resumed.");
  } catch (error) {
    console.error(error);
    setStatus(`Unable to resume call: ${error.message}`);
  }
};

const endCall = async () => {
  if (!currentCall) {
    setStatus("No active call to hang up.");
    return;
  }

  try {
    await currentCall.hangUp({ forEveryone: false });
  } catch (error) {
    console.error(error);
    setStatus(`Unable to hang up: ${error.message}`);
  } finally {
    resetCall();
    setStatus("Call ended.");
  }
};

initAgentButton.addEventListener("click", ensureAgent);
startCallButton.addEventListener("click", startCall);
acceptCallButton.addEventListener("click", acceptIncomingCall);
rejectCallButton.addEventListener("click", rejectIncomingCall);
holdCallButton.addEventListener("click", holdCall);
resumeCallButton.addEventListener("click", resumeCall);
endCallButton.addEventListener("click", endCall);

setCallControls({ canStart: false, canHold: false, canResume: false, canEnd: false });
setIncomingCallControls({ canAccept: false, canReject: false, label: "No incoming call." });
setAgentReady(false);
