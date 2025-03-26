import { useState, useEffect } from "react";
import "./App.css";
import { FaTrash } from "react-icons/fa";

const API_URL = "http://localhost:5000/api/todos";

function App() {
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState([]);

  // Fetch todos from the server
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch((error) => console.error("Error fetching todos:", error));
  }, []);

  // Add a new todo
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!todo.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: todo, completed: false }),
      });

      if (response.ok) {
        const newTodo = await response.json();
        setTodos([...todos, newTodo]);
        setTodo("");
      } else {
        console.error("Error adding todo:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  // Delete a todo
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

      if (response.ok) {
        setTodos((prevTodos) => prevTodos.filter((task) => task.id !== id));
      } else {
        console.error("Error deleting todo:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // Toggle task completion
  const toggleCompleted = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error(`Error updating todo: ${response.statusText}`);
      }

      const updatedTodo = await response.json();

      setTodos((prevTodos) =>
        prevTodos.map((task) =>
          task.id === id ? { ...task, completed: updatedTodo.completed } : task
        )
      );
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  return (
    <div className="container">
      <div className="todo-box">
        <h1 className="title">To-Do List</h1>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            placeholder="Enter task..."
            className="input"
          />
          <button type="submit" className="button">
            Add
          </button>
        </form>
        <ul className="todo-list">
          {todos.map((task) => (
            <li key={task.id} className="todo-item">
              <div
                className={`circle ${task.completed ? "checked" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompleted(task.id, task.completed);
                }}
              >
                {task.completed && <span className="checkmark">✔</span>}
              </div>
              <span
                className={task.completed ? "task-text completed" : "task-text"}
              >
                {task.text}
              </span>
              <FaTrash
                className="delete-icon"
                onClick={() => handleDelete(task.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
