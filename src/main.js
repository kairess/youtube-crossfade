let player1;
let player2;

let active = 0;

let metaplayer;
let playlistSort = null;

let faderTick = null;

const FIDELITY_MS = 500;
const MAX_VOLUME = 100;
const STORAGE_DOMAIN = 'ycf__playlist';

let crossFade1 = false;
let crossFade2 = false;
let isFading = false;


function savePlaylist(playlist) {
  localStorage.setItem(STORAGE_DOMAIN, JSON.stringify(playlist));
}

function savePlaylistOrder(playlist) {
  localStorage.setItem(`${STORAGE_DOMAIN}_order`, JSON.stringify(playlist));
}

function createSortable(list) {
  if (playlistSort !== null) return;

  playlistSort = Sortable.create(list, {
    group: `${STORAGE_DOMAIN}_order`,
    store: {
      get: (sortable) => {
        const order = localStorage.getItem(sortable.options.group.name);
        return order ? JSON.parse(order) : [];
      },
      /**
       * Save the order of elements. Called onEnd (when the item is dropped).
       * @param {Sortable}  sortable
       */
      set: (sortable) => {
        const order = sortable.toArray();
        localStorage.setItem(sortable.options.group.name, JSON.stringify(order));
      },
    },
  });
}


function loadPlaylistOrder() {
  let playlist;
  const playlistJson = localStorage.getItem(`${STORAGE_DOMAIN}_order`);

  if (playlistJson !== null) {
    playlist = JSON.parse(playlistJson);
  } else {
    playlist = [];
  }

  return playlist;
}

function loadPlaylist() {
  let playlist;
  const playlistJson = localStorage.getItem(STORAGE_DOMAIN);

  if (playlistJson !== null) {
    playlist = JSON.parse(playlistJson);
  } else {
    playlist = [];
  }

  return playlist;
}

function renderActiveVideoMark(inactiveId, activeId) {
  document.getElementById(`player${activeId}`).parentElement.querySelector('.player__caption').innerText = `▶ Player ${activeId}`;
  document.getElementById(`player${inactiveId}`).parentElement.querySelector('.player__caption').innerText = `⏸ Player ${inactiveId}`;
}

function doCrossFade(to, strength) {
  if (!crossFade1 || !crossFade2) return;

  const pTo = to === 1 ? player1 : player2;
  const pFrom = to === 1 ? player2 : player1;


  let pToNewVolume = pTo.getVolume();
  pToNewVolume = Math.min(pToNewVolume + strength, MAX_VOLUME);
  pTo.setVolume(pToNewVolume);

  let pFromNewVolume = pFrom.getVolume();
  pFromNewVolume = Math.max(pFromNewVolume - strength, 0);
  pFrom.setVolume(pFromNewVolume);

  // eslint-disable-next-line no-console
  console.debug(`Fading to player ${to}: (⬇${pFromNewVolume}|⬆${pToNewVolume})`);

  if (pFromNewVolume === 0) {
    if (pToNewVolume === MAX_VOLUME) {
      isFading = false;
      pFrom.pauseVideo();

      renderActiveVideoMark(to === 1 ? 2 : 1, to);
      clearInterval(faderTick);
    }
  }
}


function crossFadeTo(to) {
  const crossFadeStrength = document.getElementById('crossfade__slider').value;
  const eachTick = (crossFadeStrength * 1000) / FIDELITY_MS;
  isFading = true;

  faderTick = setInterval(() => doCrossFade(to, MAX_VOLUME / eachTick), FIDELITY_MS);
}


function playVideo(id) {
  if (isFading) {
    clearInterval(faderTick);
    // eslint-disable-next-line no-console
    console.warn('Was fading already but starting again 🌵');
  }

  // Check the automagic stop
  const startFromZero = document.getElementById('beginning__checkbox').checked;

  // First time playing - no cross fade
  if (active === 0) {
    if (startFromZero) {
      player1.loadVideoById(id, 0);
      player1.seekTo(0);
    } else {
      player1.loadVideoById(id);
    }

    player1.setVolume(100);
    active = 1;
  } else if (active === 1) {
    if (startFromZero) {
      player2.loadVideoById(id);
      player2.seekTo(0);
    } else {
      player2.loadVideoById(id);
    }

    player2.setVolume(0);
    crossFadeTo(2);
    active = 2;
  } else if (active === 2) {
    if (startFromZero) {
      player1.loadVideoById(id, 0);
      player1.seekTo(0);
    } else {
      player1.loadVideoById(id);
    }

    player1.setVolume(0);
    crossFadeTo(1);
    active = 1;
  }

  player1.playVideo();
  player2.playVideo();
}


function clearRenderedPlaylist() {
  const list = document.getElementById('playlist__list');
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  const placeholder = document.createElement('p');
  placeholder.id = 'playlist__list--placeholder';
  placeholder.innerText = 'No songs yet 🤷‍♀️';
  list.appendChild(placeholder);
}

function getVideoId(url) {
  return new URL(url).searchParams.get('v');
}

function removePlaylistId(id) {
  const playlist = loadPlaylist();
  const playlistOrder = loadPlaylistOrder();
  const sortedPlaylist = [];

  playlistOrder.forEach((index) => {
    if (index !== id) {
      sortedPlaylist.push(playlist[index]);
    }
  });

  // Reset order to be an array from 0 to length of playlist
  savePlaylistOrder(Array.from({ length: sortedPlaylist.length }, (_, i) => i.toString()));
  savePlaylist(sortedPlaylist);
}

