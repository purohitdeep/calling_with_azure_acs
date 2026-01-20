# Azure Communication Services VoIP POC

This proof-of-concept demonstrates a minimal VoIP calling experience using the **Azure Communication Services (ACS) Calling SDK** for browser-based clients.


## Azure Setup Instructions

Follow these step-by-step instructions to create the required Azure Communication Services resources and generate access tokens needed for the VoIP calling functionality.

### Prerequisites for Azure Setup

- An Azure account with an active subscription. [Create an account for free](https://azure.microsoft.com/free/) if you don't have one.
- Azure CLI installed on your local machine. [Download and install Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli).

### Step 1: Create an Azure Communication Services Resource

1. Sign in to the [Azure portal](https://portal.azure.com/).

2. In the upper-left corner of the page, select **+ Create a resource**.

3. Search for "Communication Services" and select it from the results.

4. Click **Create**.

5. Configure your Communication Services resource:
   - **Subscription**: Select your Azure subscription.
   - **Resource group**: Create a new resource group or select an existing one.
   - **Resource name**: Enter a unique name for your Communication Services resource.
   - **Region**: Choose the geographic region closest to your users.

6. Optionally, assign tags to organize your Azure resources.

7. Review your configuration and click **Create**. Deployment takes a few minutes.

### Step 2: Get Your Connection String

1. After deployment completes, navigate to your Communication Services resource in the Azure portal.

2. In the left menu, select **Keys** under the **Settings** section.

3. Copy the **Connection string** (either Primary or Secondary key). You'll need this for generating access tokens.

### Step 3: Install Azure Communication Services CLI Extension

Open a terminal and run the following command to add the Communication Services extension:

```bash
az extension add --name communication
```

### Step 4: Sign in to Azure CLI

Sign in to Azure CLI using your Azure account credentials:

```bash
az login
```

Follow the prompts to authenticate.

### Step 5: Create User Identities and Access Tokens

For VoIP calling, you need at least two user identities with access tokens. Run these commands to create them:

#### Create First User Identity and Token

```bash
az communication identity token issue --scope voip --connection-string "<your-connection-string>"
```

Replace `<your-connection-string>` with the connection string you copied in Step 2.

This command will output:
- `identity`: The user ID (e.g., `8:acs:...`)
- `token`: The access token
- `expiresOn`: Token expiration date

#### Create Second User Identity and Token

Repeat the command to create a second user:

```bash
az communication identity token issue --scope voip --connection-string "<your-connection-string>"
```

### Step 6: Store Your Tokens Securely

**Important Security Note**: For production applications, access tokens should be generated server-side and never exposed in browser code. For this POC demonstration:

1. Save the generated user IDs and tokens in a secure location.
2. You'll need these tokens when running the application (paste them into the UI).
3. Tokens expire after 24 hours by default - regenerate them when needed.

### Alternative: Create Identity First, Then Issue Token

If you prefer to create identities separately:

```bash
# Create identity
az communication identity user create --connection-string "<your-connection-string>"

# Issue token for existing identity
az communication identity token issue --scope voip --user "<user-id>" --connection-string "<your-connection-string>"
```

### Optional: Environment Variables (Recommended for Development)

Instead of passing the connection string in each command, you can set it as an environment variable:

**Windows:**
```cmd
setx AZURE_COMMUNICATION_CONNECTION_STRING "<your-connection-string>"
```

**macOS/Linux:**
```bash
export AZURE_COMMUNICATION_CONNECTION_STRING="<your-connection-string>"
```

Then you can omit `--connection-string` from the commands.

### Troubleshooting

- **Permission Issues**: Ensure your Azure account has the necessary permissions to create Communication Services resources.
- **Region Availability**: Some features may not be available in all Azure regions.
- **Token Expiration**: Access tokens are short-lived. Monitor the `expiresOn` field and regenerate as needed.
- **CLI Issues**: Make sure you're using the latest version of Azure CLI and the Communication Services extension.



## What’s Included
- **Token-based ACS call agent initialization**
- **Outgoing VoIP call** to another ACS user ID
- **Incoming call accept/reject controls**
- **Call controls** for hold, resume, and hang up
- **Status updates** for call state changes

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