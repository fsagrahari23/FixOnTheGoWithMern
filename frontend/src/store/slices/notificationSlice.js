import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3001") + "/api/notifications";

// Async thunks
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async ({ page = 1, limit = 20, unreadOnly = false, type = null } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (unreadOnly) params.append("unreadOnly", "true");
      if (type) params.append("type", type);
      
      const response = await axios.get(`${API_BASE}?${params}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch notifications");
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/unread-count`, {
        withCredentials: true,
      });
      return response.data.count;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch unread count");
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE}/${notificationId}/read`,
        {},
        { withCredentials: true }
      );
      return response.data.notification;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark as read");
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await axios.patch(`${API_BASE}/mark-all-read`, {}, { withCredentials: true });
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark all as read");
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (notificationId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE}/${notificationId}`, { withCredentials: true });
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete notification");
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  "notifications/clearAllNotifications",
  async ({ readOnly = false } = {}, { rejectWithValue }) => {
    try {
      const params = readOnly ? "?readOnly=true" : "";
      await axios.delete(`${API_BASE}${params}`, { withCredentials: true });
      return readOnly;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to clear notifications");
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    unreadCount: 0,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
    },
    // For popup notifications (real-time from socket)
    popupNotifications: [],
    // Loading states
    status: "idle",
    error: null,
  },
  reducers: {
    // Add a real-time notification from socket
    addRealtimeNotification: (state, action) => {
      const notification = {
        ...action.payload,
        _id: action.payload._id || `temp-${Date.now()}`,
        createdAt: action.payload.createdAt || new Date().toISOString(),
        read: false,
      };
      
      // Add to main notifications list
      state.notifications.unshift(notification);
      state.unreadCount += 1;
      
      // Add to popup queue
      state.popupNotifications.push({
        ...notification,
        showPopup: true,
      });
    },
    
    // Remove a popup notification after it's been displayed
    dismissPopup: (state, action) => {
      const id = action.payload;
      state.popupNotifications = state.popupNotifications.filter(
        (n) => n._id !== id
      );
    },
    
    // Clear all popup notifications
    clearPopups: (state) => {
      state.popupNotifications = [];
    },
    
    // Reset notifications state (e.g., on logout)
    resetNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.popupNotifications = [];
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      };
      state.status = "idle";
      state.error = null;
    },
    
    // Update unread count directly
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.notifications = action.payload.notifications;
        state.pagination = action.payload.pagination;
        state.unreadCount = action.payload.unreadCount;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (n) => n._id === action.payload._id
        );
        if (notification && !notification.read) {
          notification.read = true;
          notification.readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.read = true;
          n.readAt = new Date().toISOString();
        });
        state.unreadCount = 0;
      })
      
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(
          (n) => n._id === action.payload
        );
        if (index !== -1) {
          if (!state.notifications[index].read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(index, 1);
        }
      })
      
      // Clear all notifications
      .addCase(clearAllNotifications.fulfilled, (state, action) => {
        if (action.payload) {
          // Only cleared read notifications
          state.notifications = state.notifications.filter((n) => !n.read);
        } else {
          // Cleared all
          state.notifications = [];
          state.unreadCount = 0;
        }
      });
  },
});

export const {
  addRealtimeNotification,
  dismissPopup,
  clearPopups,
  resetNotifications,
  setUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;
