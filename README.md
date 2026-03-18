# CloakBrowser Manager on Coolify

CloakBrowser Manager is a self-hosted Browser Profile Manager for CloakBrowser. It allows you to create, manage, and launch isolated browser profiles with unique fingerprints. It serves as a free, self-hosted alternative to solutions like Multilogin, GoLogin, and AdsPower.

This repository provides a ready-to-use Docker Compose template to deploy CloakBrowser Manager on **Coolify v4**.

## Features at a Glance
- **Isolated Profiles:** Each profile has its own fingerprint, proxy, cookies, and session data.
- **Session Persistence:** Data survives across restarts.
- **Web UI & API:** Manage everything through a built-in web interface or via an Automation API (Playwright/Puppeteer).
- **VNC Viewer:** Watch and interact with running profiles directly in your browser.

---

## Deployment Guide for Coolify

The easiest way to deploy this on Coolify is by connecting this public Git repository directly.

### 1. Create a New Resource in Coolify
1. Log in to your Coolify v4 dashboard.
2. Navigate to your desired Project and Environment.
3. Click **+ New Resource**.
4. Select **Public Repository** as the deployment source.

### 2. Configure the Repository
1. In the **Repository URL** field, enter:
   ```text
   https://github.com/essamamdani/coolify-cloakbrowser-manager
   ```
2. Coolify will fetch and parse the repository. 
3. Select **Docker Compose** as the build pack.
4. Coolify will automatically detect the `docker-compose.yaml` file. If asked to confirm the file path, verify it is set to `/docker-compose.yaml`.
5. Click **Save**.

### 3. Retrieve Your Auto-Generated Password
The template uses Coolify's magic variables (`${SERVICE_PASSWORD_CLOAKBROWSER}`) to automatically generate a secure authentication token for you.

1. Navigate to the **Environment Variables** tab for your new service.
2. Look for `AUTH_TOKEN` in the list. Coolify has already populated it with a secure, random password!
3. Click the "reveal" (eye) icon next to the value to see your generated password. You will need this to log into the dashboard later.
4. If you prefer, you can change it to your own custom password and click **Save**.

### 4. Setup Domains & Networking
Thanks to the included `SERVICE_URL_CLOAKBROWSER_8080` magic environment variable, Coolify will automatically map your server's wildcard domain to this container on port `8080`.
1. Go to the **Settings** or **General** tab of the `cloakbrowser-manager` service.
2. Locate the **Domains** field. You will see that a domain has already been generated for you automatically!
3. You can leave it as-is, or modify it if you have a custom domain (e.g., `https://manager.yourdomain.com`). Coolify handles the routing.

### 5. Deploy
1. Click the **Deploy** button at the top right.
2. Wait for Coolify to pull the image and start the container.
3. Once the deployment is green and the health check passes, visit your configured domain (e.g., `https://manager.yourdomain.com`).
4. Enter your `AUTH_TOKEN` on the login screen to access the dashboard.

---

## Automating Profiles (Playwright / Puppeteer)

Once deployed, you can connect automation scripts to your live profiles remotely. The manager exposes a CDP (Chrome DevTools Protocol) endpoint.

*Note: Since your instance is protected by an `AUTH_TOKEN`, you must include it in your connection string or headers when automating remotely, depending on the library's support for authenticated WebSockets, or use the connection string provided in the UI.*

### Playwright Example (Python)
```python
from playwright.async_api import async_playwright

async with async_playwright() as pw:
    # Replace with your actual domain and profile ID
    browser = await pw.chromium.connect_over_cdp(
        "wss://manager.yourdomain.com/api/profiles/<profile-id>/cdp?token=YOUR_AUTH_TOKEN"
    )
    page = browser.contexts[0].pages[0]
    await page.goto("https://example.com")
```

## Data Persistence & Updates
- **Storage:** All your browser profiles, cookies, and local storage data are saved in the `cloakprofiles` Docker volume automatically managed by Coolify. 
- **Updating:** To update to the latest version, click **Deploy** again in Coolify. It will pull the latest code from this repository and restart the container without losing your data.
