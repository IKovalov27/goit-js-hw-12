import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from "axios";

const API_KEY = '39267599-a2b6a157bb946aae617dc629b';

axios.defaults.baseURL = 'https://pixabay.com/api/';

const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const buttonLoadMore = document.querySelector('.load-more');

formEl.addEventListener('submit', onSubmitForm);
buttonLoadMore.addEventListener('click', onBtnLoadMoreClick);

buttonLoadMore.classList.replace('load-more', 'is-hidden');

let queryToFetch = '';
let pageToFetch;
const pageLimit = 40;

const fetchImages = async (queryToFetch, pageToFetch) => {
  const { data } = await axios({
    params: {
      key: API_KEY,
      q: queryToFetch,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: pageLimit,
      page: pageToFetch,
    },
  });
  return data;
};

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const renderImages = data => {
  const markup = data.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a class="photo-link" href="${largeImageURL}"><div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b>${likes}
    </p>
    <p class="info-item">
      <b>Views</b>${views}
    </p>
    <p class="info-item">
      <b>Comments</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>${downloads}
    </p>
  </div>
</div></a>`;
      }
    )
    .join('');
  galleryEl.insertAdjacentHTML('beforeend', markup);
};

const getImages = async (query, pageToFetch) => {
  try {
    
    const data = await fetchImages(query, pageToFetch);
    
    if (!data.hits.length) {
      buttonLoadMore.classList.replace('load-more', 'is-hidden');

      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
      
    renderImages(data);

    lightbox.refresh();

    if (pageToFetch === 1) {
      Notiflix.Notify.success(`Horay! We found ${data.totalHits} images.`);
    }

    if (data.totalHits >= pageToFetch * pageLimit) {
      buttonLoadMore.classList.replace('is-hidden', 'load-more');
    }

    if (data.totalHits <= pageToFetch * pageLimit) {
      buttonLoadMore.classList.replace('load-more', 'is-hidden');

      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results"
      );
    }

  } catch (error) {
    console.log(error);
    Notiflix.Notify.failure('Ooops! Something went wrong!');
  }
};

function onSubmitForm(event) {
  event.preventDefault();
  const query = event.currentTarget.elements.searchQuery.value;
  if (!query.trim() || query === queryToFetch) {
    return;
  }
  queryToFetch = query;
  galleryEl.innerHTML = '';
  pageToFetch = 1;
  getImages(queryToFetch, pageToFetch);
  formEl.reset();
}

function onBtnLoadMoreClick() {
  pageToFetch += 1;
  getImages(queryToFetch, pageToFetch);
}