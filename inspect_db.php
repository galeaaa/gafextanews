<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=gafexta_news', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "--- TABLES ---\n";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    print_r($tables);

    foreach ($tables as $table) {
        echo "\n--- Structure of table: $table ---\n";
        $stmt = $pdo->query("DESCRIBE `$table`");
        print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    echo "\n--- Count of users ---\n";
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    echo "Users count: " . $stmt->fetchColumn() . "\n";
    
    echo "\n--- Existing user data ---\n";
    $stmt = $pdo->query("SELECT id, username, email, is_verified FROM users");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

    echo "\n--- Count of otp_verifications ---\n";
    $stmt = $pdo->query("SELECT COUNT(*) FROM otp_verifications");
    echo "OTP count: " . $stmt->fetchColumn() . "\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
