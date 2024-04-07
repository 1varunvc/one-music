if ($(window).width() > 767) {
    $(".logo").attr("src", "./img/logo/one_music-short-4.0-long-2.0.svg");
}

$('.item').hover(function () {
    $(this).animate({'backgroundColor': '#171717'}, 100);
}, function () {
    $(this).animate({'backgroundColor': 'black'}, 200);
});

for (i = 0; i < Object.keys(ytQueryEjs).length; i++) {
    $("#ytQueryEjs<%= i").on("click", () => {
        $(".nowPlayingContainer").html(
            "<h3 class='itemHeading' style='padding-top: 1rem; margin-top: 0rem; margin-bottom: 1rem;'>Now Playing</h3><div class='nowPlayingYt'></div>"
        )
        $(".nowPlayingYt").html("<iframe width='560' height='315' src='https://www.youtube.com/embed/<%= ytQueryEjs.id[i]' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe>");
        $('html, body').animate({
            scrollTop: $(".nowPlayingContainer").offset().top
        }, 50);
    });
}

for (i = 0; i < Object.keys(ytCoverUniqueEjs).length; i++) {
    $("#ytCoverUniqueEjs<%= i").on("click", () => {
        $(".nowPlayingContainer").html(
            "<h3 class='itemHeading' style='padding-top: 1rem; margin-top: 0rem; margin-bottom: 1rem;'>Now Playing</h3><div class='nowPlayingYt'></div>"
        )
        $(".nowPlayingYt").html("<iframe width='560' height='315' src='https://www.youtube.com/embed/<%= ytCoverUniqueEjs.id[i]' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe>");
        $('html, body').animate({
            scrollTop: $(".nowPlayingContainer").offset().top
        }, 50);
    });
}

for (i = 0; i < Object.keys(ytLiveUniqueEjs).length; i++) {
    $("#ytLiveUniqueEjs<%= i").on("click", () => {
        $(".nowPlayingContainer").html(
            "<h3 class='itemHeading' style='padding-top: 1rem; margin-top: 0rem; margin-bottom: 1rem;'>Now Playing</h3><div class='nowPlayingYt'></div>"
        )
        $(".nowPlayingYt").html("<iframe width='560' height='315' src='https://www.youtube.com/embed/<%= ytLiveUniqueEjs.id[i]' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe>");
        $('html, body').animate({
            scrollTop: $(".nowPlayingContainer").offset().top
        }, 50);
    });
}

if (user) {
    if (!user) {
        window.confirm("'Sup, bruh! Session is currently just an hour long. We're sorry. Please press 'OK' for instant re-login. :)");
        if (confirm) {
            window.location.href = "/auth/spotify";
        }
    }

    for (i = 0; i < Object.keys(spotifyTrackId).length; i++) {
        $("#spotifyTrackId<%= i").on("click", () => {
            $(".nowPlayingContainer").html(
                "<h3 class='itemHeading' style='padding-top: 1rem; margin-top: 0rem; margin-bottom: 1rem;'>Now Playing</h3><div class='nowPlayingSpotify'></div>"
            )
            $(".nowPlayingSpotify").html("<iframe src='https://open.spotify.com/embed/track/<%= spotifyTrackId[i]' width='300' height='380' frameborder='0' allowtransparency='true' allow='encrypted-media'></iframe>");
            $('html, body').animate({
                scrollTop: $(".nowPlayingContainer").offset().top
            }, 50);
        });
    }

    for (i = 0; i < Object.keys(spotifyUniqueTrackArtistId).length; i++) {
        $("#spotifyUniqueTrackArtistId<%= i").on("click", () => {
            $(".nowPlayingContainer").html(
                "<h3 class='itemHeading' style='padding-top: 1rem; margin-top: 0rem; margin-bottom: 1rem;'>Now Playing</h3><div class='nowPlayingSpotify'></div>"
            )
            $(".nowPlayingSpotify").html("<iframe src='https://open.spotify.com/embed/artist/<%= spotifyUniqueTrackArtistId[i]' width='300' height='380' frameborder='0' allowtransparency='true' allow='encrypted-media'></iframe>");
            $('html, body').animate({
                scrollTop: $(".nowPlayingContainer").offset().top
            }, 50);
        });
    }

    for (i = 0; i < Object.keys(spotifyUniqueQueryArtistId).length; i++) {
        $("#spotifyUniqueQueryArtistId<%= i").on("click", () => {
            $(".nowPlayingContainer").html(
                "<h3 class='itemHeading' style='padding-top: 1rem; margin-top: 0rem; margin-bottom: 1rem;'>Now Playing</h3><div class='nowPlayingSpotify'></div>"
            )
            $(".nowPlayingSpotify").html("<iframe src='https://open.spotify.com/embed/artist/<%= spotifyUniqueQueryArtistId[i]' width='300' height='380' frameborder='0' allowtransparency='true' allow='encrypted-media'></iframe>");
            $('html, body').animate({
                scrollTop: $(".nowPlayingContainer").offset().top
            }, 50);
        });
    }

    for (i = 0; i < Object.keys(spotifyUniqueAlbumId).length; i++) {
        $("#spotifyUniqueAlbumId<%= i").on("click", () => {
            $(".nowPlayingContainer").html(
                "<h3 class='itemHeading' style='padding-top: 1rem; margin-top: 0rem; margin-bottom: 1rem;'>Now Playing</h3><div class='nowPlayingSpotify'></div>"
            )
            $(".nowPlayingSpotify").html("<iframe src='https://open.spotify.com/embed/album/<%= spotifyUniqueAlbumId[i]' width='300' height='380' frameborder='0' allowtransparency='true' allow='encrypted-media'></iframe>");
            $('html, body').animate({
                scrollTop: $(".nowPlayingContainer").offset().top
            }, 50);
        });
    }

}

document.querySelector('.searchForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent traditional form submission
    const query = document.getElementById('queryId').value;
    fetchSearchResults(query);
});

function fetchSearchResults(query) {
    // Note the addition of '&ajax=true' to signal an AJAX request
    fetch(`/search?queryValue=${encodeURIComponent(query)}&ajax=true`)
        .then(response => response.text()) // Expecting text (HTML) response
        .then(html => {
            // Insert the received HTML into the results section of your page
            document.documentElement.innerHTML = html;
            history.pushState({query: query}, "", `?queryValue=${encodeURIComponent(query)}`);
        })
        .catch(error => console.error('Error:', error));
}