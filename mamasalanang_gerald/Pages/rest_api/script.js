const api =
      "https://www.stackovercash.site/exercise_16/mamasalanang/games_api.php";

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

	const formData = new URLSearchParams();
	formData.append("game_title", game_title);
	formData.append("developer", developer);
	formData.append("release_year", release_year);
	formData.append("genre", genre);
	formData.append("platform", platform);
	formData.append("action", "create");

	fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: formData.toString(),
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok: "
                      + response.statusText);
			}
			return response.text();
		})
		.then((data) => {
			try {
				const jsonData = JSON.parse(data);
				alert(jsonData.message || "Operation completed");
			} catch (e) {
				alert(data || "Operation completed");
			}
			form.reset();
			fetchGames();
		})
		.catch((error) => {
			console.error("Error:", error);
			alert("An error occurred: " + error.message);
		});
}

function fetchGames() {
	fetch(api + "?action=read")
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok: "
                      + response.statusText);
			}
			return response.text();
		})
		.then((data) => {
			try {
				const games = JSON.parse(data);
				const gamesList = document.getElementById("games_list");
				gamesList.innerHTML = "";

				if (!Array.isArray(games)) {
					console.error("Expected an array but got:", games);
					gamesList.innerHTML =
						"<tr><td colspan='7'>No games found</td></tr>";
					return;
				}

				if (games.length === 0) {
					gamesList.innerHTML =
						"<tr><td colspan='7'>No games found</td></tr>";
					return;
				}

				games.forEach((game) => {
					const row = document.createElement("tr");
					row.innerHTML = `
						<td>${game.game_title || ""}</td>
						<td>${game.developer || ""}</td>
						<td>${game.release_year || ""}</td>
						<td>${game.genre || ""}</td>
						<td>${game.platform || ""}</td>
						<td>
							<button class="edit-btn" onclick="editRow(this)"
                                  data-id="${game.id}">Edit</button>
						</td>
						<td>
							<button class="delete-btn" onclick="deleteGame
                                  (${game.id})">Delete</button>
						</td>
					`;
					gamesList.appendChild(row);
				});
			} catch (e) {
				console.error("Error parsing JSON:", e);
				document.getElementById("games_list").innerHTML = 
					`<tr><td colspan="7">Error parsing data:
                          ${e.message}</td></tr>`;
			}
		})
		.catch((error) => {
			console.error("Error fetching games:", error);
			document.getElementById("games_list").innerHTML = 
				`<tr><td colspan="7">Error loading games:
                      ${error.message}</td></tr>`;
		});
}

function editRow(button) {
	const row = button.closest("tr");
	const cells = row.querySelectorAll("td");
	const gameId = button.getAttribute("data-id");

	const originalData = [];
	for (let i = 0; i < 5; i++) {
		const text = cells[i].innerText;
		originalData.push(text);
		cells[i].innerHTML = `<input type="text" value="
              ${text.replace(/"/g, "&quot;")}" />`;
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
	const updatedData = Array.from(inputs).map((input) => input.value.trim());

	if (updatedData.some((val) => val === "")) {
		alert("Please fill out all fields!");
		return;
	}

	const [game_title, developer, release_year, genre, platform] = updatedData;

	const formData = new URLSearchParams();
	formData.append("id", gameId);
	formData.append("game_title", game_title);
	formData.append("developer", developer);
	formData.append("release_year", release_year);
	formData.append("genre", genre);
	formData.append("platform", platform);
	formData.append("action", "update");

	fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: formData.toString(),
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok: "
                      + response.statusText);
			}
			return response.text();
		})
		.then((data) => {
			try {
				const jsonData = JSON.parse(data);
				alert(jsonData.message || "Update completed");
			} catch (e) {
				alert(data || "Update completed");
			}
			fetchGames();
		})
		.catch((error) => {
			console.error("Error:", error);
			alert("An error occurred while saving: " + error.message);
		});
}

function cancelEdit(row, originalData) {
	const cells = row.querySelectorAll("td");
	for (let i = 0; i < 5; i++) {
		cells[i].innerText = originalData[i];
	}
	fetchGames();
}

function deleteGame(gameId) {
	if (!gameId) {
		console.error("Invalid game ID");
		return;
	}

	const element = event ? event.target : document.querySelector
          (`button[onclick="deleteGame(${gameId})"]`);
	const row = element.closest("tr");
	const gameTitle = row.cells[0].innerText;

	if (confirm(`Are you sure you want to delete "${gameTitle}"?`)) {
		const formData = new URLSearchParams();
		formData.append("id", gameId);
		formData.append("action", "delete");

		fetch(api, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: formData.toString(),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok: "
                          + response.statusText);
				}
				return response.text();
			})
			.then((data) => {
				try {
					const jsonData = JSON.parse(data);
					alert(jsonData.message || "Deletion completed");
				} catch (e) {
					alert(data || "Deletion completed");
				}
				fetchGames();
			})
			.catch((error) => {
				console.error("Error:", error);
				alert("An error occurred while deleting: " + error.message);
			});
	}
}

window.onload = fetchGames;