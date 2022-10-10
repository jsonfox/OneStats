# OneStats

![MUI](https://img.shields.io/badge/MUI-%230081CB.svg?style=for-the-badge&logo=mui&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Electron.js](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Riot Games](https://img.shields.io/badge/riotgames-D32936.svg?style=for-the-badge&logo=riotgames&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

**DISCLAIMER**: This is meant to be a development tool, not a production application

React-based Electron.js application scaffolded with Vite designed to fetch and parse bulk match data from the Riot API. All stats besides Games/Wins/Losses are per-match averages.

## Installation

### Windows
1. Download `onestats-windows.zip` from the releases page or by [clicking here](https://github.com/jthefox/OneStats/releases/download/v1.0.0/onestats-windows.zip)
2. Unzip the downloaded archive
3. In the extracted folder, run `OneStats.exe`

### Mac/Linux
1. Clone the repository to your local machine
2. Inside the project, run `npm install`
3. To simply use the application, run `npm start`
4. To create a packaged build for your system, run `npm run aaabuild:mac` or `npm run build:linux` depending on your system

## Mock-up

![Landing page form for app use](/assets/OneStats-form.png)
![Progress page while fetching match data](/assets/OneStats-loading.png)
![Results page with parsed data](/assets/OneStats-results.png)
