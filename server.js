// Complete the server.js file to make user's add, delete and update the todos.
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import Task from './task.schema.js';

export const app = express();
app.use(cors());

export const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("Connection made.");

    // Load initial tasks when a user connects
    Task.find().sort({ createdAt: -1 }).limit(10).then(tasks => {
        socket.emit('initialTasks', tasks);
    }).catch(err => {
        console.error("Error loading initial tasks:", err);
    });

    // Handle task addition
    socket.on("addTask", async (taskText) => {
        try {
            const newTask = new Task({ text: taskText });
            await newTask.save();
            io.emit("taskAdded", newTask);
        } catch (error) {
            console.error("Error adding task:", error);
        }
    });

    // Handle task deletion
    socket.on("deleteTask", async (taskId) => {
        try {
            await Task.findByIdAndDelete(taskId);
            io.emit("taskDeleted", taskId);
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("Connection disconnected.");
    });
});

