"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faComment, faPlus, faImage } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import supabase from "../utils/supabaseClient";

export default function TodoList() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [category, setCategory] = useState("General");
  const [assignedUser, setAssignedUser] = useState("");
  const [project,setProject] = useState('')
  const [dueDate, setDueDate] = useState("");
  const [image, setImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error) setUser(data.user);
    };
    checkUser();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (!error) setUsers(data);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (user) fetchTasks(user.id);
  }, [user]);

  useEffect(()=>{
    const fetchProject = async () => {
        const { data, error } = await supabase.from("projects").select("*");
        setProject(data);
    }
    fetchProject()
  })

 

  const fetchTasks = async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase.from("todos").select("*").eq("user_id", userId);
    if (!error) setTasks(data);
  };

  const addTask = async () => {
    if (newTask.trim() && assignedUser) {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from("todos")
        .insert([{ 
          task: newTask, 
          category, 
          assigned_to: assignedUser, 
          due_date: dueDate || null, 
          completed: false, 
          user_id: user.id ,
          project:project
        }])
        .select("*");

      if (error) {
        console.error("Supabase Insert Error:", error.message);
        return;
      }
  
      setTasks([...tasks, ...data]);
      setNewTask("");
      setCategory("General");
      setAssignedUser("");
      setDueDate(""); 
      setProject("");
      setShowModal(false);
    }
  };
  

  

  const deleteTask = async (taskId) => {
    const { error } = await supabase.from("todos").delete().eq("id", taskId);
    if (!error) setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Tasks</h1>
      <button onClick={() => router.push('/')} className="mb-4 bg-blue-500 text-white p-2 rounded">
        Back to Homepage
      </button>
      
      {/* Task Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white shadow-md p-4 rounded-lg" onClick={() => handleTaskClick(task)}>
            <h2 className="text-lg font-semibold text-black" >{task.task}</h2>
            <p className="text-sm text-gray-600">Category: {task.category}</p>
            <p className="text-sm text-gray-500">Assigned To: {users.find((u) => u.id === task.assigned_to)?.name || "Unassigned"}</p>
            <p className="text-sm text-gray-500">Due Date: {task.due_date || "No due date"}</p>
            <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="mt-4 text-red-500 text-sm flex items-center">
              <FontAwesomeIcon icon={faTrash} className="mr-1" />
              Delete
            </button>
          </div>
        ))}
      </div>
      
      {/* Add Task Button */}
      <div className="mt-6">
        <button onClick={() => setShowModal(true)} className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center">
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Task
        </button>
      </div>
      
      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-xl font-bold text-black mb-4">Add a New Task</h2>
            <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Task description" className="border p-2 w-full mb-4 text-black" />
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="border p-2 w-full mb-4 text-black" />
            
            <select value={assignedUser || ""} onChange={(e) => setAssignedUser(e.target.value)} className="border p-2 w-full mb-4 text-black">
              <option value="">Assign to...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
              ))}
            </select>

            <select value={assignedUser || ""} onChange={(e) => setProject(e.target.value)} className="border p-2 w-full mb-4 text-black">
              <option value="">Project</option>
              {project.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>

            <div className="flex justify-between">
              <button onClick={() => setShowModal(false)} className="bg-gray-500 text-white p-2 rounded">Cancel</button>
              <button onClick={addTask} className="bg-blue-500 text-white p-2 rounded">Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
