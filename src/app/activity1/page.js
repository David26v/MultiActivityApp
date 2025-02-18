'use client'
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencilAlt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import supabase from '../utils/supabaseClient';
import { useRouter } from 'next/navigation';

export default function TodoList() {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [category, setCategory] = useState('General');
    const [showModal, setShowModal] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editedTask, setEditedTask] = useState('');
    const router = useRouter();

    const checkUser = async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            console.error("Error getting user: " + error.message);
        } else {
            setUser(data.user);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

    const fetchTasks = async (userId) => {
        if (!userId) {
            console.error('User is not authenticated');
            return;
        }
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching tasks:', error.message);
        } else {
            setTasks(data);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTasks(user.id);
        }
    }, [user]);

    const addTask = async () => {
        if (newTask.trim()) {
            if (!user || !user.id) {
                console.error("User is not authenticated or user ID is missing.");
                return;
            }

            const { data, error } = await supabase
                .from('todos')
                .insert([{
                    task: newTask,
                    category: category,
                    completed: false,
                    user_id: user.id,
                }])
                .select('*');

            if (error) {
                console.error('Error adding task:', error.message);
            } else {
                setTasks([...tasks, ...data]);
                setNewTask('');
                setCategory('General');
                setShowModal(false);
            }
        }
    };

    const deleteTask = async (taskId) => {
        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', taskId);

        if (error) {
            console.error('Error deleting task:', error.message);
        } else {
            setTasks(tasks.filter(task => task.id !== taskId));
        }
    };

    const updateTask = async (taskId, updatedValues) => {
        const { data, error } = await supabase
            .from('todos')
            .update(updatedValues)
            .eq('id', taskId);

        if (error) {
            console.error('Error updating task:', error.message);
        } else {
            setTasks(tasks.map(task => task.id === taskId ? { ...task, ...updatedValues } : task));
            setEditingTaskId(null);
        }
    };

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Work':
                return 'bg-blue-300';
            case 'Personal':
                return 'bg-green-300';
            default:
                return 'bg-blue-300';
        }
    };

    return (
        <>
            {/* Modal for adding a task */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl mb-4 text-black">Add a New Task</h2>
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Task description"
                            className="border p-2 w-full mb-4 text-black"
                        />
                        <select
                            value={category}
                            onChange={handleCategoryChange}
                            className="border p-2 w-full mb-4 text-black"
                        >
                            <option value="General">General</option>
                            <option value="Work">Work</option>
                            <option value="Personal">Personal</option>
                        </select>
                        <div className="flex justify-between">
                            <button onClick={() => setShowModal(false)} className="bg-gray-500 text-white p-2 rounded">
                                Cancel
                            </button>
                            <button onClick={addTask} className="bg-blue-500 text-white p-2 rounded">
                                Add Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main UI */}
            <div className="flex min-h-screen p-4 bg-white">
                {/* Left Side: Task List */}
                <div className="flex-grow w-fit">
                    <h1 className="text-black font-bold">Your To-Do List</h1>

                    {tasks.length === 0 ? (
                        <div className="flex justify-center items-center p-4 bg-blue-700 rounded-lg mt-4">
                            <p>No tasks found. Please create a new task.</p>
                        </div>
                    ) : (
                        <table className="w-full mt-4 border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-2 text-left text-black">Task</th>
                                    <th className="p-2 text-left text-black ">Category</th>
                                    <th className="p-2 text-left text-black ">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => (
                                    <tr key={task.id} className={`border-b ${getCategoryColor(task.category)}`}>
                                        <td className="p-2">
                                            {editingTaskId === task.id ? (
                                                <input
                                                    type="text"
                                                    value={editedTask}
                                                    onChange={(e) => setEditedTask(e.target.value)}
                                                    className="border p-2 w-full"
                                                />
                                            ) : (
                                                <span className={`${task.completed ? 'line-through' : ''}`}>{task.task}</span>
                                            )}
                                        </td>
                                        <td className="p-2">
                                            {editingTaskId === task.id ? (
                                                <select
                                                    value={category}
                                                    onChange={handleCategoryChange}
                                                    className="border p-2 w-full"
                                                >
                                                    <option value="General">General</option>
                                                    <option value="Work">Work</option>
                                                    <option value="Personal">Personal</option>
                                                </select>
                                            ) : (
                                                <span>{task.category}</span>
                                            )}
                                        </td>
                                        <td className="p-2">
                                            {editingTaskId === task.id ? (
                                                <button
                                                    onClick={() => {
                                                        updateTask(task.id, { task: editedTask, category });
                                                    }}
                                                    className="text-green-500"
                                                >
                                                    Save
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => setEditingTaskId(task.id) || setEditedTask(task.task)}
                                                        className="text-blue-500 mr-2"
                                                    >
                                                        <FontAwesomeIcon icon={faPencilAlt} />
                                                    </button>
                                                    <button onClick={() => deleteTask(task.id)} className="text-red-500">
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Right Side: Buttons */}
                <div className="flex flex-col items-end ml-2">
                    <button onClick={() => router.push('/')} className="mb-4 bg-blue-500 text-white p-2 rounded">
                        Back to Homepage
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-green-500 text-white p-2 rounded"
                    >
                        Add Task
                    </button>
                </div>
            </div>
        </>
    );
}
