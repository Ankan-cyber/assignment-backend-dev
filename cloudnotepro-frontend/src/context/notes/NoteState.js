import NoteContext from "./noteContext";
import { useState } from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NoteState = (props) => {
    const host = "http://localhost:5000";
    const [notes, setNotes] = useState([]);
    const [loaded, setLoaded] = useState(false)
    const [user, setUser] = useState({ name: "", email: "", role: "user" })

    const getErrorMessage = (json, fallback = "Some error occured please try after some time") => {
        if (!json) {
            return fallback;
        }
        if (json.error && typeof json.error === "object" && json.error.message) {
            return json.error.message;
        }
        if (typeof json.error === "string") {
            return json.error;
        }
        if (json.msg) {
            return json.msg;
        }
        return fallback;
    }

    // Add a note
    const fetchNotes = async () => {

        //Api Call
        const response = await fetch(`${host}/api/v1/notes/fetch`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            },
        });
        const json = await response.json();
        if (json.success) {
            setLoaded(true)
            setNotes(json.notes)
        }
        else {
            setLoaded(true)
            toast.error(getErrorMessage(json), {
                theme: "colored",
                autoClose: 3000
            })
        }
    }

    // Add a note
    const addNote = async (title, description, tag) => {

        //Api Call
        const response = await fetch(`${host}/api/v1/notes/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ title, description, tag })
        });
        const json = await response.json();
        if (json.success) {
            setNotes(notes.concat(json.savedNote))
            toast.success("Note Added Succesfully", {
                theme: "colored",
                autoClose: 3000
            })
        }
        else {
            const validationErrors = json?.error?.details || json?.errors || [];
            if (validationErrors.length === 0) {
                toast.error(getErrorMessage(json), {
                    theme: "colored",
                    autoClose: 3000
                });
                return;
            }

            validationErrors.map((e) => {
                return toast.error(e.message || e.msg, {
                    theme: "colored",
                    autoClose: 3000
                });
            })
        }
    }

    // Delete a Note
    const deleteNote = async (id) => {
        //Api Call
        const response = await fetch(`${host}/api/v1/notes/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            },
        });
        const json = await response.json();
        if (json.success) {
            toast.success("Note has been deleted", {
                theme: "colored",
                autoClose: 3000
            })
            let newNotes = notes.filter((note) => { return note._id !== id })
            setNotes(newNotes)
        }
        else {
            toast.error(getErrorMessage(json), {
                theme: "colored",
                autoClose: 3000
            });
        }
    }

    // Edit a Note
    const editNote = async (id, title, description, tag) => {

        //Api Call
        const response = await fetch(`${host}/api/v1/notes/update/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ title, description, tag })
        });
        const json = await response.json();
        if (json.success) {
            toast.success("Succesfully Edited Note", {
                theme: "colored",
                autoClose: 3000
            })
            let newNotes = JSON.parse(JSON.stringify(notes));
            //Logic to edit in client
            for (let i = 0; i < newNotes.length; i++) {
                const element = newNotes[i];
                if (element._id === id) {
                    newNotes[i].title = title;
                    newNotes[i].description = description;
                    newNotes[i].tag = tag;
                    break;
                }
            }
            setNotes(newNotes)
        }
        else {
            toast.error(getErrorMessage(json), {
                theme: "colored",
                autoClose: 3000
            });
        }
    }

    //Get User Details
    const getUser = async () => {

        //Api Call
        const response = await fetch(`${host}/api/v1/auth/getuser`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            }
        });
        const json = await response.json();
        if (json.success) {
            setUser({ name: json.user.name, email: json.user.email, role: json.user.role || "user" })
        }
        else {
            toast.error(getErrorMessage(json), {
                theme: "colored",
                autoClose: 3000
            });
        }
    }

    //Get User Details
    const changePassword = async (name, oldpassword, newpassword) => {

        //Api Call
        const response = await fetch(`${host}/api/v1/auth/changepassword`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ name, oldpassword, newpassword })
        });
        const json = await response.json();
        if (json.success) {
            document.getElementById('accountbtn').innerText = "Redirecting ..."
            toast.success(`${json.msg} Redirecting Now`, {
                theme: "colored",
                authClose: 3000
            });
            setTimeout(() => {
                localStorage.removeItem('token')
            }, 3000)
        }
        else {
            toast.error(getErrorMessage(json), {
                theme: "colored",
                autoClose: 3000
            });
        }
    }
    //Send Reset Password Mail
    const mailReset = async (email) => {

        //Api Call
        const response = await fetch(`${host}/api/v1/auth/mailreset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });
        const json = await response.json();
        if (json.success) {
            toast.success(`${json.msg}`, {
                theme: "colored",
                authClose: 3000
            });
        }
        else {
            toast.error(getErrorMessage(json), {
                theme: "colored",
                autoClose: 3000
            });
        }
    }
    //Send Reset Password Mail
    const resetPassword = async (id, token, password) => {

        //Api Call
        const response = await fetch(`${host}/api/v1/auth/resetpassword`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, token, password })
        });
        const json = await response.json();
        if (json.success) {
            toast.success(`${json.msg}`, {
                theme: "colored",
                authClose: 3000
            });
        }
        else {
            toast.error(getErrorMessage(json), {
                theme: "colored",
                autoClose: 3000
            });
        }
    }

    const verifyAdminAccess = async () => {
        const response = await fetch(`${host}/api/v1/auth/admin/proof`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            }
        });
        const json = await response.json();
        if (json.success) {
            toast.success(json.msg, {
                theme: "colored",
                autoClose: 3000
            });
        } else {
            toast.error(getErrorMessage(json), {
                theme: "colored",
                autoClose: 3000
            });
        }
    }

    return (
        <NoteContext.Provider value={{ notes, addNote, deleteNote, editNote, fetchNotes, loaded, getUser, user, changePassword, mailReset, resetPassword, verifyAdminAccess }}>
            {props.children}
        </NoteContext.Provider>
    )
}

export default NoteState;
