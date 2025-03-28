import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (loggedIn) fetchMembers();
  }, [loggedIn]);

  const fetchMembers = async () => {
    try {
      const response = await fetch("http://localhost:8000/members");
      if (!response.ok) throw new Error("Failed to fetch members");
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to add member");
      fetchMembers();
      setFormData({ name: "", email: "", phone: "" });
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const deleteMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      const response = await fetch(`http://localhost:8000/members/${memberId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to delete member");
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (credentials.username === "admin" && credentials.password === "admin123") {
      setLoggedIn(true);
    } else {
      alert("Invalid username or password");
    }
  };

  if (!loggedIn) {
    return (
      <div className="container mt-5">
        <h3>Admin Login</h3>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <h3 className="mb-4">Gym Members</h3>
      <form className="mb-4" onSubmit={addMember}>
        <div className="row">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <button type="submit" className="btn btn-primary">Add Member</button>
          </div>
        </div>
      </form>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <tr key={member.id}>
              <td>{index + 1}</td>
              <td>{member.name}</td>
              <td>{member.email}</td>
              <td>{member.phone}</td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteMember(member.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
