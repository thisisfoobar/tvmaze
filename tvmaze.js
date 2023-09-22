"use strict";

const $showsList = $("#showsList");
//const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");
const missingImage =
  "https://media.istockphoto.com/id/653116836/vector/tv-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=HjK3fsPw65x2UJJIvKc5LTVaq4fJjexp8C96nbr0Vus=";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(q) {
  const results = await axios.get("https://api.tvmaze.com/search/shows", {
    params: { q },
  });
  return results.data.map((result) => {
    const show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.original : missingImage,
    };
  });
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#episodesArea">
                Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  //$episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
  $("#searchForm-term").val("");
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

$("#showsList").on("click", "button", async function (evt) {
  $("#episodesList").empty();
  const showId = $(evt.currentTarget).parents(".Show").data().showId;

  const episodes = await getEpisodesOfShow(showId);

  populateEpisodes(episodes);
});

async function getEpisodesOfShow(id) {
  const results = await axios.get(
    `https://api.tvmaze.com/shows/${id}/episodes`
  );
  return results.data.map((result) => {
    const episode = result.data;
    return {
      id: result.id,
      name: result.name,
      season: result.season,
      number: result.number,
    };
  });
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  for (let episode of episodes) {
    const $episode = `
    <li data-episode-id="${episode.id}">${episode.name} (season ${episode.season}, number ${episode.number})</li>`;
    $episodesList.append($episode);
  }
}
