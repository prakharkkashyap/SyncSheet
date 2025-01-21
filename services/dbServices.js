import pool from "../config/dbConfig.js";

// Start Transaction
export const startTransaction = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    return client;
  } catch (error) {
    client.release();
    throw new Error("Failed to start transaction: " + error.message);
  }
};

// Commit Transaction
export const commitTransaction = async (client) => {
  try {
    await client.query("COMMIT");
  } catch (error) {
    throw new Error("Failed to commit transaction: " + error.message);
  } finally {
    client.release();
  }
};

// Rollback Transaction
export const rollbackTransaction = async (client) => {
  try {
    await client.query("ROLLBACK");
  } catch (error) {
    throw new Error("Failed to rollback transaction: " + error.message);
  } finally {
    client.release();
  }
};

// Create
export const createData = async (data, client = pool) => {
  const { id, name, age, city } = data;
  try {
    const result = await client.query(
      "INSERT INTO users (id ,name, age, city) VALUES ($1, $2, $3, $4) RETURNING *",
      [id, name, age, city]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

// Read
export const readData = async () => {
  try {
    const result = await pool.query("SELECT * FROM users");
    return result.rows;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update
export const updateData = async (data, client = pool) => {
  const { id, name, age, city } = data;
  try {
    const result = await client.query(
      "UPDATE users SET name = $1, age = $2, city = $3 WHERE id = $4 RETURNING *",
      [name, age, city, id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete
export const deleteData = async (id, client = pool) => {
  try {
    await client.query("DELETE FROM users WHERE id = $1", [id]);
    return { message: "Data deleted successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Implement a function to read a single user by ID
export const readDataById = async (id, client) => {
  try {
    const result = await client.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  } catch (error) {
    throw new Error("Error reading data by ID: " + error.message);
  }
};
