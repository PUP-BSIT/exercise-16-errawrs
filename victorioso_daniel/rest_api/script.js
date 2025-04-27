const API_URL =
	  "https://www.stackovercash.site/exercise_16/victorioso/rest_api.php";

function submitData() {
	const song_title = document.querySelector("#song_title")?.value.trim();
	const artist_name = document.querySelector("#artist_name")?.value.trim();
	const release_year = document.querySelector("#release_year")?.value.trim();
	const genre = document.querySelector("#genre")?.value.trim();
	const song_writer = document.querySelector("#song_writer")?.value.trim();
	const form = document.querySelector("#song_form");

	if (!song_title || !artist_name || !release_year ||
          !genre || !song_writer) {
		alert("All fields must be filled out");
		return;
	}

	fetch(API_URL, {
        method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
        },
		body: `song_title=${encodeURIComponent(song_title)}
              &artist_name=${encodeURIComponent(artist_name)}
              &release_year=${encodeURIComponent(release_year)}
              &genre=${encodeURIComponent(genre)}
              &song_writer=${encodeURIComponent(song_writer)}`,
	})
    .then((response) => response.text())
	.then((responseText) => {
        alert(responseText);
		getData();
	})
	.catch((error) => console.error("Error submitting data:", error));

	form.reset();
}

function getData() {
	fetch(API_URL)
	.then((response) => response.text())
	.then((responseText) => {
        document.querySelector(".table").innerHTML = responseText;
		setupMobileView();
	})
	.catch((error) => console.error("Error fetching data:", error));
}

function setupMobileView() {
	if (window.innerWidth > 550) return;

	const rows = document.querySelectorAll("tbody tr:not(.hidden-data)");

	rows.forEach((row) => {
		if (row.classList.contains("expand-row") ||
              row.querySelector(".more-info")
		) return;

		const id = row.id.split("-")[1];
		const genre = row.querySelector(".genre")?.innerText || "";
		const songwriter = row.querySelector(".song_writer")?.innerText || "";

		row.addEventListener("click", (e) => {
			if (!e.target.closest(".action"))
				toggleDetails(id);
		});

		const hiddenRow = document.createElement("tr");
		hiddenRow.id = `details-${id}`;
		hiddenRow.className = "hidden-data";
		hiddenRow.innerHTML = `
			<td colspan="6">
				<div><span class="hidden-data-label">
                    Genre:</span> ${genre}</div>
				<div><span class="hidden-data-label">
                    Song Writer:</span> ${songwriter}</div>
			</td>
		`;

		row.parentNode.insertBefore(hiddenRow, row.nextSibling);
	});
}

function toggleDetails(id) {
	const detailsRow = document.getElementById(`details-${id}`);
	if (detailsRow)
		detailsRow.classList.toggle("visible");
}

function editRow(id) {
	const row = document.getElementById(`row-${id}`);
	if (!row) return;

	const currentlyEditingRow = document.querySelector("tr.editing");
    if (currentlyEditingRow && currentlyEditingRow !== row) {
        alert("Please save or cancel first.");
        return;
    }

	const songTitleCell = row.querySelector(".song_title");
	const artistNameCell = row.querySelector(".artist_name");
	const releaseYearCell = row.querySelector(".release_year");
	const genreCell = row.querySelector(".genre");
	const songWriterCell = row.querySelector(".song_writer");
	const actionCell = row.querySelector(".action");

	if (!songTitleCell || !artistNameCell || !releaseYearCell || !actionCell)
		return;

	row.setAttribute("data-original-title", songTitleCell.innerText || "");
	row.setAttribute("data-original-artist", artistNameCell.innerText || "");
	row.setAttribute("data-original-year", releaseYearCell.innerText || "");
	row.setAttribute("data-original-genre", genreCell?.innerText || "");
	row.setAttribute("data-original-writer", songWriterCell?.innerText || "");

	songTitleCell.setAttribute("contenteditable", "true");
	artistNameCell.setAttribute("contenteditable", "true");
	releaseYearCell.setAttribute("contenteditable", "true");
	if (genreCell) genreCell.setAttribute("contenteditable", "true");
	if (songWriterCell) songWriterCell.setAttribute("contenteditable", "true");

	actionCell.innerHTML = `
        <button onclick="saveRow(${id})">Save</button>
        <button onclick="cancelEdit(${id})">Cancel</button>
    `;

	row.classList.add("editing");

	if (window.innerWidth <= 550) {
		const detailsRow = document.getElementById(`details-${id}`);
		if (detailsRow) {
			detailsRow.classList.add("visible");
			detailsRow.innerHTML = `
                <td colspan="6">
                    <div>
                        <span class="hidden-data-label">Genre:</span>
                        <span content-editable="true"
                              class="edit-field genre-edit">
                            ${row.getAttribute("data-original-genre")}
                        </span>
                    </div>
                    <div>
                        <span class="hidden-data-label">Song Writer:</span>
                        <span content-editable="true"
                              class="edit-field writer-edit">
                            ${row.getAttribute("data-original-writer")}
                        </span>
                    </div>
                </td>
            `;
		}
	}
}

