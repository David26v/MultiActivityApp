"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import supabase from "../utils/supabaseClient";

export default function TaskForm({ task, mode = "add", onClose, onTaskUpdated }) {
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isAddMode = mode === "add";

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newTask, setNewTask] = useState(task?.task || "");
  const [category, setCategory] = useState(task?.category || "General");
  const [assignedUser, setAssignedUser] = useState(task?.assigned_to || "");
  const [project, setProject] = useState(task?.project || "");
  const [dueDate, setDueDate] = useState(task?.due_date || "");
  const [isEditing, setIsEditing] = useState(isEditMode); 

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (!error) setUsers(data);
    };
    fetchUsers();

    const fetchProjects = async () => {
      const { data, error } = await supabase.from("projects").select("*");
      if (!error) setProjects(data);
    };
    fetchProjects();
  }, []);

  const handleSave = async () => {
    if (!newTask.trim() || !assignedUser) return;

    if (isEditMode) {
      // Update existing task
      const { error } = await supabase
        .from("todos")
        .update({
          task: newTask,
          category,
          assigned_to: assignedUser,
          due_date: dueDate || null,
          projects:project || null,
        })
        .eq("id", task.id);

      if (!error) {
        onTaskUpdated({ ...task, task: newTask, category, assigned_to: assignedUser, due_date: dueDate, projects });
        onClose();
      }
    } else {
      // Add new task
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) return;

      const { data, error } = await supabase
        .from("todos")
        .insert([{ 
            task: newTask, 
            category, 
            assigned_to: assignedUser, 
            due_date: dueDate || null, 
            completed: false, 
            user_id: userData.user.id, 
            projects:project || null }])
        .select("*");

      if (!error) {
        onTaskUpdated(data[0]); // Notify parent
        setNewTask("");
        setCategory("General");
        setAssignedUser("");
        setDueDate(""); 
        setProject("");
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">{isViewMode ? "View Task" : isEditMode ? "Edit Task" : "Add Task"}</h2>
          <button onClick={onClose} className="text-gray-600">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Task Input */}
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          disabled={isViewMode}
          placeholder="Task description"
          className="border p-2 w-full mb-4 text-black"
        />

        {/* Due Date Input */}
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={isViewMode}
          className="border p-2 w-full mb-4 text-black"
        />

        {/* Assigned User Dropdown */}
        <select
          value={assignedUser}
          onChange={(e) => setAssignedUser(e.target.value)}
          disabled={isViewMode}
          className="border p-2 w-full mb-4 text-black"
        >
          <option value="">Assign to...</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
          ))}
        </select>

        {/* Project Dropdown */}
        <select
          value={project}
          onChange={(e) => setProject(e.target.value)}
          disabled={isViewMode}
          className="border p-2 w-full mb-4 text-black"
        >
          <option value="">Select Project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* Buttons */}
        <div className="flex justify-between">
          <button onClick={onClose} className="bg-gray-500 text-white p-2 rounded">Close</button>
          {isViewMode ? (
            <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white p-2 rounded flex items-center">
              <FontAwesomeIcon icon={faEdit} className="mr-1" /> Edit
            </button>
          ) : (
            <button onClick={handleSave} className="bg-green-500 text-white p-2 rounded flex items-center">
              <FontAwesomeIcon icon={faSave} className="mr-1" /> Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
