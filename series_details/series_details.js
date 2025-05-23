

const seriesId = getParameterByName('id');

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function switchEmbed(embedUrl) {
    console.log("Switching embed to:", embedUrl);
    console.log(embedUrl);
    const iframe = document.getElementById('seriesIframe');
    iframe.src = embedUrl;
}

document.addEventListener("DOMContentLoaded", function() {
   
    // Fetch series details using series ID from URL parameter
    const seriesId = getParameterByName('id');
    const seriesDetailsUrl = `https://bingflix-backend.vercel.app/series_details/${seriesId}`;
    const castUrl = `https://bingflix-backend.vercel.app/series_details/credits/${seriesId}`;
    const videosUrl = `https://bingflix-backend.vercel.app/series_details/videos/${seriesId}`;


    //like button
    const likeButton = document.querySelector('.paw-button'); // Assuming you have only one like button
    if (likeButton && seriesId) {
        likeButton.setAttribute('data-movie-id', seriesId);
        updateLikeButtonState(seriesId);
    }
   
    //updating like button state when doc reloads
    function updateLikeButtonState(seriesId) {
        const likedSeries = JSON.parse(localStorage.getItem('likedSeries')) || [];
        console.log(likedSeries);
        const likeButton = document.querySelector('.paw-button');
        
        if (likedSeries.includes(seriesId)) {
            // The movie is liked
            if (likeButton) {

                document.querySelectorAll('.paw-button').forEach(elem => { 
                    elem.classList.add('animation');
                    elem.classList.add('confetti');
                    elem.classList.add('liked');
                    elem.children[1].textContent = "Saved";
                })
               // Update to match your "liked" state appearance
            }
        } else {
            // The movie is not liked
        }
    }
    
    
    function fetchSeasonsAndEpisodes() {
        fetch(seriesDetailsUrl)
            .then(response => { console.log(response) ; return response.json();})
            .then(data => {
                // Populate seasons and episodes in dropdown menus
                const seasonSelect = document.getElementById('Sno');
                const episodeSelect = document.getElementById('epNo');
    
                data.seasons.filter(season => season.season_number !== 0).forEach(season => {
                    const option = document.createElement('option');
                    option.value = season.season_number;
                    option.textContent = `Season ${season.season_number}`;
                    seasonSelect.appendChild(option);
                });
    
                // Trigger change event to populate episodes for the first season
                seasonSelect.dispatchEvent(new Event('change'));
            })
            .catch(error => console.error('Error fetching seasons and episodes:', error));
    }

    function fetchEpisodesForSeason(seasonNumber) {
        // Fetch episodes for the selected season
        const episodesUrl = `https://bingflix-backend.vercel.app/series_details/episodes/${seriesId}/${seasonNumber}`;
        fetch(episodesUrl)
            .then(response => response.json())
            .then(data => {
                data.episodes.forEach(episode => {
                    const option = document.createElement('option');
                    option.value = episode.episode_number;
                    option.textContent = `Episode ${episode.episode_number}`;
                    episodeSelect.appendChild(option);
                });
                
                // Trigger change event to update embed URL
                episodeSelect.dispatchEvent(new Event('change'));
            })
            .catch(error => console.error('Error fetching episodes:', error));
    }

    function fetchCastDetails() {
        fetch(castUrl)
            .then(response => response.json())
            .then(data => {
                // Populate cast details in HTML element
                const castList = document.getElementById('castList');
                data.cast.slice(0, 5).forEach(actor => {
                    const listItem = document.createElement('div');
                    listItem.style.width='fit-content';
    
                    listItem.style.display='flex';
                    listItem.style.flexDirection='column';
                    listItem.style.paddingRight= '20px';
                    listItem.style.fontFamily='Poppins';
                    listItem.style.fontSize ='1vw'
                    
    
                    const actorName = document.createElement('span');
                    const actorImage = document.createElement('img');
                    actorName.textContent = actor.name;
                    actorImage.src = `https://image.tmdb.org/t/p/w185${actor.profile_path}`;
                    actorImage.alt = actor.name;
                    actorImage.style.borderRadius="1.2rem";
                    listItem.appendChild(actorImage);
                    listItem.appendChild(actorName);
                    castList.appendChild(listItem);
                });
            })
            .catch(error => console.error('Error fetching cast details:', error));
    }
    

    //fetchCastDetails is also getting called inside this
    fetch(seriesDetailsUrl)
        .then(response => response.json())
        .then(data => {
            // Populate series details in HTML elements
            const poster = document.getElementById('poster');
            const title = document.getElementById('title');
            const description = document.getElementById('description');

            poster.src = `https://image.tmdb.org/t/p/w780${data.backdrop_path}`;
            title.textContent = data.name;
            description.textContent = data.overview;
            
            fetchCastDetails();

             // Fetch and populate seasons and episodes
            fetchSeasonsAndEpisodes();

        })
        .catch(error => console.error('Error fetching series details:', error));


    const seasonSelect = document.getElementById('Sno');
    const episodeSelect = document.getElementById('epNo');

    seasonSelect.addEventListener('change', function() {
        const seasonNumber = this.value;
        // Clear episode dropdown
        episodeSelect.innerHTML = '';
        // Populate episodes for selected season
        fetchEpisodesForSeason(seasonNumber);
    });

    episodeSelect.addEventListener('change', function() {
        const seasonNumber = seasonSelect.value;
        const episodeNumber = this.value;

        const seriesId = getParameterByName('id');

        // Construct the URLs for each server based on the selected season and episode
        const server1Url = `https://embed.smashystream.com/playere.php?tmdb=${seriesId}&season=${seasonNumber}&episode=${episodeNumber}`;
        const server2Url = `https://multiembed.mov/directstream.php?video_id=${seriesId}&tmdb=1&s=${seasonNumber}&e=${episodeNumber}`;
        const server3Url =  `https://vidsrc.xyz/embed/tv?tmdb=${seriesId}&season=${seasonNumber}&episode=${episodeNumber}` ;
      // Check the current embed URL
        const currentEmbedUrl = document.getElementById('seriesIframe').src;

        // Update the onclick attributes of the buttons
    document.getElementById('Server1Btn').setAttribute('onclick', `switchEmbed('${server1Url}')`);
    document.getElementById('Server2Btn').setAttribute('onclick', `switchEmbed('${server2Url}')`);
    document.getElementById('Server3Btn').setAttribute('onclick', `switchEmbed('${server3Url}')`);

    // Determine which server URL to use based on the current embed URL
    let embedUrl;
    if (currentEmbedUrl.includes('embed.smashystream.com')) {
        embedUrl = server1Url;
    } else if (currentEmbedUrl.includes('multiembed.mov')) {
        embedUrl = server2Url;
    }
    else //default server will always be in else
    {
        embedUrl = server3Url;
    }

    // Call switchEmbed with the determined embed URL
    switchEmbed(embedUrl);

    });

    function fetchAndEmbedTrailer() {
            fetch(videosUrl)
                .then(response => response.json())
                .then(data => {
                    console.log("showing trailer");
                    // Find trailer key
                    const trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube");
                    if (trailer) {
                        const trailerKey = trailer.key;
                        // Embed trailer
                        switchEmbed(`https://www.youtube.com/embed/${trailerKey}`);
                    } else {
                        console.log("Trailer not found");
                    }
                })
                .catch(error => console.error('Error fetching trailer:', error));
        }
        const trailer = document.getElementById('Trailerbtn');
        trailer.addEventListener('click', fetchAndEmbedTrailer);
});





