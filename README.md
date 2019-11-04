# DM Tool: YouTube Crossfader

A super simple hacky app intended to help GM/DMs to cross fade music/ambient noise from YouTube (not affiliated).

## Disclaimer
This 

## Feature set
- [x] Simple playlist
  - [x] Can add videos from YouTube by URL
  - [x] Can remove videos
- [x] Can cross fade videos by simply chosing a different video in the playlist
- [x] Has adjustable features on how long to fade out
- [x] Can reorder songs
- [ ] If video already queued, have an option to continue the song
- [ ] Autoplays to next video in the playlist


## Usage
- Serve up `src/` using a HTTP server like `python3 -m http.server` (requires Python) or install `http-server` from Node and use that.
- Add videos to the playlist
- Click on a different video in the playlist or allow the current video to finish to autoplay

## Development
### Dependencies/tooling
- [ESlint](https://eslint.org/): linting tool
    - Node 12.x.x and npm 6.10.3

### Installation
- Run `npm install`

## Contributing
Mostly a personal project - won't be actively maintained. If you'd like to use this project and modify it see the licenses below.

## Licenses
See LICENSE.md for this project's license.

