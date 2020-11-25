const $searchBar2 = document.getElementById("search-bar2");
const $searchForm = document.querySelector(".search-form");
const $searchFormTop = document.querySelector(".search-form-top");
const $result = document.querySelector(".result");
const $logoutBtn = document.querySelector(".logout-btn");
const $fragment = document.createDocumentFragment();
let i = 1;

// local storage
let user = JSON.parse(localStorage.getItem("login"));

// 미 로그인 시 로그인 페이지로 이동
if (!user.curlog) {
  window.location.href = '/';
}

// localstorage에 있는 이름을 화면에 렌더링
$main__name.innerHTML = user.name;

//event handler

// 더보기 버튼 클릭시 다음 페이지 렌더링
$moreBtn.onclick = () => {
  ++i
  console.log(i);
  render();
};

// 검색창 입력 시 영화 API로 검색 정보 가져오기
$searchForm.onsubmit = e => {
  e.preventDefault();
  // console.log($searchForm.querySelector('input').value);
  $result__movies.innerHTML = "";
  render();
};

// 검색 API로 화면에 렌더하기
const render = async () => {
  try {
    const resMovie = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&language=ko&query=${$searchBar2.value}&page=${i}&include_adult=false`
      );
    const { results } = await resMovie.json();
    console.log(results);
    results.forEach((movie) => {
      const $li = document.createElement("li");
      $li.id = movie.id;
      const $a = document.createElement("a");
      $a.href = "#";
      const $img = document.createElement("img");
      if (movie.poster_path === null) {
        $img.src = "../image/준비중.png";
      } else {
        $img.src = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
      }
      const textNode = document.createTextNode(movie.title);
-     $a.appendChild($img);
-     $a.appendChild(textNode);
-     $li.appendChild($a);
      $fragment.appendChild($li);
      $result__movies.appendChild($fragment);
    });
  } catch (err) {
    console.log("[ERROR]", err);
  }
};

// 로그아웃 버튼
$logoutBtn.onclick = e => {
  localStorage.setItem(
    "login",
    JSON.stringify({
      id: localUser.id,
      name: localUser.name,
      genre: localUser.genre,
      savelog: localUser.savelog,
      curlog: false
    })
  );
};

// 스크롤 top 버튼
$topBtn.onclick = () => {
  window.scroll({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
}

// 스크롤 최상단 시 top 버튼 안보이기

window.onscroll = e => {
  const yOffset = window.pageYOffset;
  if (yOffset === 0) {
    $topBtn.style.display = 'none';
  } else {
    $topBtn.style.display = 'block';
  }
}