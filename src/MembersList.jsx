import { useState, useEffect } from "react";

const MembersList = () => {
    const [members, setMembers] = useState([]);
    const [filter, setFilter] = useState(""); // "active", "expired", or "" (all)

    useEffect(() => {
        fetchMembers();
    }, [filter]); // Re-fetch data when filter changes

    const fetchMembers = async () => {
        let url = "http://localhost:8000/members";
        if (filter === "active") {
            url += "?active=true";
        } else if (filter === "expired") {
            url += "?expired=true";
        }

        try {
            const response = await fetch(url);
            const data = await response.json();
            setMembers(data);
        } catch (error) {
            console.error("Error fetching members:", error);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Gym Members</h2>
            
            {/* Filter Dropdown */}
            <select
                className="border rounded p-2 mb-4"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            >
                <option value="">All Members</option>
                <option value="active">Active Members</option>
                <option value="expired">Expired Members</option>
            </select>

            {/* Members Table */}
            <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Phone</th>
                        <th className="border p-2">Start Date</th>
                        <th className="border p-2">End Date</th>
                        <th className="border p-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {members.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="text-center p-4">No members found</td>
                        </tr>
                    ) : (
                        members.map((member) => (
                            <tr key={member.id}>
                                <td className="border p-2">{member.name}</td>
                                <td className="border p-2">{member.phone_number}</td>
                                <td className="border p-2">{new Date(member.membership_start).toLocaleDateString()}</td>
                                <td className="border p-2">{new Date(member.membership_end).toLocaleDateString()}</td>
                                <td className={`border p-2 ${new Date(member.membership_end) < new Date() ? "text-red-500" : "text-green-500"}`}>
                                    {new Date(member.membership_end) < new Date() ? "Expired" : "Active"}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MembersList;
