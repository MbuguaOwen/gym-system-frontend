import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from 'xlsx';  // Importing xlsx library

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
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    membership_start: "",
    membership_end: "",
  });
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    if (loggedIn) {
      fetchMembers();
    }
  }, [loggedIn, filter]);

  const fetchMembers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/members");
      if (!response.ok) throw new Error("Failed to fetch members");
      const data = await response.json();
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

  const updateMember = async () => {
    const formattedData = {
      ...editFormData,
      membership_start: new Date(editFormData.membership_start).toISOString(),
      membership_end: new Date(editFormData.membership_end).toISOString(),
    };

    try {
      const response = await fetch(`http://127.0.0.1:8000/members/${selectedMember.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update member");
      }

      fetchMembers(); // Refresh list
      setSelectedMember(null); // Close modal
    } catch (error) {
      console.error("Error updating member:", error);
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

  const getMemberStatus = (membershipEndDate) => {
    const currentDate = new Date();
    const endDate = new Date(membershipEndDate);
    return endDate < currentDate ? "expired" : "active";
  };

  const logout = () => {
    setLoggedIn(false);
    setCredentials({ username: "", password: "" });
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setEditFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      membership_start: member.membership_start.slice(0, 10), // Get date in yyyy-mm-dd format
      membership_end: member.membership_end.slice(0, 10), // Get date in yyyy-mm-dd format
    });
  };

  // Function to handle exporting to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(members.map(member => ({
      Name: member.name,
      Email: member.email,
      Phone: member.phone,
      "Membership Start": new Date(member.membership_start).toLocaleDateString(),
      "Membership End": new Date(member.membership_end).toLocaleDateString(),
      Status: getMemberStatus(member.membership_end),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, "members_list.xlsx");
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Gym Members Management</h3>
        <button className="btn btn-outline-danger" onClick={logout}>Logout</button>
      </div>

      <button className="btn btn-success mb-3" onClick={exportToExcel}>Export to Excel</button>

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

      <table className="table table-striped shadow">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Membership Start</th>
            <th>Membership End</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members
            .filter((m) =>
              m.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
              (filter === "all" || getMemberStatus(m.membership_end) === filter)
            )
            .map((member, index) => (
              <tr key={member.id}>
                <td>{index + 1}</td>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td>{member.phone}</td>
                <td>{new Date(member.membership_start).toLocaleDateString()}</td>
                <td>{new Date(member.membership_end).toLocaleDateString()}</td>
                <td>{getMemberStatus(member.membership_end)}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => openEditModal(member)}
                  >
                    Edit
                  </button>
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

      {/* Edit Modal */}
      {selectedMember && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Member</h5>
                <button
                  className="btn-close"
                  onClick={() => setSelectedMember(null)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={updateMember}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editFormData.email}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.phone}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Membership Start</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editFormData.membership_start}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, membership_start: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Membership End</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editFormData.membership_end}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, membership_end: e.target.value })
                      }
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Update Member
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
