import express from "express";
import cors from "cors";
import { readFileSync, writeFileSync, existsSync } from "fs";

const app = express();
const PORT = 5000;
const FILE_PATH = "./todos.json";

app.use(express.json()); // Middleware for JSON request body
app.use(cors()); // Allows requests from any origin

// Read todos from file
const readTodosFromFile = (filePath) => {
  if (existsSync(filePath)) {
    const data = readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } else {
    writeFileSync(filePath, JSON.stringify({ todos: [] }, null, 2));
    return { todos: [] };
  }
};

// Write todos to file
const writeTodosToFile = (filePath, data) => {
  writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log("Data written successfully");
};

// Get all todos
app.get("/api/todos", (req, res) => {
  const data = readTodosFromFile(FILE_PATH);
  res.json(data.todos);
});

// Add a new todo
app.post("/api/todos", (req, res) => {
  if (!req.body.text) {
    return res.status(400).json({ error: "Text is required" });
  }
  const data = readTodosFromFile(FILE_PATH);
  const newTodo = { id: Date.now(), text: req.body.text, completed: false };
  data.todos.push(newTodo);
  writeTodosToFile(FILE_PATH, data);
  res.status(201).json(newTodo);
});

// Delete a todo
app.delete("/api/todos/:id", (req, res) => {
  let data = readTodosFromFile(FILE_PATH);
  data.todos = data.todos.filter((todo) => todo.id !== parseInt(req.params.id));
  writeTodosToFile(FILE_PATH, data);
  res.json({ message: "Todo deleted" });
});

// Update todo completion status
app.patch("/api/todos/:id", (req, res) => {
  let data = readTodosFromFile(FILE_PATH);
  const id = Number(req.params.id);
  const { completed } = req.body;

  let updated = false;

  data.todos = data.todos.map((todo) => {
    if (todo.id === id) {
      updated = true;
      return { ...todo, completed };
    }
    return todo;
  });

  if (!updated) {
    return res.status(404).json({ error: "Todo not found" });
  }

  writeTodosToFile(FILE_PATH, data);
  res.json({ id, completed });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
