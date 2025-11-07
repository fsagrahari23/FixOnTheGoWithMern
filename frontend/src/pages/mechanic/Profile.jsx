import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';

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

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Error loading profile</div>;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-lg shadow p-6">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                defaultValue={profile.name}
                required
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                defaultValue={profile.phone}
                required
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                name="address"
                defaultValue={profile.address}
                required
                className="w-full border rounded p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Latitude</label>
                <input
                  type="number"
                  name="latitude"
                  step="any"
                  defaultValue={profile.location?.coordinates[1]}
                  required
                  className="w-full border rounded p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Longitude</label>
                <input
                  type="number"
                  name="longitude"
                  step="any"
                  defaultValue={profile.location?.coordinates[0]}
                  required
                  className="w-full border rounded p-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Specialization</label>
              <select
                name="specialization"
                multiple
                defaultValue={profile.specialization}
                required
                className="w-full border rounded p-2"
              >
                <option value="General Service">General Service</option>
                <option value="Engine Repair">Engine Repair</option>
                <option value="Electrical">Electrical</option>
                <option value="Brake System">Brake System</option>
                <option value="Tire Service">Tire Service</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Experience (years)</label>
              <input
                type="number"
                name="experience"
                defaultValue={profile.experience}
                required
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Hourly Rate (₹)</label>
              <input
                type="number"
                name="hourlyRate"
                defaultValue={profile.hourlyRate}
                required
                className="w-full border rounded p-2"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded"
            >
              Update Profile
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
