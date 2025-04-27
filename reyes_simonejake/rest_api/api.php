<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

define('DATABASE_HOST', '127.0.0.1');
define('DATABASE_USERNAME', 'root');
define('DATABASE_PASSWORD', '');
define('DATABASE_NAME', 'anime_db');

// Establish database connection
$connection = new mysqli(
    DATABASE_HOST, 
    DATABASE_USERNAME, 
    DATABASE_PASSWORD, 
    DATABASE_NAME);

// Check if connection was successful
if ($connection->connect_error) {
    http_response_code(500);
    echo json_encode([
          'status' => 'error',
          'message' => 'Connection failed: ' . $connection->connect_error
    ]);
    exit;
}

// Determine request type and get input data
$requestMethod = $_SERVER['REQUEST_METHOD'];
$inputData = json_decode(file_get_contents("php://input"), true);

// Route request 
switch ($requestMethod) {
    case 'GET':
        getAnime($connection);
        break;

    case 'POST':
        addAnime($connection, $inputData);
        break;

    case 'DELETE':
        deleteAnime($connection, $inputData);
        break;

    case 'PATCH':
        updateAnime($connection, $inputData);
        break;

    default:
        sendError(405, 'HTTP method not supported');
        break;
}

$connection->close();

function getAnime($connection) 
{
    if (isset($_GET['id'])) {
        $animeId = intval($_GET['id']);
        $query = "SELECT * FROM anime WHERE id = ?";
        $statement = $connection->prepare($query);
        
        if (!$statement) {
            sendError(500, 'Database query preparation failed');
            return;
        }
        
        $statement->bind_param("i", $animeId);
        $statement->execute();
        $resultSet = $statement->get_result();
        
        // Process query results
        $animeList = [];
        if ($resultSet->num_rows > 0) {
            while ($animeRecord = $resultSet->fetch_assoc()) {
                $animeList[] = $animeRecord;
            }
        }
        
        echo json_encode($animeList);
        $statement->close();
    } 
    else {
        $query = "SELECT * FROM anime ORDER BY id DESC";
        $resultSet = $connection->query($query);
        $animeList = [];
        if ($resultSet && $resultSet->num_rows > 0) {
            while ($animeRecord = $resultSet->fetch_assoc()) {
                $animeList[] = $animeRecord;
            }
        }
        echo json_encode($animeList);
    }
}

function addAnime($connection, $inputData) 
{
    if (!validateAnime($inputData)) {
        sendError(400, 'Missing or invalid required fields');
        return;
    }

    $query = "INSERT INTO anime (title, genre, episode, studio, rating) 
          VALUES (?, ?, ?, ?, ?)";
    $statement = $connection->prepare($query);
    
    if (!$statement) {
        sendError(500, 'Database insert preparation failed');
        return;
    }

    $title = trim($inputData['title']);
    $genre = trim($inputData['genre']);
    $episode = intval($inputData['episode']);
    $studio = trim($inputData['studio']);
    $rating = $inputData['rating'];

    $statement->bind_param(
          "ssiss", 
          $title, 
          $genre, 
          $episode, 
          $studio, 
          $rating
    );
    
    if ($statement->execute()) {
        $newId = $connection->insert_id;
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Anime added successfully', 
            'animeId' => $newId
        ]);
    } else {
        sendError(500, 'Failed to save anime record');
    }
    
    $statement->close();
}

function deleteAnime($connection, $inputData) 
{
    if (!$inputData || !isset($inputData['id'])) {
        sendError(400, 'Missing anime ID for deletion');
        return;
    }

    $animeId = intval($inputData['id']);

    $query = "DELETE FROM anime WHERE id = ?";
    $statement = $connection->prepare($query);
    
    if (!$statement) {
        sendError(500, 'Database delete preparation failed');
        return;
    }
    
    $statement->bind_param("i", $animeId);

    if ($statement->execute()) {
        if ($statement->affected_rows > 0) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Anime deleted successfully',
                'deletedAnimeId' => $animeId
            ]);
        } else {
            sendError(404, 'Anime record not found');
        }
    } else {
        sendError(500, 'Failed to delete anime record');
    }
    
    $statement->close();
}

function updateAnime($connection, $inputData) 
{
    // Validate all required fields and ID
    if (!validateAnime($inputData) || !isset($inputData['id'])) {
        sendError(400, 'Missing or invalid required fields');
        return;
    }

    $animeId = intval($inputData['id']);
    $checkQuery = "SELECT id FROM anime WHERE id = ?";
    $checkStatement = $connection->prepare($checkQuery);
    
    if (!$checkStatement) {
        sendError(500, 'Database verification failed');
        return;
    }
    
    $checkStatement->bind_param("i", $animeId);
    $checkStatement->execute();
    $checkResult = $checkStatement->get_result();
 
    if ($checkResult->num_rows === 0) {
        sendError(404, 'Anime record not found');
        $checkStatement->close();
        return;
    }
    
    $checkStatement->close();
    $query = "UPDATE anime SET title = ?, genre = ?, episode = ?, 
          studio = ?, rating = ? WHERE id = ?";
    $statement = $connection->prepare($query);
    
    if (!$statement) {
        sendError(500, 'Database update preparation failed');
        return;
    }

    $title = trim($inputData['title']);
    $genre = trim($inputData['genre']);
    $episode = intval($inputData['episode']);
    $studio = trim($inputData['studio']);
    $rating = $inputData['rating'];
    
    // Bind parameters and execute update
    $statement->bind_param(
          "ssissi", 
          $title, 
          $genre, 
          $episode, 
          $studio, 
          $rating, 
          $animeId
    );
    
    if ($statement->execute()) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Anime updated successfully',
            'updatedAnimeId' => $animeId
        ]);
    } else {
        sendError(500, 'Failed to update anime record');
    }
    
    $statement->close();
}

function validateAnime($inputData) 
{
    if (!$inputData) {
        return false;
    }

    $requiredFields = ['title', 'genre', 'episode', 'studio', 'rating'];
    foreach ($requiredFields as $field) {
        if (!isset($inputData[$field])) {
            return false;
        }
    }
    
    if (empty(trim($inputData['title'])) || empty(trim($inputData['genre'])) || 
          empty(trim($inputData['studio']))) {
        return false;
    }
    
    if (!is_numeric($inputData['episode']) || 
          intval($inputData['episode']) < 0) {
        return false;
    }
    
    if (!is_numeric($inputData['rating']) || 
          floatval($inputData['rating']) < 0 || 
          floatval($inputData['rating']) > 10) {
        return false;
    }
    return true;
}

function sendError($code, $message) 
{
    http_response_code($code);
    echo json_encode([
        'status' => 'error',
        'message' => $message
    ]);
}
?>