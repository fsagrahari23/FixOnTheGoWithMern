import { createSlice } from '@reduxjs/toolkit';

// Load initial location from localStorage if available
const getInitialLocation = () => {
    const saved = localStorage.getItem('location');
    return saved ? JSON.parse(saved) : { coordinates: null, address: '' };
};

const initialState = getInitialLocation();

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        setCoordinates: (state, action) => {
            console.log('Setting coordinates in locationSlice:', action.payload);
            state.coordinates = action.payload;
            localStorage.setItem('location', JSON.stringify(state));
        },
        setAddress: (state, action) => {
            console.log('Setting address in locationSlice:', action.payload);
            state.address = action.payload;
            localStorage.setItem('location', JSON.stringify(state));
        },
        clearLocation: (state) => {
            state.coordinates = null;
            state.address = '';
            localStorage.removeItem('location');
        },
    },
});

export const { setCoordinates, setAddress, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
