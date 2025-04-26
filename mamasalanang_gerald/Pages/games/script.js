function submitData() {
    const game_title = document.querySelector("#game_title").value;
    const developer = document.querySelector("#developer").value;
    const release_year = document.querySelector("#release_year").value;
    const genre = document.querySelector("#genre").value;
    const platform = document.querySelector("#platform").value;

    fetch("games_api.php?action=create", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `game_title=${encodeURIComponent(game_title)}
              &developer=${encodeURIComponent(developer)}
              &release_year=${encodeURIComponent(release_year)}
              &genre=${encodeURIComponent(genre)}
              &platform=${encodeURIComponent(platform)}`
    })
    .then(response => response.text())
    .then(responseText => {
        alert(responseText);
        fetchGames();
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

function fetchGames() {
    fetch("games_api.php?action=read")
        .then(response => response.json())
        .then(games => {
            const gamesList = document.querySelector("#games_list");
            gamesList.innerHTML = "";

            games.forEach(game => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td><input value="${game.game_title}" onchange="updateGame(
                          '${game.game_title}', 'game_title',
                          this.value)" /></td>
                    <td><input value="${game.developer}" onchange="updateGame(
                          '${game.game_title}', 'developer',
                          this.value)" /></td>
                    <td><input type="number" value="${game.release_year}
                          " onchange="updateGame('${game.game_title}',
                          'release_year', this.value)" /></td>
                    <td><input value="${game.genre}" onchange="updateGame(
                          '${game.game_title}', 'genre', this.value)" /></td>
                    <td><input value="${game.platform}" onchange="updateGame(
                          '${game.game_title}', 'platform',
                          this.value)" /></td>
                    <td><button onclick="deleteGame(
                          '${game.game_title}')">Delete</button></td>
                `;
                gamesList.appendChild(row);
            });
        });
}

function updateGame(game_title, field, value) {
    const data = `game_title=${encodeURIComponent(game_title)}
          &field=${field}
          &value=${encodeURIComponent(value)}`;
    fetch("games_api.php?action=update", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data
    })
    .then(response => response.text())
    .then(responseText => {
        alert(responseText);
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

function deleteGame(game_title) {
    fetch("games_api.php?action=delete", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `game_title=${encodeURIComponent(game_title)}`
    })
    .then(response => response.text())
    .then(responseText => {
        alert(responseText);
        fetchGames();
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

window.onload = fetchGames;
