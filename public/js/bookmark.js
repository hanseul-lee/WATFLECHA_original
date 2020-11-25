const api_key = '173b78669a3a668e66151ca4a6a82176';

const $userName = document.querySelector('.main__name');
const $popup = document.querySelector('.popup');
const $popupOpen = document.querySelector('.popup__open');
const $openBtn = document.querySelector('.open-btn');
const $closeBtn = document.querySelector('.close-btn');
const $likeBtn = document.querySelector('.like-btn');
const $topBtn = document.querySelector('.top-btn');
const $logoutBtn = document.querySelector('.logout-btn');
const $popupVideo = document.querySelector('.popup__video');
const $main__container__movies = document.querySelector('.main__container__movies');
const $popup__movieName = document.querySelector('.popup__movieName');
const $vote = document.querySelector('.vote');
const $overview = document.querySelector('.overview');
const $releaseDate = document.querySelector('.release-date');
const $genre = document.querySelector('.genre');
const $actors = document.querySelector('.actors');
const $runtime = document.querySelector('.runtime');
const $overlay = document.querySelector('.overlay');
const $search = document.querySelector('.fa-search');
const $header__logo = document.querySelector('.header__logo');
const $heartPopup = document.querySelector('.heartPopup');
let selectedId;
let user = JSON.parse(localStorage.getItem('login'));

// 미 로그인 시 로그인 페이지로 이동
if (!user.curlog) {
  location.assign("/");
}

// 로그인 한 user 이름 표시
$userName.innerHTML = user.name;

// 첫 화면에서 db bookmark 정보 가져와 화면에 렌더링
(async () => {
  try {
    const users = await fetch(`/users/${user.id}`);
    const {bookmarks} = await users.json();
    bookmarks
    .forEach(async movie_id => {
      const url = `https://api.themoviedb.org/3/movie/${movie_id}?api_key=${api_key}&language=ko`;
      const res = await fetch(url);
      const results = await res.json();
      // console.log(results);
      render(results);
    });
  } catch (err) {
    console.log('[ERROR]', err);
  }
})();

const render = (results) => {
  const $li = document.createElement('li');
  $li.id = results.id;
  const $a = document.createElement('a');
  $a.href = '#';
  $a.textContent = results.title;
  const $img = document.createElement('img');
  if (results.poster_path === null) {
    $img.src = '../image/준비중.png';
  } else {
  $img.src = `https://image.tmdb.org/t/p/w500/${results.poster_path}`;
  }
  $a.insertAdjacentElement('afterbegin',$img);
  $li.appendChild($a);
  $main__container__movies.appendChild($li);
}

// <li class='${id}'>
//   <a href="#">
//     <img src=""></img>
//     title
//   </a>
// </li>

const popup = (movie, actors) => {
  $popup__movieName.innerHTML = movie.title;
  $vote.innerHTML = movie.vote_average !== 0 ? `${movie.vote_average} / 10` : '집계중';
  $overview.innerHTML = movie.overview;
  $releaseDate.innerHTML = movie.release_date;
  $genre.innerHTML = movie.genres[0].name;
  $runtime.innerHTML = movie.runtime;
  $actors.innerHTML = actors;
}

