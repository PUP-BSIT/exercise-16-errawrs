const api =
      "https://www.stackovercash.site/exercise_16/mamasalanang/games_api.php"

function submitData() {
    const form = document.getElementById("game_form");
    const game_title = document.querySelector("#game_title").value.trim();
    const developer = document.querySelector("#developer").value.trim();
    const release_year = document.querySelector("#release_year").value.trim();
    const genre = document.querySelector("#genre").value.trim();
    const platform = document.querySelector("#platform").value.trim();

    if (!game_title || !developer || !release_year || !genre || !platform) {
        alert("Please fill out all fields!");
        return;
    }

    fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `game_title=${encodeURIComponent(game_title)}
              &developer=${encodeURIComponent(developer)}
              &release_year=${encodeURIComponent(release_year)}
              &genre=${encodeURIComponent(genre)}
              &platform=${encodeURIComponent(platform)}`
    })
    .then(response => response.text())
    .then(responseText => {
        alert(responseText);
        form.reset();
        fetchGames();
    })
    .catch(error => console.error("Error:", error));
}

function fetchGames() {
    fetch(api)
    .then(response => response.json())
    .then(games => {
        const gamesList = document.getElementById("games_list");
        gamesList.innerHTML = "";

        games.forEach(game => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${game.game_title}</td>
                <td>${game.developer}</td>
                <td>${game.release_year}</td>
                <td>${game.genre}</td>
                <td>${game.platform}</td>
                <td>
                    <button class="edit-btn" onclick="editRow(this)"
                          data-id="${game.id}">Edit</button>
                </td>
                <td>
                    <button class="delete-btn" 
                          onclick="deleteGame(${game.id})">Delete</button>
                </td>
            `;
            gamesList.appendChild(row);
        });
    });
}

function editRow(button) {
    const row = button.closest("tr");
    const cells = row.querySelectorAll("td");
    const gameId = button.getAttribute("data-id");

    const originalData = [];
    for (let i = 0; i < 5; i++) {
        originalData.push(cells[i].innerText);
        cells[i].innerHTML =
              `<input type="text" value="${cells[i].innerText}" />`;
    }

    button.style.display = "none";

    const saveBtn = document.createElement("button");
    saveBtn.className = "edit-btn";
    saveBtn.textContent = "Save";
    saveBtn.onclick = () => saveRow(row, gameId);

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "delete-btn";
    cancelBtn.textContent = "Cancel";
    cancelBtn.onclick = () => cancelEdit(row, originalData);

    button.parentNode.appendChild(saveBtn);
    button.parentNode.appendChild(cancelBtn);
}

function saveRow(row, gameId) {
    const inputs = row.querySelectorAll("input");
    const updatedData = Array.from(inputs).map(input => input.value.trim());

    if (updatedData.some(val => val === "")) {
        alert("Please fill out all fields!");
        return;
    }

    const [game_title, developer, release_year, genre, platform] = updatedData;

    fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${encodeURIComponent(gameId)}
              &game_title=${encodeURIComponent(game_title)}
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
    .catch(error => console.error("Error:", error));
}

function cancelEdit(row, originalData) {
    const cells = row.querySelectorAll("td");
    for (let i = 0; i < 5; i++) {
        cells[i].innerText = originalData[i];
    }
    fetchGames();
}

function deleteGame(gameId) {
    const row = event.target.closest("tr");
    const gameTitle = row.cells[0].innerText;
    
    if (confirm(`Are you sure you want to delete "${gameTitle}"?`)) {
        fetch(api, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${encodeURIComponent(gameId)}`
        })
        .then(response => response.text())
        .then(responseText => {
            alert(responseText);
            fetchGames();
        })
        .catch(error => console.error("Error:", error));
    }
}

window.onload = fetchGames;