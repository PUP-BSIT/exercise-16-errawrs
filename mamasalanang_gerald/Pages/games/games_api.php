<?php
$servername = "localhost";
$username = "root";
$password = "";
$database = "game_db";

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

$method = $_SERVER['REQUEST_METHOD'];
parse_str(file_get_contents("php://input"), $data);

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'create':
        $game_title = $_POST["game_title"] ?? null;
        $developer = $_POST["developer"] ?? null;
        $release_year = $_POST["release_year"] ?? null;
        $genre = $_POST["genre"] ?? null;
        $platform = $_POST["platform"] ?? null;

        if ($game_title && $developer && $release_year 
              && $genre && $platform) {
            $sql = "INSERT INTO video_games (game_title, developer, 
                          release_year, genre, platform)
                    VALUES ('$game_title', '$developer',
                          '$release_year', '$genre', '$platform')";

            if (mysqli_query($conn, $sql)) {
                echo "New video game added successfully!";
            } else {
                echo "Error: " . mysqli_error($conn);
            }
        } else {
            echo "Missing some input fields!";
        }
        break;

    case 'read':
        $sql = "SELECT * FROM video_games";
        $result = mysqli_query($conn, $sql);

        $response = [];

        while ($row = mysqli_fetch_assoc($result)) {
            array_push($response, $row);
        }

        echo json_encode($response);
        break;

    case 'update':
        $game_title = $data["game_title"] ?? '';
        $field = $data["field"] ?? '';
        $value = $data["value"] ?? '';

        if ($game_title && $field && $value) {
            $sql = "UPDATE video_games SET $field='$value' WHERE game_title=
                  '$game_title'";

            if (mysqli_query($conn, $sql)) {
                echo "Record updated successfully!";
            } else {
                echo "Error: " . mysqli_error($conn);
            }
        } else {
            echo "Missing data!";
        }
        break;

    case 'delete':
        $game_title = $data["game_title"] ?? '';

        if ($game_title) {
            $sql = "DELETE FROM video_games WHERE game_title='$game_title'";

            if (mysqli_query($conn, $sql)) {
                echo "Record deleted successfully!";
            } else {
                echo "Error: " . mysqli_error($conn);
            }
        } else {
            echo "Missing game title!";
        }
        break;

    default:
        echo "Invalid action!";
        break;
}

mysqli_close($conn);
?>
