# Azure Communication Services VoIP POC

This proof-of-concept demonstrates a minimal VoIP calling experience using the **Azure Communication Services (ACS) Calling SDK** for browser-based clients.

## Planning Phase

### Research task
- Validate the latest ACS Calling SDK for JavaScript, along with the token credential flow required for authenticated VoIP calls.

### Implementation tasks
1. **Core SDK setup**: bootstrap a lightweight web application with the ACS Calling SDK and token credential handling.
2. **VoIP call initiation**: allow a user to start a call to another ACS identity.
3. **Call lifecycle handling**: support call state updates, hold, resume, hang up, and incoming call acceptance.
4. **Minimal UI**: provide a clean interface for entering tokens, callee IDs, and controlling the call.

## What’s Included
- **Token-based ACS call agent initialization**
- **Outgoing VoIP call** to another ACS user ID
- **Incoming call accept/reject controls**
- **Call controls** for hold, resume, and hang up
- **Status updates** for call state changes

## Prerequisites
- An Azure Communication Services resource
- Two ACS user identities with access tokens (from your backend or ACS Identity SDK)

## Running the POC

```bash
npm install
npm run dev
```

Navigate to the local dev server (default: `http://localhost:4173`).

## Usage
1. Paste an ACS user access token and optionally a display name.
2. Click **Initialize Call Agent**.
3. Enter the callee’s ACS user ID (e.g. `8:acs:...`).
4. Click **Start Call** to begin a VoIP session.
5. When someone calls you, use **Accept** or **Reject**.
6. Use **Hold**, **Resume**, or **Hang Up** as needed.

## Next Phase (Optional)
- Add number-based PSTN calling by integrating a trusted server component that can issue PSTN-enabled tokens.

> **Note:** ACS Calling SDK requires that tokens are issued by a secure backend service. For this POC, you can manually paste tokens, but production workloads must never expose token generation logic in the browser.