//event handler
// 영화 클릭시 popup
$main__container__movies.onclick = async e => {
  if(!e.target.matches('.main__container__movies *')) return;
  selectedId = e.target.parentNode.parentNode.id;
  $popup.style.display = 'block';
  $overlay.style.display = 'block';
  $likeBtn.classList.add('liked');
  $likeBtn.firstElementChild.innerHTML = '찜완료!'

  console.log(e.target);
  try {
    // 영화 API로 popup창 개별 정보 가져오기
    const resMovie = await fetch(`https://api.themoviedb.org/3/movie/${e.target.parentNode.parentNode.id}?api_key=${api_key}&language=ko`);
    const movie = await resMovie.json();
    console.log(movie);

    // 배우 API
    const resActors = await fetch(`https://api.themoviedb.org/3/movie/${e.target.parentNode.parentNode.id}/credits?api_key=${api_key}&language=ko`)
    const mainActors = await resActors.json();
    const actors = mainActors.cast.slice(0,4).map(actor => actor.name).join(', ');
    popup(movie, actors);

    // 예고편 youtube API
    const resVideo = await fetch(`https://api.themoviedb.org/3/movie/${e.target.parentNode.parentNode.id}/videos?api_key=${api_key}`);
    const { results } = await resVideo.json();
    if(results.length !== 0) {
      $popupVideo.innerHTML = `<iframe width="770" height="350" src="https://www.youtube.com/embed/${results[0].key}?" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      } else {
        $popupVideo.innerHTML = `<img src="../image/비디오준비중.jpg">`;
      }
  } catch (err) {
    console.log('[ERROR]', err);
  };
}

// open버튼 클릭 이벤트
$openBtn.onclick = () => {
  document.querySelector('.fa-chevron-down').classList.toggle('active');
  if($popupOpen.clientHeight === 0) {
    $popupOpen.style.height = $popupOpen.scrollHeight + 'px';
  } else {
    $popupOpen.style.height = 0;
  }
}

// close버튼 클릭 이벤트
$closeBtn.onclick = async e => {
  $popup.style.display = 'none';
  document.querySelector('.overlay').style.display = 'none';
  document.querySelector('.fa-chevron-down').classList.remove('active');
  $popupOpen.style.height = 0;
  $likeBtn.firstElementChild.innerHTML = '찜완료!'
  
  const res = await fetch(`/users/${user.id}`);
  const {bookmarks : oldbookmarks} = await res.json();

  // liked 유무에 따른 데이터 db에 반영
  if (!$likeBtn.classList.contains('liked')){
    try {
      const removedNewBookmarks = oldbookmarks.filter(bookmark => bookmark !== selectedId);
      await fetch(`/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json'},
        body: JSON.stringify({bookmarks: removedNewBookmarks})
      })
      $main__container__movies.removeChild(document.getElementById(selectedId));
    } catch (err) {
      console.log('[ERROR]', err);
    };
  } else {
    try {
      if(oldbookmarks.indexOf(selectedId) !== -1) return;
      const addedNewBookmarks = oldbookmarks.concat(selectedId);
      await fetch(`/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json'},
        body: JSON.stringify({bookmarks: addedNewBookmarks})
      })
    } catch (err) {
      console.log('[ERROR]', err);
    };
  }
}

// overlay 클릭 이벤트
$overlay.onclick = async () => {
  $popup.style.display = 'none';
  document.querySelector('.overlay').style.display = 'none';
  document.querySelector('.fa-chevron-down').classList.remove('active');
  $popupOpen.style.height = 0;
  
  const res = await fetch(`/users/${user.id}`);
  const {bookmarks : oldbookmarks} = await res.json();
  
  // liked 유무에 따른 데이터 db에 반영
  if (!$likeBtn.classList.contains('liked')){
    try {
      const removedNewBookmarks = oldbookmarks.filter(bookmark => bookmark !== selectedId);
      await fetch(`/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json'},
        body: JSON.stringify({bookmarks: removedNewBookmarks})
      })
      $main__container__movies.removeChild(document.getElementById(selectedId));
    } catch (err) {
      console.log('[ERROR]', err);
    };
  } else {
    try {
      if(oldbookmarks.indexOf(selectedId) !== -1) return;
      const addedNewBookmarks = oldbookmarks.concat(selectedId);
      await fetch(`/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json'},
        body: JSON.stringify({bookmarks: addedNewBookmarks})
      })
    } catch (err) {
      console.log('[ERROR]', err);
    };
  }
}

// popup에서 하트 클릭시 toggle
$likeBtn.onclick = e => {
  $likeBtn.classList.toggle('liked');
  
  if ($likeBtn.classList.contains('liked')){
    $likeBtn.firstElementChild.innerHTML = `찜완료!`;
    $heartPopup.style.transition = 'all 0.1s';
    $heartPopup.style.opacity = '1';
    $heartPopup.style.zIndex = '300';
    $heartPopup.style.display = 'block';
    
    setTimeout(() => {
      $heartPopup.style.opacity = '0';
      $heartPopup.style.display = 'none';
      $heartPopup.style.transition = 'none';
      $heartPopup.style.zIndex = '-300';
    }, 1000)();
  } else {
    $likeBtn.firstElementChild.innerHTML = '찜하기';
  };
}

// 스크롤 이벤트
$topBtn.onclick = () => {
  window.scroll({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
}

$logoutBtn.onclick = () => {
  localStorage.setItem(
    "login",
    JSON.stringify({
      id: users.id,
      name: users.name,
      genre: users.genre,
      savelog: users.savelog,
      curlog: false
    })
  );
};