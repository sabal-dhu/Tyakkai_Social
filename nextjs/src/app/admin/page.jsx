"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import {
  Search,
  UserCheck,
  UserX,
  RefreshCw,
  LogOut,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

// API service with axios
const apiService = {
  // Base URL - replace with your actual API base URL
  baseURL: "http://localhost:8000/api",

  // Get all users
  getUsers: async () => {
    try {
      const response = await axios.get(`${apiService.baseURL}/users`);
      console.log("Fetched users:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Update user status
  updateUserStatus: async (userId, isActive) => {
    try {
      const response = await axios.patch(
        `${apiService.baseURL}/users/${userId}/status`,
        {
          active: isActive,
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId} status:`, error);
      throw error;
    }
  },
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const userRole = localStorage.getItem("user_role");
    if (!accessToken || userRole !== "admin") {
      router.push("/admin/login");
    } else {
      loadUsers();
    }
    // eslint-disable-next-line
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    setStatusMessage(null);
    try {
      const userData = await apiService.getUsers();
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error) {
      console.error("Failed to load users:", error);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
    );

    setFilteredUsers(filtered);
  };

  const handleStatusToggle = async (userId, newStatus) => {
    setUpdating(userId);
    setStatusMessage(null);
    setError(null);

    try {
      // Make API call to update user status
      const result = await apiService.updateUserStatus(userId, newStatus);

      if (result.success) {
        // Update local state
        const updatedUsers = users.map((user) =>
          user.id === userId ? { ...user, active: newStatus } : user
        );
        setUsers(updatedUsers);

        // Update filtered users
        setFilteredUsers(
          updatedUsers.filter(
            (user) =>
              !searchTerm.trim() ||
              user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.role.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );

        // Show success message
        setStatusMessage({
          type: "success",
          text: `User ${newStatus ? "activated" : "deactivated"} successfully.`,
        });
      }
    } catch (error) {
      console.error("Failed to update user status:", error);
      setError(
        `Failed to ${
          newStatus ? "activate" : "deactivate"
        } user. Please try again.`
      );
    } finally {
      setUpdating(null);
    }
  };

  const handleRefresh = () => {
    loadUsers();
  };

  const handleLogout = () => {
    // Clear user data from local storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_email");

    router.push("/");
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-600 hover:bg-purple-700";
      case "business_owner":
        return "bg-blue-600 hover:bg-blue-700";
      case "editor":
        return "bg-green-600 hover:bg-green-700";
      case "content_creator":
        return "bg-yellow-600 hover:bg-yellow-700";
      default:
        return "bg-gray-600 hover:bg-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-30 w-30 relative mr-3">
              <Image
                src="/logo-new.png"
                alt="Tyakkai Social Logo"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
            <h1 className="text-l font-semibold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium">User Management</h2>
            <div className="relative w-64">
              <Search className="absolute left-0.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* Status messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {statusMessage && (
            <div
              className={`mb-4 p-3 rounded-md flex items-center ${
                statusMessage.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-yellow-50 border border-yellow-200 text-yellow-700"
              }`}
            >
              {statusMessage.type === "success" ? (
                <UserCheck className="h-5 w-5 mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Users table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Login
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  // Loading skeletons
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <tr key={`skeleton-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="ml-4">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-48 mt-1" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-6 w-20" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-28" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-6 w-16" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-8 w-20" />
                        </td>
                      </tr>
                    ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers
                    .filter((user) => user.role !== "admin")
                    .map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-purple-700 font-medium text-sm">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`${getRoleBadgeColor(user.role)}`}>
                            {user.role.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.lastLogin)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.active ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {updating === user.id ? (
                            <div className="flex items-center text-gray-500">
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              <span>Updating...</span>
                            </div>
                          ) : user.active ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                              onClick={() => handleStatusToggle(user.id, false)}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 cursor-pointer"
                              onClick={() => handleStatusToggle(user.id, true)}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Activate
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
