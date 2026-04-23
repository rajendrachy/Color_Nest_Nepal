import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Lock, Save, Camera } from 'lucide-react';
import api from '../services/api';

const Profile = () => {
  const { user, updateProfile, loading } = useContext(AuthContext);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    address: {
      street: '',
      district: '',
      province: ''
    },
    password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        address: user.address || { street: '', district: '', province: '' },
        password: ''
      });
    }
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type & size (max 5 MB)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG and PNG images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5 MB');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('image', file); // must match multer's upload.single('image')

    setUploading(true);
    try {
      const response = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, avatar: response.data.url }));
      toast.success('Photo uploaded! Click "Update Profile" to save.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile(formData);
    if (result.success) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="profile-page container">
      <div className="profile-card card animate-fade">
        <div className="profile-header">
          <div className="profile-avatar-container">
            <div className="profile-avatar-wrapper">
              <img 
                src={formData.avatar} 
                alt={formData.name} 
                className="profile-avatar-img"
                style={{
                  width: '90px',
                  height: '90px',
                  minWidth: '90px',
                  minHeight: '90px',
                  maxWidth: '90px',
                  maxHeight: '90px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  display: 'block'
                }}
              />
            </div>
            <label className="avatar-upload-label">
              <input type="file" onChange={handleImageUpload} hidden accept="image/*" />
              {uploading ? <div className="loader-sm" /> : <Camera size={14} />}
            </label>
          </div>
          <div className="profile-title">
            <h2>User Profile</h2>
            <p className="badge">Current Dashboard: <strong>
              {user?.role === 'admin' ? 'Admin Panel' : 
               user?.role === 'painter' ? 'Painter Dashboard' : 'Customer Dashboard'}
            </strong></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="grid-2">
            <div className="form-group">
              <label><User size={16} /> Full Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label><Mail size={16} /> Email Address</label>
              <input 
                type="email" 
                disabled 
                value={formData.email} 
              />
              <small>Email cannot be changed.</small>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label><Phone size={16} /> Phone Number</label>
              <input 
                type="text" 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label><Lock size={16} /> New Password</label>
              <input 
                type="password" 
                placeholder="Leave blank to keep current" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
            </div>
          </div>

          <h3 className="section-subtitle"><MapPin size={18} /> Delivery Address</h3>
          <div className="form-group">
            <label>Street Address</label>
            <input 
              type="text" 
              value={formData.address.street} 
              onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})} 
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>District</label>
              <input 
                type="text" 
                value={formData.address.district} 
                onChange={(e) => setFormData({...formData, address: {...formData.address, district: e.target.value}})} 
              />
            </div>
            <div className="form-group">
              <label>Province</label>
              <input 
                type="text" 
                value={formData.address.province} 
                onChange={(e) => setFormData({...formData, address: {...formData.address, province: e.target.value}})} 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary full-width" disabled={loading}>
            {loading ? 'Updating...' : <><Save size={20} /> Update Profile</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