function cancelEdit(id) {
	const row = document.getElementById(`row-${id}`);
	if (!row) return;

	const restore = (selector, attr) => {
		const cell = row.querySelector(selector);
		if (cell) {
			cell.innerText = row.getAttribute(attr) || "";
			cell.removeAttribute("contenteditable");
		}
	};

	restore(".song_title", "data-original-title");
	restore(".artist_name", "data-original-artist");
	restore(".release_year", "data-original-year");
	restore(".genre", "data-original-genre");
	restore(".song_writer", "data-original-writer");

	const actionCell = row.querySelector(".action");
	actionCell.innerHTML = `
        <button onclick="editRow(${id})">Edit</button>
        <button onclick="deleteRow(${id})">Delete</button>
    `;
	row.classList.remove("editing");

	if (window.innerWidth > 550) return;

	const detailsRow = document.getElementById(`details-${id}`);
	if (!detailsRow) return;

	const genre = row.getAttribute("data-original-genre") || "";
	const songWriter = row.getAttribute("data-original-writer") || "";

	const detailsHTML = `
        <td colspan="6">
            <div><span class="hidden-data-label">Genre:</span>
                ${genre}</div>
            <div><span class="hidden-data-label">Song Writer:</span>
                ${songWriter}</div>
        </td>
    `;

	detailsRow.innerHTML = detailsHTML;
}

function saveRow(id) {
	const row = document.getElementById(`row-${id}`);
	if (!row) return;

	const getCellValue = (selector) =>
		row.querySelector(selector)?.innerText.trim() || "";

	let song_title = getCellValue(".song_title");
	let artist_name = getCellValue(".artist_name");
	let release_year = getCellValue(".release_year");
	let genre = getCellValue(".genre");
	let song_writer = getCellValue(".song_writer");

	if (window.innerWidth <= 550) {
		const detailsRow = document.getElementById(`details-${id}`);
		if (detailsRow) {
			genre =
				  detailsRow.querySelector(".genre-edit")?.innerText.trim() ||
				  "";
			song_writer =
				  detailsRow.querySelector(".writer-edit")?.innerText.trim() ||
				  "";
		}
	}

	if (!song_title || !artist_name || !release_year ||
	      !genre || !song_writer) {
		alert("All fields are required. Please fill out all fields.");
		return;
	}

	const body = JSON.stringify({id, song_title, artist_name, release_year,
          genre, song_writer});

	fetch(API_URL, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body,
	})
	.then((response) => response.text())
	.then((responseText) => {
		alert(responseText);
		row.classList.remove("editing");
		getData();
	})
	.catch((error) => {
		console.error("Error updating data:", error);
		alert("Error updating data: " + error.message);
	});
}

function deleteRow(id) {
	if (!confirm("Are you sure you want to delete this song?")) return;

	const body = JSON.stringify({ id });

	fetch(API_URL, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body,
	})
	.then((response) => response.text())
	.then((responseText) => {
		alert(responseText);
		getData();
	})
	.catch((error) => console.error("Error deleting data:", error));
}

window.addEventListener("resize", getData);
window.addEventListener("DOMContentLoaded", getData);