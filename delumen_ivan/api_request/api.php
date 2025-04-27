<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

//Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    return;
}

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "cars_collection"; 

$conn = mysqli_connect($servername, $username, $password, $dbname);
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

$method = $_SERVER["REQUEST_METHOD"];
switch ($method) {
    case 'GET':
        //Read operation
        $sql = "SELECT * FROM car";
        $result = mysqli_query($conn, $sql);
        
        $cars = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $cars[] = $row;
        }
        
        echo json_encode($cars);
        break;
        
    case 'POST':
        //Create operation
        $data = json_decode(file_get_contents('php://input'), true);
        
        $model = $data['model'] ?? '';
        $brand = $data['brand'] ?? '';
        $year = $data['year'] ?? 0;
        $color = $data['color'] ?? '';
        
        $sql = "INSERT INTO car (model, brand, year, color) 
                VALUES ('$model', '$brand', $year, '$color')";
        
        if (mysqli_query($conn, $sql)) {
            echo json_encode(["message" => "Car added successfully"]);
        } else {
            echo json_encode(["error" => "Error: " . mysqli_error($conn)]);
        }
        break;
        
    case 'PATCH':
        //Update operation
        $data = json_decode(file_get_contents('php://input'), true);
        
        $id = $data['id'] ?? 0;
        $model = $data['model'] ?? '';
        $brand = $data['brand'] ?? '';
        $year = $data['year'] ?? 0;
        $color = $data['color'] ?? '';
        
        $sql = "UPDATE car SET 
                model = '$model',
                brand = '$brand',
                year = $year,
                color = '$color'
                WHERE id = $id";
        
        if (mysqli_query($conn, $sql)) {
            echo json_encode(["message" => "Car updated successfully"]);
        } else {
            echo json_encode(["error" => "Error: " . mysqli_error($conn)]);
        }
        break;
        
    case 'DELETE':
        //Delete operation
        $data = json_decode(file_get_contents('php://input'), true);
        
        $id = $data['id'] ?? 0;
        
        $sql = "DELETE FROM car WHERE id = $id";
        
        if (mysqli_query($conn, $sql)) {
            echo json_encode(["message" => "Car deleted successfully"]);
        } else {
            echo json_encode(["error" => "Error: " . mysqli_error($conn)]);
        }
        break;
        
    default:
        echo json_encode(["error" => "Invalid request method"]);
        break;
}

mysqli_close($conn);
?>