function createPlaylistItem(videoId, title, duration, author, index) {
  const vidItem = document.createElement('li');
  vidItem.classList.add('playlist__listitem');
  vidItem.setAttribute('data-id', index);
  vidItem.setAttribute('data-link', videoId);

  const vidBox = document.createElement('div');
  vidBox.className = 'tile box';

  const vidMedia = document.createElement('article');
  vidMedia.classList.add('media', 'playlist__media');

  const vidMediaLeft = document.createElement('article');
  vidMediaLeft.className = 'media-left';

  const vidMediaRight = document.createElement('div');
  vidMediaRight.className = 'media-right';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete';
  deleteBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    removePlaylistId(event.target.closest('.playlist__listitem').dataset.id);
    // eslint-disable-next-line no-use-before-define
    renderPlaylist();
  });

  const vidFigure = document.createElement('figure');
  vidFigure.classList.add('image');

  const vidThumbnail = document.createElement('img');
  vidThumbnail.src = `https://img.youtube.com/vi/${videoId}/default.jpg`;
  vidThumbnail.alt = `Thumbnail for the video named '${title}'`;

  vidFigure.appendChild(vidThumbnail);
  vidMediaLeft.appendChild(vidFigure);
  vidMediaRight.appendChild(deleteBtn);

  // Content
  const vidMediaContent = document.createElement('div');
  vidMediaContent.className = 'media-content';

  const vidContent = document.createElement('div');
  vidContent.className = 'content';

  const vidP = document.createElement('p');
  vidP.classList.add('has-text-weight-medium');
  vidP.innerText = title;
  vidP.appendChild(document.createElement('br'));

  const vidSmallText = document.createElement('small');
  vidSmallText.classList.add('has-text-grey', 'has-text-weight-normal');
  vidSmallText.innerText = `📷 ${author} ⏳ ${new Date(duration * 1000).toISOString().substr(11, 8)} 🆔 ${videoId} `;

  vidP.appendChild(vidSmallText);
  vidContent.appendChild(vidP);
  vidMediaContent.appendChild(vidContent);

  vidMedia.appendChild(vidMediaLeft);
  vidMedia.appendChild(vidMediaContent);
  vidMedia.appendChild(vidMediaRight);

  vidBox.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    playVideo(event.target.closest('.playlist__listitem').dataset.link);
  });

  vidBox.appendChild(vidMedia);
  vidItem.append(vidBox);

  return vidItem;
}


function renderPlaylist() {
  clearRenderedPlaylist();
  const playlist = loadPlaylist();
  const playlistOrder = loadPlaylistOrder();

  const list = document.getElementById('playlist__list');
  const frag = new DocumentFragment();

  playlistOrder.forEach((n) => {
    const video = playlist[parseInt(n, 10)];
    const vidItem = createPlaylistItem(video.id, video.title,
      video.duration, video.author,
      parseInt(n, 10));
    frag.appendChild(vidItem);
  });

  list.appendChild(frag);

  createSortable(list);
}


function pushVideoMetadata(metadata) {
  if (metadata !== null
    && metadata.video_id !== ''
    && metadata.title !== ''
    && metadata.author !== ''
    && metadata.duration !== null) {
    const playlist = loadPlaylist();
    const playlistOrder = loadPlaylistOrder();
    playlistOrder.push(playlist.length.toString());
    savePlaylistOrder(playlistOrder);

    playlist.push({
      id: metadata.video_id,
      title: metadata.title,
      duration: metadata.duration,
      author: metadata.author,
    });

    savePlaylist(playlist);
    renderPlaylist();
  }
}

function getVideoMetadata(videoId) {
  metaplayer.loadVideoById(videoId);
  metaplayer.setVolume(0);
}


function addPlaylistUrl() {
  const urlInput = document.getElementById('playlist__input--add-url');
  getVideoMetadata(getVideoId(urlInput.value));

  urlInput.value = '';
}


// eslint-disable-next-line no-unused-vars
function onYouTubeIframeAPIReady() {
  player1 = new YT.Player('player1', {
    height: '240',
    width: '380',
    events: {
      onStateChange: (event) => {
        // playing
        if (event.data === 1) {
          crossFade1 = true;
          player1.unMute();
        } else {
          crossFade1 = false;
        }
      },
    },
  });

  player2 = new YT.Player('player2', {
    height: '240',
    width: '380',
    events: {
      onStateChange: (event) => {
        // playing
        if (event.data === 1) {
          player2.unMute();
          crossFade2 = true;
        } else {
          crossFade2 = false;
        }
      },
    },
  });

  metaplayer = new YT.Player('_metaplayer', {
    height: '240',
    width: '380',
    events: {
      onStateChange: (event) => {
        if (event.data === -1) {
          pushVideoMetadata({
            duration: metaplayer.getDuration(),
            ...metaplayer.getVideoData(),
          });
        }
      },
    },
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line no-console
  console.log('%c🌵', 'font-size:30px');
  document.getElementById('playlist__form--add-url').addEventListener('submit', (event) => {
    event.preventDefault();
    addPlaylistUrl();
    renderPlaylist();
  });

  renderPlaylist();
});
