import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';
import MapPicker from '../../components/MapPicker';
import { useDispatch, useSelector } from 'react-redux';
import { setCoordinates, setAddress } from '../../store/slices/locationSlice';

export default function MechanicProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiGet('/mechanic/api/profile');
        setProfile({
          ...response.user,
          ...response.profile
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    try {
      await apiPost('/mechanic/profile', {
        name: formData.get('name'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        latitude: formData.get('latitude'),
        longitude: formData.get('longitude'),
        specialization: formData.getAll('specialization'),
        experience: formData.get('experience'),
        hourlyRate: formData.get('hourlyRate'),
      });

      // Refresh profile data
      const response = await apiGet('/mechanic/api/profile');
      setProfile({
        ...response.user,
        ...response.profile
      });

      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  // Available specialization options
  const SPECIALIZATIONS = [
    'Electrical Systems',
    'Transmission',
    'Tire Services',
    'Battery Services',
    'General Maintenance',
  ];

  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const dispatch = useDispatch();
  const locationStore = useSelector((s) => s.location);

  // When profile loads, seed the shared location store from profile if available
  useEffect(() => {
    if (profile && profile.location && Array.isArray(profile.location.coordinates)) {
      const lat = profile.location.coordinates[1];
      const lng = profile.location.coordinates[0];
      dispatch(setCoordinates({ lat, lng }));
      if (profile.address) dispatch(setAddress(profile.address));
    }
  }, [profile, dispatch]);

  const handleToggleAvailability = async () => {
    try {
      setAvailabilityLoading(true);
      // Call backend toggle endpoint. If it returns JSON with availability, use it.
      const res = await apiPost('/mechanic/toggle-availability');
      if (res && typeof res.availability !== 'undefined') {
        setProfile((p) => ({ ...p, availability: res.availability }));
      } else {
        // Fallback: re-fetch profile data
        const response = await apiGet('/mechanic/api/profile');
        setProfile({ ...response.user, ...response.profile });
      }
    } catch (err) {
      console.error('Error toggling availability', err);
      // Try to refetch profile to stay in sync
      try {
        const response = await apiGet('/mechanic/api/profile');
        setProfile({ ...response.user, ...response.profile });
      } catch (e) {
        console.error('Failed to refresh profile after toggle error', e);
      }
    } finally {
      setAvailabilityLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Error loading profile</div>;
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <div className="grid grid-cols-12 gap-6">
          {/* Left column - profile card and small map */}
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'M'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{profile.name}</h2>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">Mechanic</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full ${profile.availability ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'} text-sm font-medium`}>{profile.availability ? 'Available' : 'Unavailable'}</span>
              </div>

              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <div>
                    <div className="text-xs">Member Since</div>
                    <div className="font-medium">{new Date(profile.createdAt || Date.now()).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs">Total Jobs</div>
                    <div className="font-medium">{profile.totalJobs || 0}</div>
                  </div>
                </div>

                <div className="mt-4 flex justify-between text-sm text-gray-600">
                  <div>
                    <div className="text-xs">Experience</div>
                    <div className="font-medium">{profile.experience || 0} years</div>
                  </div>
                  <div>
                    <div className="text-xs">Hourly Rate</div>
                    <div className="font-medium text-green-700">${profile.hourlyRate ?? profile.hourlyRate === 0 ? profile.hourlyRate : '0.00'}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleToggleAvailability}
                  disabled={availabilityLoading}
                  className={`w-full py-2 rounded text-white ${profile.availability ? 'bg-rose-500' : 'bg-blue-600'} ${availabilityLoading ? 'opacity-60 cursor-wait' : ''}`}
                >
                  {availabilityLoading ? 'Updating…' : profile.availability ? 'Set as Unavailable' : 'Set as Available'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-2">Your Location</h3>
              <div className="w-full rounded-md overflow-hidden">
                <MapPicker
                  center={locationStore?.coordinates ? { lat: locationStore.coordinates.lat, lng: locationStore.coordinates.lng } : (profile.location && Array.isArray(profile.location.coordinates) ? { lat: profile.location.coordinates[1], lng: profile.location.coordinates[0] } : undefined)}
                  onChange={() => { /* overview map is read-only here */ }}
                  className="w-full h-40 rounded-md"
                />
              </div>
            </div>
          </aside>

          {/* Right column - edit form and other sections */}
          <section className="col-span-12 lg:col-span-8 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Edit Profile</h2>
                <div className="text-sm text-gray-500">Email cannot be changed</div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-8">
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input name="name" defaultValue={profile.name} className="w-full border rounded p-2" />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <input name="email" defaultValue={profile.email} disabled className="w-full border rounded p-2 bg-gray-100" />
                </div>

                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input name="phone" defaultValue={profile.phone} className="w-full border rounded p-2" />
                </div>

                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input name="address" defaultValue={profile.address} className="w-full border rounded p-2" />
                </div>

                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium mb-1">Specialization</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SPECIALIZATIONS.map((spec) => (
                      <label key={spec} className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="specialization"
                          value={spec}
                          defaultChecked={(profile.specialization || []).includes(spec)}
                          className="rounded"
                        />
                        <span className="text-sm">{spec}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Select one or more specializations</p>
                </div>

                <div className="col-span-12 md:col-span-3">
                  <label className="block text-sm font-medium mb-1">Experience (Years)</label>
                  <input name="experience" defaultValue={profile.experience} className="w-full border rounded p-2" />
                </div>

                <div className="col-span-12 md:col-span-3">
                  <label className="block text-sm font-medium mb-1">Hourly Rate ($)</label>
                  <input name="hourlyRate" defaultValue={profile.hourlyRate} className="w-full border rounded p-2" />
                </div>

                <div className="col-span-12">
                  <label className="block text-sm font-medium mb-1">Update Location</label>
                  <div className="w-full rounded-md overflow-hidden">
                    <MapPicker
                      center={locationStore?.coordinates ? { lat: locationStore.coordinates.lat, lng: locationStore.coordinates.lng } : (profile.location && Array.isArray(profile.location.coordinates) ? { lat: profile.location.coordinates[1], lng: profile.location.coordinates[0] } : undefined)}
                      onChange={async (coords) => {
                        dispatch(setCoordinates({ lat: coords.lat, lng: coords.lng }));
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
                          const data = await res.json();
                          const display = data.display_name || '';
                          dispatch(setAddress(display));
                        } catch (err) {
                          console.error('Reverse geocode error:', err);
                        }
                      }}
                    />
                  </div>
                  {/* hidden inputs so formData picks them up - prefer shared location coords, fall back to profile */}
                  <input type="hidden" name="latitude" value={locationStore?.coordinates?.lat ?? (profile.location && Array.isArray(profile.location.coordinates) ? profile.location.coordinates[1] : '')} />
                  <input type="hidden" name="longitude" value={locationStore?.coordinates?.lng ?? (profile.location && Array.isArray(profile.location.coordinates) ? profile.location.coordinates[0] : '')} />
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!navigator.geolocation) {
                          alert('Geolocation is not supported by your browser');
                          return;
                        }
                        navigator.geolocation.getCurrentPosition(async (pos) => {
                          const { latitude, longitude } = pos.coords;
                          dispatch(setCoordinates({ lat: latitude, lng: longitude }));
                          try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                            const data = await res.json();
                            const display = data.display_name || '';
                            dispatch(setAddress(display));
                          } catch (err) {
                            console.error('Reverse geocode error:', err);
                          }
                        }, (err) => {
                          console.error('Geolocation error', err);
                          alert('Unable to retrieve current location');
                        }, { enableHighAccuracy: true });
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 border rounded text-blue-600"
                    >
                      Use My Current Location
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded">Save Changes</button>
                <a href="/mechanic/dashboard" className="inline-block px-4 py-2 border rounded text-gray-700">← Back to Dashboard</a>
              </div>
            </form>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                try {
                  await apiPost('/mechanic/change-password', {
                    currentPassword: fd.get('currentPassword'),
                    newPassword: fd.get('newPassword'),
                    confirmPassword: fd.get('confirmPassword'),
                  });
                  alert('Password updated');
                } catch (err) {
                  console.error(err);
                  alert('Failed to update password');
                }
              }} className="space-y-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-12">
                    <label className="block text-sm font-medium mb-1">Current Password</label>
                    <input type="password" name="currentPassword" className="w-full border rounded p-2" />
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <label className="block text-sm font-medium mb-1">New Password</label>
                    <input type="password" name="newPassword" className="w-full border rounded p-2" />
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                    <input type="password" name="confirmPassword" className="w-full border rounded p-2" />
                  </div>
                </div>
                <div>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update Password</button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Certifications</h3>
              <div className="min-h-20 flex items-center justify-center text-gray-500">No certifications added yet.</div>
              <div className="mt-4">
                <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded">+ Add Certification</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
