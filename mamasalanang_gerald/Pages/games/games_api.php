<?php
include "db_connection.php";

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

        if ($game_title && $developer && $release_year && $genre && $platform) {
            $stmt = mysqli_prepare($conn, "INSERT INTO video_games (game_title, developer, release_year, genre, platform) VALUES (?, ?, ?, ?, ?)");
            mysqli_stmt_bind_param($stmt, "ssiss", $game_title, $developer, $release_year, $genre, $platform);

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
        $sql = "SELECT * FROM video_games";
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
        
        $original_title = $_POST["original_title"] ?? null;
        $game_title = $_POST["game_title"] ?? null;
        $developer = $_POST["developer"] ?? null;
        $release_year = $_POST["release_year"] ?? null;
        $genre = $_POST["genre"] ?? null;
        $platform = $_POST["platform"] ?? null;
        
        if ($original_title && $game_title && $developer && $release_year && $genre && $platform) {
            $stmt = mysqli_prepare($conn, "UPDATE video_games SET game_title=?, developer=?, release_year=?, genre=?, platform=? WHERE game_title=?");
            mysqli_stmt_bind_param($stmt, "ssisss", $game_title, $developer, $release_year, $genre, $platform, $original_title);
        
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
        $game_title = $data["game_title"] ?? '';

        if ($game_title) {
            $stmt = mysqli_prepare($conn, "DELETE FROM video_games WHERE game_title=?");
            mysqli_stmt_bind_param($stmt, "s", $game_title);

            if (mysqli_stmt_execute($stmt)) {
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
