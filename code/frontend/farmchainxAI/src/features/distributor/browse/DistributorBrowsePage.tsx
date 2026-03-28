import { useState, useEffect } from "react";
import {
  getAllBrowsableUsers,
  searchUsers,
  type UserProfile,
} from "../../../api/browseApi";
import UserCard from "../../../components/common/UserCard";
import UserDetailModal from "../../../components/common/UserDetailModal";
import styles from "./BrowsePage.module.css";

export default function DistributorBrowsePage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllBrowsableUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load users. Please try again."
        );
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle search
  const handleSearch = async (term: string) => {
    setSearchTerm(term);

    if (!term.trim()) {
      setFilteredUsers(users);
      return;
    }

    try {
      setError(null);
      const results = await searchUsers(term);
      setFilteredUsers(results);
    } catch (err) {
      setError("Search failed. Please try again.");
      console.error("Error searching users:", err);
    }
  };

  // Handle user card click
  const handleUserSelect = (user: UserProfile) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Supplier Network</h1>
        <p>Connect with farmers and retailers in your supply chain</p>
      </div>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className={styles.searchInput}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      {/* Results Info */}
      <div className={styles.resultInfo}>
        {filteredUsers.length > 0 ? (
          <span>
            Found <strong>{filteredUsers.length}</strong> user{" "}
            {filteredUsers.length === 1 ? "" : "s"}
          </span>
        ) : (
          !loading &&
          !error && <span className={styles.noResults}>No users found</span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading users...</p>
        </div>
      )}

      {/* Users Grid */}
      {!loading && (
        <div className={styles.grid}>
          {filteredUsers.map((user) => (
            <div
              key={user.userId}
              onClick={() => handleUserSelect(user)}
              className={styles.cardWrapper}
            >
              <UserCard user={user} onClick={() => handleUserSelect(user)} />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUsers.length === 0 && !error && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🌐</div>
          <h3>No suppliers found</h3>
          <p>
            {searchTerm
              ? "Try adjusting your search terms"
              : "Check back later for more suppliers to connect with"}
          </p>
        </div>
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
