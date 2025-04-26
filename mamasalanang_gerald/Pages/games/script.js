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

    fetch("games_api.php?action=create", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `game_title=${encodeURIComponent(game_title)}&developer=${encodeURIComponent(developer)}&release_year=${encodeURIComponent(release_year)}&genre=${encodeURIComponent(genre)}&platform=${encodeURIComponent(platform)}`
    })
    .then(response => response.text())
    .then(responseText => {
        alert(responseText);
        form.reset(); // ✅ Reset form after successful submit
        fetchGames();
    })
    .catch(error => console.error("Error:", error));
}

function fetchGames() {
    fetch("games_api.php?action=read")
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
                    <button class="edit-btn" onclick="editRow(this)">Edit</button>
                </td>
                <td>
                    <button class="delete-btn" onclick="deleteGame('${game.game_title}')">Delete</button>
                </td>
            `;
            gamesList.appendChild(row);
        });
    });
}

function editRow(button) {
    const row = button.closest("tr");
    const cells = row.querySelectorAll("td");

    const originalData = [];
    for (let i = 0; i < 5; i++) {
        originalData.push(cells[i].innerText);
        cells[i].innerHTML = `<input type="text" value="${cells[i].innerText}" />`;
    }

    button.style.display = "none";

    const saveBtn = document.createElement("button");
    saveBtn.className = "edit-btn";
    saveBtn.textContent = "Save";
    saveBtn.onclick = () => saveRow(row, originalData);

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "delete-btn";
    cancelBtn.textContent = "Cancel";
    cancelBtn.onclick = () => cancelEdit(row, originalData);

    button.parentNode.appendChild(saveBtn);
    button.parentNode.appendChild(cancelBtn);
}

function saveRow(row, originalData) {
    const inputs = row.querySelectorAll("input");
    const updatedData = Array.from(inputs).map(input => input.value.trim());

    if (updatedData.some(val => val === "")) {
        alert("Please fill out all fields!");
        return;
    }

    const [new_title, developer, release_year, genre, platform] = updatedData;

    fetch("games_api.php?action=update", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `original_title=${encodeURIComponent(originalData[0])}&game_title=${encodeURIComponent(new_title)}&developer=${encodeURIComponent(developer)}&release_year=${encodeURIComponent(release_year)}&genre=${encodeURIComponent(genre)}&platform=${encodeURIComponent(platform)}`
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

function deleteGame(game_title) {
    if (confirm(`Are you sure you want to delete "${game_title}"?`)) {
        fetch("games_api.php?action=delete", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `game_title=${encodeURIComponent(game_title)}`
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
