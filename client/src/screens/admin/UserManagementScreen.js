import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import {
  Button,
  Card,
  Divider,
  FAB,
  IconButton,
  Searchbar,
  Switch,
  TextInput,
  Snackbar,
  Provider as PaperProvider,
} from "react-native-paper";
import AppBar from "../../components/common/AppBar";
import ConfirmationModal from "../../components/common/ConfirmationModal"; // Updated Import
import styles from "../../styles/userManagementStyles";
import {
  createUser,
  deleteUser,
  getRoles,
  getUsers,
  updateUser,
} from "../../utils/axios";
import { isFormValid, validateForm } from "../../utils/validationUtils";
import { theme } from "../../utils/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]); // State to store roles
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    phoneNum: "",
    password: "",
    credits: 0,
    active: true,
    defaultLang: "EN",
    roleId: 1,
    trainerId: null, // Added
  });
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [openLang, setOpenLang] = useState(false);
  const [openRole, setOpenRole] = useState(false);
  const [openTrainer, setOpenTrainer] = useState(false); // Added

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const memoizedRoles = useMemo(() => roles, [roles]);

  // **Snackbar State for Inside Modal (Add & Update)**
  const [snackbarVisibleInside, setSnackbarVisibleInside] = useState(false);
  const [snackbarMessageInside, setSnackbarMessageInside] = useState("");
  const [snackbarTypeInside, setSnackbarTypeInside] = useState("success"); // 'success' or 'error'

  // **Snackbar State for Outside Modal (Delete)**
  const [snackbarVisibleOutside, setSnackbarVisibleOutside] = useState(false);
  const [snackbarMessageOutside, setSnackbarMessageOutside] = useState("");
  const [snackbarTypeOutside, setSnackbarTypeOutside] = useState("success"); // 'success' or 'error'

  // **Error State**
  const [errors, setErrors] = useState({});

  // **Confirmation Modal State**
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  // **Snackbar Helper Functions for Inside Modal**
  const showSnackbarInside = (message, type = "success") => {
    setSnackbarMessageInside(message);
    setSnackbarTypeInside(type);
    setSnackbarVisibleInside(true);
  };

  const hideSnackbarInside = () => {
    setSnackbarVisibleInside(false);
    // Close the Modal after Snackbar is dismissed if it's a success message
    if (snackbarTypeInside === "success") {
      setIsModalVisible(false);
      setSelectedUser(null);
      setNewUser({
        username: "",
        phoneNum: "",
        password: "",
        credits: 0,
        active: true,
        defaultLang: "EN",
        roleId: 1,
        trainerId: null, // Reset trainerId
      });
    }
  };

  // **Snackbar Helper Functions for Outside Modal**
  const showSnackbarOutside = (message, type = "success") => {
    setSnackbarMessageOutside(message);
    setSnackbarTypeOutside(type);
    setSnackbarVisibleOutside(true);
  };

  const hideSnackbarOutside = () => {
    setSnackbarVisibleOutside(false);
  };

  const languages = [
    { label: "English", value: "EN" },
    { label: "Arabic", value: "AR" },
    { label: "Hebrew", value: "HE" },
  ];

  const onDropdownOpen = (type) => {
    if (type === "lang") {
      setOpenLang(!openLang);
      setOpenRole(false);
      setOpenTrainer(false); // Close other dropdowns
    } else if (type === "role") {
      setOpenRole(!openRole);
      setOpenLang(false);
      setOpenTrainer(false); // Close other dropdowns
    } else if (type === "trainer") {
      setOpenTrainer(!openTrainer);
      setOpenLang(false);
      setOpenRole(false); // Close other dropdowns
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // **Fetch Users**
  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbarOutside("Failed to fetch users.", "error");
    }
  };

  // **Fetch Roles**
  const fetchRoles = async () => {
    try {
      const response = await getRoles();
      const roleItems = response.data.map((role) => ({
        label: role.name,
        value: role.id,
        key: role.id,
      }));
      setRoles(roleItems);
    } catch (error) {
      console.log("Errors from roles:", error);
      console.error("Error fetching roles:", error);
      showSnackbarOutside("Failed to fetch roles.", "error");
    }
  };

  // **Handle Adding a New User**
  const handleAddUser = async () => {
    const fields = {
      username: newUser.username,
      phoneNum: newUser.phoneNum,
      password: newUser.password,
      credits: newUser.credits.toString(),
      // Add other fields as needed
    };

    const validationErrors = validateForm(fields);

    if (!isFormValid(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    try {
      await createUser({
        ...newUser,
        phoneNum: stripDashes(newUser.phoneNum),
        trainerId: newUser.trainerId, // Added
      });
      fetchUsers();
      setErrors({}); // Clear errors on success
      showSnackbarInside("User created successfully!", "success");
      // The Modal will be closed after the Snackbar is dismissed via hideSnackbarInside
    } catch (error) {
      console.error("Error adding user:", error);
      showSnackbarInside("Failed to create user. Please try again.", "error");
    }
  };

  // **Handle Updating a User**
  const handleUpdateUser = async () => {
    // Prepare the fields to validate (exclude password if not changed)
    const fields = {
      username: selectedUser.username,
      phoneNum: selectedUser.phoneNum,
      credits: selectedUser.credits.toString(),
    };

    // Check if password has been changed (i.e., it's not empty)
    if (selectedUser.password && selectedUser.password.trim() !== "") {
      fields.password = selectedUser.password;
    }

    const validationErrors = validateForm(fields);

    if (!isFormValid(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Prepare the update payload
      const updateData = {
        username: selectedUser.username,
        phoneNum: stripDashes(selectedUser.phoneNum), // Remove dashes before sending
        credits: selectedUser.credits,
        active: selectedUser.active,
        defaultLang: selectedUser.defaultLang,
        roleId: selectedUser.roleId,
        trainerId: selectedUser.trainerId, // Added
      };

      // Conditionally include password if it's been changed
      if (fields.password) {
        updateData.password = fields.password;
      }
      await updateUser(selectedUser.id, updateData);
      fetchUsers();
      setErrors({}); // Clear errors on success
      showSnackbarInside("User updated successfully!", "success");
      // The Modal will be closed after the Snackbar is dismissed via hideSnackbarInside
    } catch (error) {
      console.error("Error updating user:", error);
      showSnackbarInside("Failed to update user. Please try again.", "error");
    }
  };

  // **Handle Deleting a User**
  const handleDeleteUser = (id) => {
    // Find the user to delete
    const userToDelete = users.find((user) => user.id === id);
    if (!userToDelete) {
      showSnackbarOutside("User not found.", "error");
      return;
    }

    // Define confirmation modal properties
    const modalTitle = "Delete User";
    const modalMessage = `Are you sure you want to delete the user "${userToDelete.username}"?`;

    // Store the user ID to delete
    setUserIdToDelete(id);

    // Open the confirmation modal
    setIsConfirmModalVisible(true); 
  };

  const confirmDeleteUser = async (id) => {
    if (id === null) return;
    try {
      await deleteUser(id);
      fetchUsers();
      showSnackbarOutside("User deleted successfully!", "success");
    } catch (error) {
      console.error("Failed to delete user:", error);
      showSnackbarOutside(
        "There was an error deleting the user. Please try again.",
        "error"
      );
    } finally {
      setIsConfirmModalVisible(false); 
      setUserIdToDelete(null);
    }
  };

  const cancelDeleteUser = () => {
    setIsConfirmModalVisible(false); 
    setUserIdToDelete(null);
  };

  // **Format Phone Number**
  const formatPhoneNumber = (phone) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // Ensure the length is no more than 10 digits
    const trimmed = cleaned.slice(0, 10);

    // Apply dashes (xxx-xxx-xxxx)
    if (trimmed.length > 6) {
      return `${trimmed.slice(0, 3)}-${trimmed.slice(3, 6)}-${trimmed.slice(6)}`;
    } else if (trimmed.length > 3) {
      return `${trimmed.slice(0, 3)}-${trimmed.slice(3)}`;
    } else {
      return trimmed;
    }
  };

  // **Handle Phone Number Change**
  const handlePhoneNumberChange = (text) => {
    const formattedPhoneNumber = formatPhoneNumber(text);

    if (selectedUser) {
      setSelectedUser({ ...selectedUser, phoneNum: formattedPhoneNumber });
    } else {
      setNewUser({ ...newUser, phoneNum: formattedPhoneNumber });
    }
  };

  // **Strip Dashes from Phone Number**
  const stripDashes = (phone) => {
    return phone.replace(/-/g, "");
  };

  // **Toggle Expand for User Details**
  const toggleExpand = (user) => {
    setExpandedUserId(expandedUserId === user.id ? null : user.id);
  };

  // **Handle Edit Press**
  const handleEditPress = (item) => {
    setSelectedUser({
      ...item,
      phoneNum: formatPhoneNumber(item.phoneNum),
      password: "", // Clear password field when editing
      trainerId: item.trainerId || null, // Added
    });
    setIsModalVisible(true);
  };

  // **Handle Search Input Change**
  const onChangeSearch = (query) => setSearchQuery(query); // Handler for search input

  // **Filter Users Based on Search Query (Case-Insensitive)**
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // **Render Each User Item**
  const renderItem = ({ item }) => (
    <Card style={styles.userCard}>
      <TouchableOpacity onPress={() => toggleExpand(item)} style={styles.row}>
        <Text style={[styles.cell, styles.username]}>{item.username}</Text>
        <Text style={[styles.cell, styles.phoneNumber]}>{item.phoneNum}</Text>
        <View style={[styles.cell, styles.actions]}>
          <IconButton
            icon={({ color, size }) => (
              <MaterialCommunityIcons name="pencil" color={color} size={size} />
            )}
            size={20}
            color={theme.colors.primary}
            onPress={() => handleEditPress(item)}
          />
          <IconButton
            icon={({ color, size }) => (
              <MaterialCommunityIcons name="delete" color={color} size={size} />
            )}
            size={20}
            color={theme.colors.error}
            onPress={() => handleDeleteUser(item.id)}
          />
        </View>
      </TouchableOpacity>
      {expandedUserId === item.id && (
        <View style={styles.expandedInfo}>
          <Text style={styles.infoText}>Credits: {item.credits}</Text>
          <Text style={styles.infoText}>
            Active: {item.active ? "Yes" : "No"}
          </Text>
          <Text style={styles.infoText}>
            Role: {roles.find((role) => role.value === item.roleId)?.label}
          </Text>
          <Text style={styles.infoText}>
            Default Language: {item.defaultLang}
          </Text>
          <Divider style={styles.divider} />
        </View>
      )}
    </Card>
  );

  // **Render Modal Content**
  const renderModalContent = () => (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>
        {selectedUser ? "Edit User" : "Add New User"}
      </Text>
      <TextInput
        label="Username"
        value={selectedUser ? selectedUser.username : newUser.username}
        onChangeText={(text) =>
          selectedUser
            ? setSelectedUser({ ...selectedUser, username: text })
            : setNewUser({ ...newUser, username: text })
        }
        style={styles.input}
        mode="outlined"
        error={!!errors.username}
      />
      {errors.username && (
        <Text style={styles.errorText}>{errors.username}</Text>
      )}

      <TextInput
        label="Phone Number"
        value={selectedUser ? selectedUser.phoneNum : newUser.phoneNum}
        onChangeText={handlePhoneNumberChange}
        style={styles.input}
        keyboardType="phone-pad"
        mode="outlined"
        maxLength={12}
        error={!!errors.phoneNum}
      />
      {errors.phoneNum && (
        <Text style={styles.errorText}>{errors.phoneNum}</Text>
      )}

      <View style={styles.passwordContainer}>
        <TextInput
          label="Password"
          value={selectedUser ? selectedUser.password : newUser.password}
          onChangeText={(text) =>
            selectedUser
              ? setSelectedUser({ ...selectedUser, password: text })
              : setNewUser({ ...newUser, password: text })
          }
          style={[styles.input, { flex: 1 }]}
          secureTextEntry={!passwordVisible}
          mode="outlined"
          error={!!errors.password}
        />

        <IconButton
          icon={() => (
            <MaterialCommunityIcons
              name={passwordVisible ? "eye-off" : "eye"}
              size={20}
              color={theme.colors.primary}
            />
          )}
          size={20}
          onPress={() => setPasswordVisible(!passwordVisible)}
          style={styles.passwordToggle}
        />
      </View>

      <TextInput
        label="Credits"
        value={
          selectedUser
            ? selectedUser.credits.toString()
            : newUser.credits.toString()
        }
        onChangeText={(text) => {
          let credits = parseInt(text);
          if (isNaN(credits) || credits < 0) {
            credits = 0;
          }
          selectedUser
            ? setSelectedUser({ ...selectedUser, credits })
            : setNewUser({ ...newUser, credits });
        }}
        style={styles.input}
        keyboardType="numeric"
        mode="outlined"
        placeholder="Enter credits (min 0)"
        error={!!errors.credits}
      />
      {errors.credits && <Text style={styles.errorText}>{errors.credits}</Text>}

      {/* 2. Language Dropdown */}
      <View
        style={[
          styles.dropdownContainer,
          { zIndex: 2000, elevation: 2000, position: "relative" },
        ]}
      >
        <DropDownPicker
          open={openLang}
          value={
            selectedUser ? selectedUser.defaultLang : newUser.defaultLang
          }
          items={languages}
          setOpen={() => onDropdownOpen("lang")}
          setValue={(value) =>
            selectedUser
              ? setSelectedUser({ ...selectedUser, defaultLang: value() })
              : setNewUser({ ...newUser, defaultLang: value() })
          }
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownList}
          placeholder="Select Language"
          listMode="MODAL"
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
        />
        {errors.defaultLang && (
          <Text style={styles.errorText}>{errors.defaultLang}</Text>
        )}
      </View>

      {/* 3. Role Dropdown */}
      <View
        style={[
          styles.dropdownContainer,
          { zIndex: 3000, elevation: 3000, position: "relative" },
        ]}
      >
        <DropDownPicker
          open={openRole}
          value={selectedUser ? selectedUser.roleId : newUser.roleId}
          items={memoizedRoles}
          setOpen={() => onDropdownOpen("role")}
          setValue={(value) =>
            selectedUser
              ? setSelectedUser({ ...selectedUser, roleId: value() })
              : setNewUser({ ...newUser, roleId: value() })
          }
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownList}
          placeholder="Select Role"
          listMode="MODAL"
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
        />
        {errors.roleId && (
          <Text style={styles.errorText}>{errors.roleId}</Text>
        )}
      </View>

      {/* 4. Active Switch */}
      <View style={styles.switchContainer}>
        <Text>Active</Text>
        <Switch
          color={theme.colors.primary} // Ensures Switch color matches theme
          value={selectedUser ? selectedUser.active : newUser.active}
          onValueChange={(value) =>
            selectedUser
              ? setSelectedUser({ ...selectedUser, active: value })
              : setNewUser({ ...newUser, active: value })
          }
        />
      </View>

      {/* 5. Save and Cancel Buttons */}
      <Button
        mode="contained"
        onPress={selectedUser ? handleUpdateUser : handleAddUser}
        style={styles.saveButton}
      >
        Save
      </Button>
      <Button
        mode="outlined"
        onPress={() => {
          setIsModalVisible(false);
          setErrors({});
          // Reset password field
          if (selectedUser) {
            setSelectedUser({ ...selectedUser, password: "" });
          }
        }}
        style={styles.cancelButton}
      >
        Cancel
      </Button>
    </View>
  );

  return (
    <>
      <AppBar />
      <PaperProvider theme={theme}>
        {/* **Add/Edit User Modal** */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setIsModalVisible(false);
            setErrors({});
            // Reset password field
            if (selectedUser) {
              setSelectedUser({ ...selectedUser, password: "" });
            }
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
          >
            <ScrollView
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
            >
              {renderModalContent()}
              {/* **Snackbar Inside Modal** */}
              <Snackbar
                visible={snackbarVisibleInside}
                onDismiss={hideSnackbarInside}
                duration={3000}
                style={
                  snackbarTypeInside === "success"
                    ? styles.snackbarSuccess
                    : styles.snackbarError
                }
                action={{
                  label: "Close",
                  onPress: hideSnackbarInside,
                }}
              >
                {snackbarMessageInside}
              </Snackbar>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>

        {/* **Main Content** */}
        <View style={styles.container}>
          <Searchbar
            placeholder="Search by username"
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={styles.searchBar}
            icon={({ color, size }) => (
              <MaterialCommunityIcons
                name="magnify"
                color={color}
                size={size}
              />
            )}
            clearIcon="close"
          />

          {/* **Header Row** */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Username</Text>
            <Text style={styles.headerText}>Phone Number</Text>
            <Text style={styles.headerText}>Actions</Text>
          </View>

          {/* **Users List** */}
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users found.</Text>
              </View>
            }
          />

          {/* **Floating Action Button (FAB)** */}
          <FAB
            style={styles.fab}
            icon={({ color, size }) => (
              <MaterialCommunityIcons name="plus" color={color} size={size} />
            )}
            onPress={() => {
              setNewUser({
                username: "",
                phoneNum: "",
                password: "",
                credits: 0,
                active: true,
                defaultLang: "EN",
                roleId: 1,
                trainerId: null, // Reset trainerId
              });
              setSelectedUser(null);
              setIsModalVisible(true);
            }}
          />

          {/* **Snackbar Outside Modal (Delete Actions)** */}
          <Snackbar
            visible={snackbarVisibleOutside}
            onDismiss={hideSnackbarOutside}
            duration={3000}
            style={
              snackbarTypeOutside === "success"
                ? styles.snackbarSuccess
                : styles.snackbarError
            }
            action={{
              label: "Close",
              onPress: hideSnackbarOutside,
            }}
          >
            {snackbarMessageOutside}
          </Snackbar>
        </View>

        {/* **Confirmation Modal for Delete Actions** */}
        <ConfirmationModal
          visible={isConfirmModalVisible}
          onDismiss={cancelDeleteUser}
          title="Delete User"
          message="Are you sure you want to delete this user?"
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor={theme.colors.error}
          onConfirm={() => confirmDeleteUser(userIdToDelete)}
        />
      </PaperProvider>
    </>
  );
};

export default UserManagementScreen;
