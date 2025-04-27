<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$servername = "localhost";
$username = "root";
$password = "";
$database = "collection_db";

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'create':
        if ($method !== 'POST') {
            http_response_code(405);
            echo "Method not allowed!";
            exit;
        }

        $game_title = $_POST["game_title"] ?? null;
        $developer = $_POST["developer"] ?? null;
        $release_year = $_POST["release_year"] ?? null;
        $genre = $_POST["genre"] ?? null;
        $platform = $_POST["platform"] ?? null;

        if ($game_title && $developer && $release_year &&
              $genre && $platform) {
            $stmt = mysqli_prepare($conn, "INSERT INTO video_game (game_title,
                  developer, release_year, genre, platform)
                  VALUES (?, ?, ?, ?, ?)");
            mysqli_stmt_bind_param($stmt, "ssiss", $game_title, $developer,
                  $release_year, $genre, $platform);

            if (mysqli_stmt_execute($stmt)) {
                echo "New video game added successfully!";
            } else {
                echo "Error: " . mysqli_error($conn);
            }
        } else {
            echo "Missing some input fields!";
        }
        break;

    case 'read':
        $sql = "SELECT * FROM video_game";
        $result = mysqli_query($conn, $sql);
        $response = [];

        while ($row = mysqli_fetch_assoc($result)) {
            $response[] = $row;
        }

        echo json_encode($response);
        break;

    case 'update':
        if ($method !== 'POST') {
            http_response_code(405);
            echo "Method not allowed!";
            exit;
        }
        
        $id = $_POST["id"] ?? null;
        $game_title = $_POST["game_title"] ?? null;
        $developer = $_POST["developer"] ?? null;
        $release_year = $_POST["release_year"] ?? null;
        $genre = $_POST["genre"] ?? null;
        $platform = $_POST["platform"] ?? null;
        
        if ($id && $game_title && $developer && $release_year &&
              $genre && $platform) {
            $stmt = mysqli_prepare($conn, "UPDATE video_game SET game_title=?,
                  developer=?, release_year=?, genre=?, platform=? 
                  WHERE id=?");
            mysqli_stmt_bind_param($stmt, "ssissi", $game_title, $developer,
                  $release_year, $genre, $platform, $id);
        
            if (mysqli_stmt_execute($stmt)) {
                echo "Record updated successfully!";
            } else {
                echo "Error: " . mysqli_error($conn);
            }
        } else {
            echo "Missing data!";
        }
        break;

    case 'delete':
        parse_str(file_get_contents("php://input"), $data);
        $id = $data["id"] ?? null;

        if ($id) {
            $stmt = mysqli_prepare($conn, "DELETE FROM video_game WHERE id=?");
            mysqli_stmt_bind_param($stmt, "i", $id);

            if (mysqli_stmt_execute($stmt)) {
                echo "Record deleted successfully!";
            } else {
                echo "Error: " . mysqli_error($conn);
            }
        } else {
            echo "Missing game ID!";
        }
        break;

    default:
        echo "Invalid action!";
        break;
}

mysqli_close($conn);
?>