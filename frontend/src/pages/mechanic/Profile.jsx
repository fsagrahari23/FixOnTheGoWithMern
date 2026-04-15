import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPostForm } from '../../lib/api';
import MapPicker from '../../components/MapPicker';
import { useDispatch, useSelector } from 'react-redux';
import { setCoordinates, setAddress } from '../../store/slices/locationSlice';
import { validate } from '../../lib/validation';

export default function MechanicProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [pwdErrors, setPwdErrors] = useState({});
  const [showAllCertifications, setShowAllCertifications] = useState(false);

  // Controlled form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    experience: '',
    hourlyRate: '',
    specialization: [],
    certifications: []
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiGet('/mechanic/api/profile');
        const profileData = {
          ...response.user,
          ...response.profile
        };
        setProfile(profileData);
        setFetchError(null);
        // Update form data when profile loads
        setFormData({
          name: profileData.name || '',
          phone: profileData.phone || '',
          address: profileData.address || profileData.location?.address || '',
          experience: profileData.experience || '',
          hourlyRate: profileData.hourlyRate || '',
          specialization: profileData.specialization || [],
          certifications: profileData.certifications || []
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setFetchError('Failed to load profile. Please ensure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const submittedFormData = new FormData(event.target);

    const values = {
      name: submittedFormData.get('name')?.toString() || '',
      phone: submittedFormData.get('phone')?.toString() || '',
      address: submittedFormData.get('address')?.toString() || '',
      latitude: submittedFormData.get('latitude'),
      longitude: submittedFormData.get('longitude'),
      specialization: formData.specialization || [],
      experience: submittedFormData.get('experience'),
      hourlyRate: submittedFormData.get('hourlyRate'),
    };

    const cleanedCertifications = (formData.certifications || [])
      .map((cert) => ({
        name: (cert?.name || '').trim(),
        issuer: (cert?.issuer || '').trim(),
        year: cert?.year ? Number.parseInt(cert.year, 10) : undefined,
        imageUrl: cert?.imageUrl || '',
        verificationStatus: cert?.verificationStatus || 'pending',
      }))
      .filter((cert) => cert.name || cert.issuer || cert.year || cert.imageUrl);

    const rules = {
      name: [{ type: 'required', message: 'Name is required' }, { type: 'minLength', min: 2 }, { type: 'name' }],
      phone: [{ type: 'required', message: 'Phone is required' }, { type: 'phone' }],
      address: [{ type: 'required', message: 'Address is required' }],
      specialization: [{ type: 'required', message: 'Select at least one specialization' }],
      experience: [{ type: 'required', message: 'Experience is required' }, { type: 'number' }, { type: 'min', min: 0 }],
      hourlyRate: [{ type: 'required', message: 'Hourly rate is required' }, { type: 'number' }, { type: 'min', min: 0 }],
      latitude: [{ type: 'required', message: 'Latitude is required' }],
      longitude: [{ type: 'required', message: 'Longitude is required' }],
    };

    const { errors, isValid } = validate(values, rules);
    if (!values.specialization || values.specialization.length === 0) {
      errors.specialization = 'Select at least one specialization';
    }
    setFormErrors(errors);
    if (!isValid || Object.keys(errors).length > 0) {
      const first = Object.keys(errors)[0];
      const el = document.querySelector(`[name="${first}"]`);
      if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      const payload = new FormData();
      payload.append('name', values.name);
      payload.append('phone', values.phone);
      payload.append('address', values.address);
      payload.append('latitude', values.latitude ?? '');
      payload.append('longitude', values.longitude ?? '');
      values.specialization.forEach((spec) => payload.append('specialization', spec));
      payload.append('experience', values.experience ?? '');
      payload.append('hourlyRate', values.hourlyRate ?? '');
      payload.append('certifications', JSON.stringify(cleanedCertifications));

      (formData.certifications || []).forEach((cert, index) => {
        if (cert?.file) {
          payload.append(`certFile_${index}`, cert.file);
        }
      });

      await apiPostForm('/mechanic/profile', payload);

      // Refresh profile data
      const response = await apiGet('/mechanic/api/profile');
      const updatedProfile = {
        ...response.user,
        ...response.profile
      };
      setProfile(updatedProfile);
      
      // Update form data to show the updated values
      setFormData({
        name: updatedProfile.name || '',
        phone: updatedProfile.phone || '',
        address: updatedProfile.address || updatedProfile.location?.address || '',
        experience: updatedProfile.experience || '',
        hourlyRate: updatedProfile.hourlyRate || '',
        specialization: updatedProfile.specialization || [],
        certifications: updatedProfile.certifications || []
      });

      // Broadcast that profile was updated so dashboard can refresh its summary
      try {
        window.dispatchEvent(new CustomEvent('mechanic:profile-updated'));
      } catch (_) {
        // no-op if window not available
      }

      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      let message = 'Failed to update profile';
      try {
        if (error?.body) {
          const parsed = JSON.parse(error.body);
          if (parsed?.message) {
            message = parsed.message;
          }
        }
      } catch (_) {
        // Keep default message when non-JSON body
      }
      alert(message);
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
  const certifications = profile.certifications || [];

  const updateCertification = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) =>
        i === index ? { ...cert, [field]: value } : cert
      ),
    }));
  };

  const addCertification = () => {
    setFormData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuer: '', year: '', imageUrl: '', verificationStatus: 'pending', file: null }],
    }));
  };

  const removeCertification = (index) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        {fetchError && (
          <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700">
            {fetchError}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Left column - profile card and small map */}
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            {/* Detailed Profile Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Profile Details</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between"><span className="text-gray-500">Full Name</span><span className="font-medium">{profile.name || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{profile.email || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Mobile</span><span className="font-medium">{profile.phone || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Address</span><span className="font-medium text-right truncate max-w-[60%]">{profile.address || (profile.location && profile.location.address) || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Experience</span><span className="font-medium">{profile.experience || 0} years</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Hourly Rate</span><span className="font-medium">₹{(profile.hourlyRate ?? 0).toFixed ? Number(profile.hourlyRate).toFixed(2) : profile.hourlyRate}</span></div>
                <div>
                  <div className="text-gray-500">Specialization</div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(profile.specialization && profile.specialization.length > 0) ? (
                      profile.specialization.map((spec, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">{spec}</span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Certifications</div>
                  <div className="mt-1 space-y-2">
                    {certifications.length > 0 ? (
                      certifications.slice(0, 2).map((cert, idx) => (
                        <div key={idx} className="text-xs border rounded p-2">
                          <div className="font-medium text-gray-800">{cert.name || 'Certification'}</div>
                          <div className="text-gray-600">{cert.issuer || '-'} {cert.year ? `(${cert.year})` : ''}</div>
                          <div className="text-amber-600">Status: {cert.verificationStatus || 'pending'}</div>
                          {cert.imageUrl ? (
                            <a href={cert.imageUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">View certificate</a>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowAllCertifications(true)}
                      className="text-xs text-blue-600 underline"
                    >
                      View All Certifications ({certifications.length})
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
                    <div className="font-medium text-green-700">₹{profile.hourlyRate ?? profile.hourlyRate === 0 ? profile.hourlyRate : '0.00'}</div>
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
            <form id="mechanic-profile-form" onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Edit Profile</h2>
                <div className="text-sm text-gray-500">Email cannot be changed</div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-8">
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input 
                    name="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded p-2" 
                    disabled={!profile}
                  />
                  {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <input name="email" value={profile?.email || ''} disabled className="w-full border rounded p-2 bg-gray-100" />
                </div>

                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input 
                    name="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border rounded p-2" 
                    disabled={!profile}
                  />
                  {formErrors.phone && <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>}
                </div>

                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input 
                    name="address" 
                    value={formData.address} 
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border rounded p-2" 
                    disabled={!profile}
                  />
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
                          checked={formData.specialization.includes(spec)}
                          onChange={(e) => {
                            const newSpec = e.target.checked
                              ? [...formData.specialization, spec]
                              : formData.specialization.filter(s => s !== spec);
                            setFormData({ ...formData, specialization: newSpec });
                          }}
                          className="rounded"
                          disabled={!profile}
                        />
                        <span className="text-sm">{spec}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Select one or more specializations</p>
                  {formErrors.specialization && <p className="text-sm text-red-600 mt-1">{formErrors.specialization}</p>}
                </div>

                <div className="col-span-12 md:col-span-3">
                  <label className="block text-sm font-medium mb-1">Experience (Years)</label>
                  <input 
                    name="experience" 
                    value={formData.experience} 
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full border rounded p-2" 
                    disabled={!profile}
                  />
                  {formErrors.experience && <p className="text-sm text-red-600 mt-1">{formErrors.experience}</p>}
                </div>

                <div className="col-span-12 md:col-span-3">
                  <label className="block text-sm font-medium mb-1">Hourly Rate (₹)</label>
                  <input 
                    name="hourlyRate" 
                    value={formData.hourlyRate} 
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    className="w-full border rounded p-2" 
                    disabled={!profile}
                  />
                  {formErrors.hourlyRate && <p className="text-sm text-red-600 mt-1">{formErrors.hourlyRate}</p>}
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
                  {(formErrors.latitude || formErrors.longitude) && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.latitude || formErrors.longitude}</p>
                  )}
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
                const values = {
                  currentPassword: fd.get('currentPassword')?.toString() || '',
                  newPassword: fd.get('newPassword')?.toString() || '',
                  confirmPassword: fd.get('confirmPassword')?.toString() || '',
                };
                const rules = {
                  currentPassword: [{ type: 'required' }, { type: 'minLength', min: 6 }],
                  newPassword: [{ type: 'required' }, { type: 'minLength', min: 6 }],
                  confirmPassword: [{ type: 'required' }, { validate: (v, all) => v === all.newPassword, message: 'Passwords do not match' }],
                };
                const { errors, isValid } = validate(values, rules);
                setPwdErrors(errors);
                if (!isValid) return;
                try {
                  await apiPost('/mechanic/change-password', values);
                  alert('Password updated');
                } catch (err) {
                  console.error(err);
                  let message = 'Failed to update password';
                  try {
                    if (err?.body) {
                      const parsed = JSON.parse(err.body);
                      if (parsed?.message) {
                        message = parsed.message;
                      }
                    }
                  } catch (_) {
                    // Keep default message
                  }
                  alert(message);
                }
              }} className="space-y-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-12">
                    <label className="block text-sm font-medium mb-1">Current Password</label>
                    <input type="password" name="currentPassword" className="w-full border rounded p-2" />
                    {pwdErrors.currentPassword && <p className="text-sm text-red-600 mt-1">{pwdErrors.currentPassword}</p>}
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <label className="block text-sm font-medium mb-1">New Password</label>
                    <input type="password" name="newPassword" className="w-full border rounded p-2" />
                    {pwdErrors.newPassword && <p className="text-sm text-red-600 mt-1">{pwdErrors.newPassword}</p>}
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                    <input type="password" name="confirmPassword" className="w-full border rounded p-2" />
                    {pwdErrors.confirmPassword && <p className="text-sm text-red-600 mt-1">{pwdErrors.confirmPassword}</p>}
                  </div>
                </div>
                <div>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update Password</button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Certifications</h3>

              {formData.certifications.length === 0 ? (
                <div className="min-h-20 flex items-center justify-center text-gray-500">No certifications added yet.</div>
              ) : (
                <div className="space-y-3">
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end border rounded p-3">
                      <div className="col-span-12 md:col-span-4">
                        <label className="block text-sm font-medium mb-1">Certification</label>
                        <input
                          value={cert.name || ''}
                          onChange={(e) => updateCertification(index, 'name', e.target.value)}
                          className="w-full border rounded p-2"
                          placeholder="Certification name"
                        />
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <label className="block text-sm font-medium mb-1">Issuer</label>
                        <input
                          value={cert.issuer || ''}
                          onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                          className="w-full border rounded p-2"
                          placeholder="Issuer"
                        />
                      </div>
                      <div className="col-span-8 md:col-span-3">
                        <label className="block text-sm font-medium mb-1">Year</label>
                        <input
                          value={cert.year || ''}
                          onChange={(e) => updateCertification(index, 'year', e.target.value)}
                          className="w-full border rounded p-2"
                          placeholder="2026"
                        />
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <label className="block text-sm font-medium mb-1">Certificate Photo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                            updateCertification(index, 'file', file);
                          }}
                          className="w-full border rounded p-2"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {cert.file ? cert.file.name : cert.imageUrl ? 'Existing certificate image attached' : 'No image attached'}
                        </div>
                        {cert.imageUrl ? (
                          <a href={cert.imageUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">Preview current image</a>
                        ) : null}
                        <div className="text-xs text-amber-600 mt-1">Verification: {cert.verificationStatus || 'pending'}</div>
                      </div>
                      <div className="col-span-4 md:col-span-1">
                        <button
                          type="button"
                          onClick={() => removeCertification(index)}
                          className="w-full border rounded p-2 text-rose-600"
                          title="Remove"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={addCertification}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    + Add Certification
                  </button>
                  <button
                    type="submit"
                    form="mechanic-profile-form"
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded"
                  >
                    Save Certifications
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {showAllCertifications ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold">All Certifications</h3>
              <button
                type="button"
                onClick={() => setShowAllCertifications(false)}
                className="rounded border px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-4 space-y-3">
              {certifications.length > 0 ? certifications.map((cert, idx) => (
                <div key={idx} className="rounded border p-3">
                  <div className="font-medium">{cert.name || 'Certification'}</div>
                  <div className="text-sm text-gray-600">Issuer: {cert.issuer || '-'}</div>
                  <div className="text-sm text-gray-600">Year: {cert.year || '-'}</div>
                  <div className="text-sm text-amber-600">Verification: {cert.verificationStatus || 'pending'}</div>
                  {cert.imageUrl ? (
                    <a href={cert.imageUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                      View certificate image
                    </a>
                  ) : (
                    <div className="text-sm text-gray-500">No certificate image uploaded</div>
                  )}
                </div>
              )) : (
                <div className="text-sm text-gray-500">No certifications found.</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
