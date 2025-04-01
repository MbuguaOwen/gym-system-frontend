import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    membership_start: "",
    membership_end: "",
  });

  useEffect(() => {
    if (loggedIn) {
      fetchMembers();
    }
  }, [loggedIn, filter]);

  const fetchMembers = async () => {
    try {
      let url = "http://127.0.0.1:8000/members";
      if (filter !== "all") {
        url += `?status=${filter}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch members");
      const data = await response.json();
      console.log("Fetched members:", data);
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      membership_start: new Date(formData.membership_start).toISOString(),
      membership_end: new Date(formData.membership_end).toISOString(),
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });
      if (!response.ok) throw new Error("Failed to add member");
      fetchMembers();
      setFormData({ name: "", email: "", phone: "", membership_start: "", membership_end: "" });
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const deleteMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/members/${memberId}`, {
        method: "DELETE",
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
        <h3 className="text-center">Admin Login</h3>
        <form onSubmit={handleLogin} className="w-50 mx-auto shadow p-4 rounded">
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
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-center">Gym Members Management</h3>

      {/* Member Registration Form */}
      <form className="mb-4 shadow p-3 rounded" onSubmit={addMember}>
        <div className="row g-2">
          <div className="col-md-2">
            <input
              type="text"
              className="form-control"
              placeholder="Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <input
              type="text"
              className="form-control"
              placeholder="Phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <input
              type="date"
              className="form-control"
              required
              value={formData.membership_start}
              onChange={(e) => setFormData({ ...formData, membership_start: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <input
              type="date"
              className="form-control"
              required
              value={formData.membership_end}
              onChange={(e) => setFormData({ ...formData, membership_end: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-success w-100">Add Member</button>
          </div>
        </div>
      </form>

      {/* Search & Filter */}
      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select className="form-select w-25" onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Members</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Members Table */}
      <table className="table table-striped shadow">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Membership Start</th>
            <th>Membership End</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {members
            .filter((m) => m.name?.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((member, index) => (
              <tr key={member.id}>
                <td>{index + 1}</td>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td>{member.phone}</td>
                <td>{new Date(member.membership_start).toLocaleDateString()}</td>
                <td>{new Date(member.membership_end).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteMember(member.id)}>Delete</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
