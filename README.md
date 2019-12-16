## porn manager

Manage your ever-growing porn collection

There's a Discord channel now! Join in to the discussion. https://discord.gg/t499hxK

Note: this is by no means finished, but useable.

## Features

- EASY installation (see. [**How to run**](https://github.com/boi123212321/porn-manager#how-to-run))
- Cross-platform (Win, Linux, Mac)
- Works on any somewhat-modern device including tablets and smartphones
- Self hosted, fully open source
- Serves image and video to your device
- Browse, manage & watch scenes
- Browse & manage actors, including actor aliases
- Browse & manage movies
- Browse & manage studios (+ parent studios!)
- Browse, manage & view images
- Label your collection, including sub-labels
  - Automatic label extraction from scene titles & file names
  - Search, filter and sort your collection
  - Rate items, mark as your favorites & bookmark items
- Automatic thumbnail generation on scene import
- Optional password protection in LAN

## Contribute

- Open an issue!
- Discuss!
- Fork & create a new branch, give it the name of your feature you're implementing (e.g. "my-new-feature") & submit a pull request!

## Config

- VIDEO_PATHS: Paths of video files that will be imported - subfolders will be searched recursively
- IMAGE_PATHS: Paths of image files that will be imported - subfolders will be searched recursively
- SCAN_ON_STARTUP: Whether video and image paths should be scanned
- SCAN_INTERVAL: Rescan paths all X milliseconds - only works when SCAN_ON_STARTUP is enabled
- LIBRARY_PATH: Path where the library (.db files & uploaded files & processed images) will be stored (default: working directory)
- FFMPEG_PATH: Where the ffmpeg binary is located; will be placed in working directory when downloading using the setup
- FFPROBE_PATH: Where the ffprobe binary is located; will be placed in working directory when downloading using the setup
- GENERATE_THUMBNAILS: Whether thumbnails should be extracted from imported videos
- THUMBNAIL_INTERVAL: Seconds between thumbnail snapshots in seconds
- PORT: Port server is running on
- APPLY_ACTOR_LABELS: Whether actor labels should be applied to scenes and images the actor is starring in
  - Example: Kali Roses has labels "blonde" & "tattoos". Importing a new video featuring Kali Roses (will be matched if "Kali Roses" is in the video title or path), the newly created scene will automatically inherit "blonde" & "tattoos" + other labels that have been extracted from the title or path.
- APPLY_STUDIO_LABELS: Same as APPLY_ACTOR_LABELS, but for studios
- USE_FUZZY_SEARCH: Use fuzzy search. Fuzzy search decreases search performance, but may forgive misspellings. Disabling fuzzy search approx. halves the search time, which can be helpful on every large collections (5000+) items.
- FUZZINESS: How hard the fuzzy search should be matching; 0 requires a perfect match, while 1 will match everything, effectively turning off the search.
- READ_IMAGES_ON_IMPORT: Read image dimensions/hash on import, will greatly increase import time for a big image library (10000+)
- REMOVE_DANGLING_FILE_REFERENCES: Remove scenes/images from the database that can not be found on disk
- BACKUP_ON_STARTUP: Whether to create a backup when starting the server
- MAX_BACKUP_AMOUNT: Max amount of backups in backups/ folder. Oldest one will be deleted, if max amount has been reached.

## Roadmap

- Image albums
- Recommend similar scenes/actors/images
- visit [Issues](https://github.com/boi123212321/porn-manager/issues) to see what's up

## How to run

- Visit the [Releases](https://github.com/boi123212321/porn-manager/releases) page and download the latest version, for the platform of your choice
- Unzip the file
- Run the application in the terminal of your choice and follow the on-screen instructions
- Once your app is setup you can visit it on http://localhost:3000 (or your LAN IP equivalent) in your web browser of choice

## Build from source

- Install Git (https://git-scm.com/)
- Install Node.js (https://nodejs.org/en/)
- Clone the repository

```
git clone https://github.com/boi123212321/porn-manager.git
```

- Install dependencies

```
npm install
npm install typescript -g
npm install ts-node -g
```

- Build web app dependencies

```
cd app
npm install
```

- Run web app in dev mode

```
npm run serve
```

- Build web app

```
npm run build
```

- Run server in dev mode

```
npm run mon
```

- Run server in release mode

```
npm run build
```

And run the built exe in the release/ folder

## Images

### Scene collection

![Scenes](/doc/img/scene_collection.jpg)

### Scene page

![Scene page](/doc/img/scene_details.jpg)

### Actor collection

![Actors](/doc/img/actor_collection.jpg)

### Actor page

![Actor page](/doc/img/actor_details.jpg)

### Movie collection

![Movies](/doc/img/movie_collection.jpg)

### Movie page

![Movie page](/doc/img/movie_details.jpg)

### Image collection

You can do everything you can do with scenes (e.g. rate/favorite/bookmark/label) with images as well - useful if you run an image collection only.
![Scene details](/doc/img/image_collection.jpg)

### Image details

![Image details](/doc/img/image_details.jpg)

### Studio collection

![Studios](/doc/img/studio_collection.jpg)

### Parent studio

![Studios](/doc/img/parent_studio.jpg)

### Dark mode

![Dark mode](/doc/img/darkmode.jpg)

### Mobile

![Dark mode](/doc/img/mobile.jpg)
