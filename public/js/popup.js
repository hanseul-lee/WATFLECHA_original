const api_key = "173b78669a3a668e66151ca4a6a82176";

const $main__container__movies = document.querySelector(".main");
const $main__name = document.querySelector(".main__name");
const $popup = document.querySelector(".popup");
const $popupOpen = document.querySelector(".popup__open");
const $openBtn = document.querySelector(".open-btn");
const $closeBtn = document.querySelector(".close-btn");
const $likeBtn = document.querySelector(".like-btn");
const $topBtn = document.querySelector(".top-btn");
const $moreBtn = document.querySelector(".more-btn");
const $popupVideo = document.querySelector(".popup__video");
const $result__movies = document.querySelector(".result__movies");
const $popup__movieName = document.querySelector(".popup__movieName");
const $vote = document.querySelector(".vote");
const $overview = document.querySelector(".overview");
const $releaseDate = document.querySelector(".release-date");
const $genre = document.querySelector(".genre");
const $actors = document.querySelector(".actors");
const $runtime = document.querySelector(".runtime");
const $overlay = document.querySelector(".overlay");
const $search = document.querySelector(".search-btn-top");
const $header__logo = document.querySelector(".header__logo");
const $heartPopup = document.querySelector(".heartPopup");

const localUser = JSON.parse(localStorage.getItem("login"));
let selectedId;
let getBookmarks;

const popup = (movie, actors) => {
  if (selectedId) $popup__movieName.innerHTML = movie.title;
  $vote.innerHTML =
    movie.vote_average !== 0 ? `${movie.vote_average} / 10` : "집계중";
  $overview.innerHTML = movie.overview;
  $releaseDate.innerHTML = movie.release_date;
  $genre.innerHTML = movie.genres[0].name;
  $runtime.innerHTML = movie.runtime;
  $actors.innerHTML = actors;

  if (getBookmarks.indexOf(selectedId) !== -1) {
    $likeBtn.firstElementChild.innerHTML = `찜완료!`;
    $likeBtn.classList.add("liked");
  } else {
    $likeBtn.firstElementChild.innerHTML = `찜하기`;
    $likeBtn.classList.remove("liked");
  }
};

const modifyBookMarks = async () => {
  const patchBookmarks = $likeBtn.classList.contains("liked")
    ? getBookmarks
        .filter((movieId) => movieId !== selectedId)
        .concat(selectedId)
    : getBookmarks.filter((movieId) => movieId !== selectedId);
  try {
    const patchLi = await fetch(`/users/${localUser.id}`, {
      method: "PATCH",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({
        bookmarks: patchBookmarks,
      }),
    });
    const { bookmarks } = await patchLi.json();
    getBookmarks = bookmarks;
    $popupVigideo.innerHTML = "";
  } catch (err) {
    console.log("[ERROR]", err);
  }
};

// open버튼 클릭 이벤트
$openBtn.onclick = () => {
  document.querySelector(".fa-chevron-down").classList.toggle("active");
  if ($popupOpen.clientHeight === 0) {
    $popupOpen.style.height = $popupOpen.scrollHeight + "px";
  } else {
    $popupOpen.style.height = 0;
  }
};

// popup창 클릭 이벤트
$main__container__movies.onclick = async (e) => {
  if (!e.target.matches("li *")) return;
  if (e.target.parentNode.matches("a")) e.preventDefault();
  selectedId = e.target.parentNode.parentNode.id;
  $popup.style.display = "block";
  $overlay.style.display = "block";
  try {
    // 영화 API로 popup창 개별 정보 가져오기
    const resMovie = await fetch(
      `https://api.themoviedb.org/3/movie/${selectedId}?api_key=${api_key}&language=ko`
    );
    const movie = await resMovie.json();

    // 배우 API
    const resActors = await fetch(
      `https://api.themoviedb.org/3/movie/${selectedId}/credits?api_key=${api_key}&language=ko`
    );
    const mainActors = await resActors.json();
    const actors = mainActors.cast
      .slice(0, 4)
      .map((actor) => actor.name)
      .join(", ");
    popup(movie, actors);

    // 예고편 youtube API
    const resVideo = await fetch(
      `https://api.themoviedb.org/3/movie/${selectedId}/videos?api_key=${api_key}`
    );
    const { results } = await resVideo.json();
    if (results.length !== 0) {
      $popupVideo.innerHTML = `<iframe width="770" height="350" src="https://www.youtube.com/embed/${results[0].key}?" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } else {
      $popupVideo.innerHTML = `<img src="../image/비디오준비중.jpg" >`;
    }
  } catch (err) {
    console.log("[ERROR]", err);
  }
};

// popup에서 하트 클릭시 toggle
$likeBtn.onclick = async (e) => {
  $likeBtn.classList.toggle("liked");

  if ($likeBtn.classList.contains("liked")) {
    $likeBtn.firstElementChild.innerHTML = `찜완료!`;
    $heartPopup.style.transition = "all 0.1s";
    $heartPopup.style.opacity = "1";
    $heartPopup.style.zIndex = "300";
    $heartPopup.style.display = "block";
    $heartPopup.classList.add("showing");
    setTimeout(() => {
      $heartPopup.style.opacity = "0";
      $heartPopup.style.display = "none";
      $heartPopup.style.transition = "none";
      $heartPopup.style.zIndex = "-300";
      $heartPopup.classList.remove("showing");
    }, 1000);
  } else {
    $likeBtn.firstElementChild.innerHTML = "찜하기";
  }
};

// close버튼 클릭 이벤트
$closeBtn.onclick = async (e) => {
  $popup.style.display = "none";
  document.querySelector(".overlay").style.display = "none";
  document.querySelector(".fa-chevron-down").classList.remove("active");
  $popupOpen.style.height = 0;
  modifyBookMarks();
};

// overlay 클릭 이벤트
$overlay.onclick = async () => {
  $popup.style.display = "none";
  document.querySelector(".overlay").style.display = "none";
  document.querySelector(".fa-chevron-down").classList.remove("active");
  $popupOpen.style.height = 0;
  modifyBookMarks();
};

// localStorage와 db에 반영된 북마크 연동하기
(async function () {
  const users = await fetch(`/users/${localUser.id}`);
  const { bookmarks } = await users.json();
  let getBookmarks = bookmarks ? bookmarks : [];
})();
