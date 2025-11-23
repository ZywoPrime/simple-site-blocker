⚠️ **Copyright © 2025 Daniel Aistrop**  
> ⚖️ This project is **All Rights Reserved**.  
> You may view the code, but you may not copy, modify, reuse, or redistribute it.

# 📵 Simple Site Blocker

![Extension Type](https://img.shields.io/badge/Browser%20Extension-Manifest%20V3-4f46e5)  
![Privacy](https://img.shields.io/badge/Privacy-Local%20only%2C%20no%20tracking-22c55e)  
![Status](https://img.shields.io/badge/Status-Personal%20project-64748b)  
![Built For](https://img.shields.io/badge/Built%20for-Edge%20%26%20Chrome-0ea5e9)

A clean, privacy-friendly browser extension for blocking distracting websites using simple patterns or regular expressions.

Simple Site Blocker helps you stay focused by instantly redirecting blocked sites to a friendly, dark-mode-optimized reminder page.  
It stores **no data outside your browser** and never makes network requests — everything runs 100% locally.

---

## ✨ Features

- **Block any site** using simple text patterns  
- **Redirects** to a custom dark-mode “blocked” page  
- **Live preview** showing what each pattern will match  
- **Regex support** via the `re:` prefix  
- **Import / Export** your block list  
- **Auto-updates rules in real time** as you edit  
- **Zero defaults** — you choose exactly what to block  
- **Private, offline, and fast**  

---

## 🛠 How It Works

Simple Site Blocker uses the browser’s  
**Declarative Net Request (DNR)** engine to intercept page loads.

If a URL matches one of your patterns:

1. The request is **redirected** to `blocked.html`  
2. You see a friendly “You blocked this site” reminder  
3. A single click opens your block list for editing  

No network calls, no scripts injected into websites, and no background polling.

---

## 📝 Adding Blocked Sites

Open:

**Settings → Extensions → Simple Site Blocker → Extension options**

Then enter **one pattern per line**.

### ✓ Full domain  
Blocks any URL containing this domain:
```
example.com
```

### ✓ Partial match  
Blocks any URL containing the text:
```
example
```

### ✓ Regular expression (advanced)  
Use the prefix `re:`:
```
re:^https?://(www\.)?example\.net/.*
```

Changes take effect instantly.

---

## 🔍 Example Patterns

```
news
social
gaming
helloWorld.com
re:^https://(www\.)?example\.net/.*
```

---

## ⚠ Troubleshooting — If a site still loads

Sometimes browsers reuse cached pages, which bypass blocking momentarily.

Try:

1. Refresh the page  
2. Open the site in a **new window**  
3. Clear that site’s **cookies/cache**  
4. Wait a moment — DNR rules apply asynchronously on startup  

---

## 🔒 Privacy

- No analytics  
- No tracking  
- No external network calls  
- No remote servers  
- All data is stored locally  
- Only minimal permissions are required  

---

## 📁 File Structure

```
simple-site-blocker/
│
├── manifest.json
├── LICENSE
├── README.md
│
├── assets/
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── simple-site-blocker.svg
│
├── pages/
│   ├── blocked.html
│   ├── options.html
│   └── popup.html
│
└── src/
    ├── background.js
    ├── blocked.js
    ├── options.js
    └── popup.js
```

---

## 📦 Installation (Developer Mode)

1. Download or clone this repository  
2. Open your browser’s extensions page  
   - **Edge:** `edge://extensions`  
   - **Chrome:** `chrome://extensions`  
3. Enable **Developer Mode**  
4. Click **Load unpacked**  
5. Select the extension folder  

---

## 💬 Feedback & Improvements

Feel free to open an issue if you have suggestions or ideas.  
This project aims to stay simple, elegant, and fully user-controlled.

