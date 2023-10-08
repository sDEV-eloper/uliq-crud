import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { FaSearch } from "react-icons/fa";

// Axios instance for API request
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
});

function App() {
  // State variables
  const [users, setUsers] = useState([]); // User data
  const [selectedUser, setSelectedUser] = useState(null); // Selected user for edit
  const [formData, setFormData] = useState({
    // Form data for user input
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profileImage: null,
  });
  const [searchQuery, setSearchQuery] = useState(""); // Search filter

  // Fetch users data from API
  useEffect(() => {
    axiosInstance.get("/api/users").then((response) => {
      setUsers(response.data);
    });
  }, []);

  // Handle input changes in user form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file input change for profile image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, profileImage: file });
  };

  // Handle user edit button
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      profileImage: null,
    });
  };

  // Handle user delete button
  const handleDeleteClick = (userId) => {
    axiosInstance
      .delete(`/api/users/${userId}`)
      .then(() => {
        setUsers(users.filter((user) => user._id !== userId));
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Handle form submission (create/update user)
  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("firstName", formData.firstName);
    formDataToSend.append("lastName", formData.lastName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("profileImage", formData.profileImage);

    if (selectedUser) {
      // If selectedUser is not null, means we are updating an existing user
      axiosInstance
        .put(`/api/users/${selectedUser._id}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          // Update user data in the users state
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user._id === selectedUser._id ? response.data : user
            )
          );
          setSelectedUser(null);
          // Reset the form data to original
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            profileImage: null,
          });
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      // If selectedUser is null, means we are creating a new user
      axiosInstance
        .post("/api/users", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          // Add the new user to the users state
          setUsers([...users, response.data]);
          // Reset the form data
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            profileImage: null,
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  console.log("FILTER", filteredUsers)
  return (
    <div className="App">
      <h1 className="heading">CRUD App</h1>

      {/* User input form */}
      <form onSubmit={handleSubmit} className="form-container">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleInputChange}
          className="form-input"
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleInputChange}
          className="form-input"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          className="form-input"
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="form-input"
          required
        />
        <input
          type="file"
          name="profileImage"
          onChange={handleFileChange}
          className="form-input"
          required
        />
        <button type="submit" className="submit-button">
          Save
        </button>
      </form>

      {/* User list with search functionality */}
      <div className="user-list">
        <h2 className="heading">User List</h2>
        <div className="search-input-container">
          <input
            type="text"
            placeholder="(Filter) Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <FaSearch className="search-icon" />
        </div>
        {filteredUsers.map((user) => (
          <div key={user._id} className="user-item">
           <img
  src={`http://localhost:8080/${user.profileImage}`}
  alt={`${user.firstName}'s profile`}
  className="user-avatar"
/>

            <div>
              <h3 className="text-lg font-semibold">
                {`${user.firstName} ${user.lastName}`}
              </h3>
              <p>Email: {user.email}</p>
              <p>Phone: {user.phone}</p>
            </div>
            <div className="user-actions">
              <button
                onClick={() => handleEditClick(user)}
                className="action-button"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(user._id)}
                className="action-button delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
