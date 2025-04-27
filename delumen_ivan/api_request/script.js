let model = document.getElementById("model");
let brand = document.getElementById("brand");
let year = document.getElementById("year");
let color = document.getElementById("color");
let idSelect = null;

const apiUrl = "api.php";

//Display car
function loadCars() {
    fetch(apiUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            const carList = document.getElementById("car_list");
            carList.innerHTML = "";

            data.forEach((car) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${car.id}</td>
                    <td>${car.model}</td>
                    <td>${car.brand}</td>
                    <td>${car.year}</td>
                    <td>${car.color}</td>
                    <td class="action-buttons">
                        <button class="edit" onclick="editCar
                            (${car.id},'${car.model}','${car.brand}',
                                '${car.year}','${car.color}')">Edit</button>
                        <button class="delete" onclick="deleteCar
                            (${car.id})">Delete</button>
                    </td>`;

                carList.appendChild(row);
            });
        })
        .catch((error) => {
            console.error("Error loading cars:", error);
        });
}

loadCars();

//Clear input
function clearInput() {
    idSelect = null;
    model.value = "";
    brand.value = "";
    year.value = "";
    color.value = "";
}

//Create new car
function createCar() {
    if (!model.value || !brand.value || !year.value || !color.value) {
        alert("Error: Please fill all required fields.");
        return;
    }

    const carData = {
        model: model.value,
        brand: brand.value,
        year: year.value,
        color: color.value,
    };

    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(carData),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                loadCars();
                clearInput();
            }
        })
        .catch((error) => {
            console.error("Error creating car:", error);
        });
}

//Update existing car
function updateCar() {
    if (
        !idSelect === null ||
        !model.value ||
        !brand.value ||
        !year.value ||
        !color.value
    ) {
        alert("No car selected for update");
        return;
    }

    const carData = {
        id: idSelect,
        model: model.value,
        brand: brand.value,
        year: year.value,
        color: color.value,
    };

    fetch(apiUrl, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(carData),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                loadCars();
                clearInput();
            }
        })
        .catch((error) => {
            console.error("Error saving car:", error);
        });
}

//Edit car
function editCar(id, carModel, carBrand, carYear, carColor) {
    idSelect = id;
    model.value = carModel;
    brand.value = carBrand;
    year.value = carYear;
    color.value = carColor;
}

//Delete Car
function deleteCar(id) {
    fetch(apiUrl, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                loadCars();
            }
        })
        .catch((error) => {
            console.error("Error deleting car:", error);
        });
}
