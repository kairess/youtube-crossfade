// eslint-disable-next-line no-unused-vars
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

// eslint-disable-next-line no-unused-vars
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
  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // eslint-disable-next-line no-undef
    removePlaylistId(e.target.dataset.id);
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
  vidP.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.dataset.link = '';
  });
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

  vidBox.appendChild(vidMedia);
  vidItem.append(vidBox);

  return vidItem;
}
