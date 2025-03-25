"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus, faEye, faEdit } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';
import supabase from "../utils/supabaseClient";
import TaskForm from "../component/TaskForm";

export default function TodoList() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [mode, setMode] = useState("add"); // "add", "edit", "view"
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error) setUser(data.user);
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (user) fetchTasks(user.id);
  }, [user]);

  const fetchTasks = async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase.from("todos").select("*").eq("user_id", userId);
    if (!error) setTasks(data);
  };

  return (
    <div className="p-4 bg-white min-h-screen">
      <button
        onClick={() => router.push('/')}
        className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-lg"
      >
        Back to Homepage
      </button>
      <button 
        onClick={() => { setSelectedTask(null); setMode("add"); setShowModal(true); }} 
        className="bg-blue-500 text-white p-2 rounded mb-4 flex items-center"
      >
        <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Task
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-bold text-black">{task.task}</h2>
            <p className="text-sm text-gray-600">{task.due_date ? `Due: ${task.due_date}` : "No due date"}</p>

            <div className="flex justify-between mt-3">
              <button 
                onClick={() => { setSelectedTask(task); setMode("view"); setShowModal(true); }} 
                className="bg-gray-300 text-black p-2 rounded"
              >
                <FontAwesomeIcon icon={faEye} />
              </button>
              <button 
                onClick={() => { setSelectedTask(task); setMode("edit"); setShowModal(true); }} 
                className="bg-yellow-500 text-white p-2 rounded"
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button 
                onClick={async () => {
                  await supabase.from("todos").delete().eq("id", task.id);
                  fetchTasks(user.id); // Refresh tasks
                }} 
                className="bg-red-500 text-white p-2 rounded"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && <TaskForm task={selectedTask} mode={mode} onClose={() => setShowModal(false)} onTaskUpdated={fetchTasks} />}
    </div>
  );
}