//sidebar logic
let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");
closeBtn.addEventListener("click", ()=>{
  sidebar.classList.toggle("open");
  menuBtnChange();//calling the function(optional)
});
searchBtn.addEventListener("click", ()=>{ // Sidebar open when you click on the search iocn
  sidebar.classList.toggle("open");
  menuBtnChange(); //calling the function(optional)
});
// following are the code to change sidebar button(optional)
function menuBtnChange() {
 if(sidebar.classList.contains("open")){
   closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");//replacing the iocns class
 }else {
   closeBtn.classList.replace("bx-menu-alt-right","bx-menu");//replacing the iocns class
 }
}

function searchSeries() {
    const query = document.getElementById('searchInput').value;
    if (query.length < 3) {
      alert("Please enter at least 3 characters for search.");
      return;
    }
    const url = `../results/results.html?query=${query}`;
    window.location.href = url;
  }


  let confettiAmount = 60,
    confettiColors = [
        '#7d32f5',
        '#f6e434',
        '#63fdf1',
        '#e672da',
        '#295dfe',
        '#6e57ff'
    ],
    random = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    createConfetti = to => {
        let elem = document.createElement('i'),
            set = Math.random() < 0.5 ? -1 : 1;
        elem.style.setProperty('--x', random(-260, 260) + 'px');
        elem.style.setProperty('--y', random(-160, 160) + 'px');
        elem.style.setProperty('--r', random(0, 360) + 'deg');
        elem.style.setProperty('--s', random(.6, 1));
        elem.style.setProperty('--b', confettiColors[random(0, 5)]);
        to.appendChild(elem);
    };

document.querySelectorAll('.paw-button').forEach(elem => {
    elem.addEventListener('click', e => {

        let seriesId = elem.getAttribute('data-movie-id');
        

        //let number = elem.children[1].textContent;
        if(!elem.classList.contains('animation')) {
            elem.classList.add('animation');
            for(let i = 0; i < confettiAmount; i++) {
                createConfetti(elem);
            }
            setTimeout(() => {
                elem.classList.add('confetti');
                setTimeout(() => {
                    elem.classList.add('liked');
                    elem.children[1].textContent = "Saved";
                }, 400);
                setTimeout(() => {
                    elem.querySelectorAll('i').forEach(i => i.remove());
                }, 600);
            }, 260);
        }  
        else {
            elem.classList.remove('animation', 'liked', 'confetti');
            elem.children[1].textContent = "";
        }

        toggleLikeState(seriesId, elem);

        function toggleLikeState(seriesId, elem) {
            let likedSeries = JSON.parse(localStorage.getItem('likedSeries')) || [];
            
            // Check if the series is already liked
            if (likedSeries.includes(seriesId)) {
                // series is already liked; unlike it
                likedSeries = likedSeries.filter(id => id !== seriesId);
              
            } else {
                // series is not liked; like it
                likedSeries.push(seriesId);
            }
        
            // Update localStorage
            localStorage.setItem('likedSeries', JSON.stringify(likedSeries));
        }

        e.preventDefault();

    });
});