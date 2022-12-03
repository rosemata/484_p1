import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Nav({ session }) {
    if (!session){
        return (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: "20px"}}>
                <button><NavLink to="/">Home</NavLink></button>
                <button><NavLink to="/search">Search</NavLink></button>
            </div>
        )
    }
    else {
        return ( 
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: "20px"}}>
                <button><NavLink to="/">Home</NavLink></button>
                <button><NavLink to="/search">Search</NavLink></button>
                <button><NavLink to="/account">Update Profile</NavLink></button>
                <button><NavLink to="/upload">Upload a New Note!</NavLink></button>
            </div>
        )
    }
}