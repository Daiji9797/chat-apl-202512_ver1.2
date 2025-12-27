<?php
/**
 * User モデルクラス
 */

require_once __DIR__ . '/../utils/Database.php';
require_once __DIR__ . '/../utils/Auth.php';

class User {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * ユーザーを作成
     */
    public function create($email, $password, $name = '') {
        try {
            $stmt = $this->db->prepare('INSERT INTO users (email, password, name, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())');
            
            if (!$stmt) {
                throw new Exception('Prepare failed: ' . $this->db->getConnection()->error);
            }
            
            $hashedPassword = Auth::hashPassword($password);
            $stmt->bind_param('sss', $email, $hashedPassword, $name);
            
            if (!$stmt->execute()) {
                throw new Exception('Execute failed: ' . $stmt->error);
            }
            
            return $this->db->lastInsertId();
        } catch (Exception $e) {
            error_log('User creation error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * メールアドレスでユーザーを検索
     */
    public function findByEmail($email) {
        try {
            $stmt = $this->db->prepare('SELECT id, email, password, name, created_at, updated_at FROM users WHERE email = ? LIMIT 1');
            
            if (!$stmt) {
                throw new Exception('Prepare failed: ' . $this->db->getConnection()->error);
            }
            
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                return null;
            }
            
            return $result->fetch_assoc();
        } catch (Exception $e) {
            error_log('User lookup error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * IDでユーザーを検索
     */
    public function findById($id) {
        try {
            $stmt = $this->db->prepare('SELECT id, email, name, created_at, updated_at FROM users WHERE id = ? LIMIT 1');
            
            if (!$stmt) {
                throw new Exception('Prepare failed: ' . $this->db->getConnection()->error);
            }
            
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                return null;
            }
            
            return $result->fetch_assoc();
        } catch (Exception $e) {
            error_log('User lookup error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * メールアドレスが既に存在するか確認
     */
    public function emailExists($email) {
        $user = $this->findByEmail($email);
        return $user !== null;
    }

    /**
     * ユーザーを更新
     */
    public function update($id, $data) {
        try {
            $updates = [];
            $params = [];
            $types = '';

            if (isset($data['name'])) {
                $updates[] = 'name = ?';
                $params[] = $data['name'];
                $types .= 's';
            }

            if (empty($updates)) {
                return true;
            }

            $params[] = $id;
            $types .= 'i';

            $sql = 'UPDATE users SET ' . implode(', ', $updates) . ', updated_at = NOW() WHERE id = ?';
            $stmt = $this->db->prepare($sql);

            if (!$stmt) {
                throw new Exception('Prepare failed: ' . $this->db->getConnection()->error);
            }

            $stmt->bind_param($types, ...$params);
            return $stmt->execute();
        } catch (Exception $e) {
            error_log('User update error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * ユーザーを削除
     */
    public function delete($id) {
        try {
            $stmt = $this->db->prepare('DELETE FROM users WHERE id = ?');
            
            if (!$stmt) {
                throw new Exception('Prepare failed: ' . $this->db->getConnection()->error);
            }
            
            $stmt->bind_param('i', $id);
            return $stmt->execute();
        } catch (Exception $e) {
            error_log('User deletion error: ' . $e->getMessage());
            return false;
        }
    }
}
?>
