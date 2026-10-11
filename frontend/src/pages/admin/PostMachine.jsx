import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import './PostMachine.css';

const PostMachine = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const [error, setError] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  const [formData, setFormData] = useState({
    type: '',
    subType: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    location: '',
    description: '',
    sellerName: '',
    sellerPhone: '',
    sellerEmail: '',
    sellerWhatsApp: '',
    specifications: {
      gauge: '',
      width: '',
      needleNumber: '',
      feeders: '',
      rpm: '',
      powerRating: '',
      condition: 'Good'
    }
  });

  const machineTypes = {
    knitting: ['Warp Knitting', 'Circular Knitting', 'Flat Knitting', 'Beams'],
    weaving: ['Waterjet Loom', 'Airjet Loom', 'Rapier Loom', 'Power Loom'],
    warping: ['Direct Warping', 'Split Warping', 'Beamer']
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSpecChange = (field, value) => {
    setFormData({
      ...formData,
      specifications: { ...formData.specifications, [field]: value }
    });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxPhotos = 5;

    if (uploadedPhotos.length + files.length > maxPhotos) {
      setError(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedPhotos(prev => [...prev, {
          id: Date.now() + index,
          name: file.name,
          src: event.target.result,
          file,
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedVideo({
        name: file.name,
        src: event.target.result,
        file,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removePhoto = (id) => {
    setUploadedPhotos(uploadedPhotos.filter(p => p.id !== id));
  };

  const removeVideo = () => {
    setUploadedVideo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!formData.type || !formData.subType || !formData.brand || !formData.model) {
        throw new Error('Please fill in all required fields');
      }

      if (uploadedPhotos.length === 0) {
        throw new Error('Please upload at least one photo');
      }

      const fd = new FormData();
      fd.append('Type', formData.type);
      fd.append('SubType', formData.subType);
      fd.append('Brand', formData.brand);
      fd.append('Model', formData.model);
      fd.append('Year', formData.year);
      fd.append('Location', formData.location);
      fd.append('Description', formData.description);
      fd.append('Condition', formData.specifications.condition);
      fd.append('SellerName', formData.sellerName);
      fd.append('SellerPhone', formData.sellerPhone);
      fd.append('SellerEmail', formData.sellerEmail);
      fd.append('SellerWhatsApp', formData.sellerWhatsApp);
      fd.append('SpecificationsJson', JSON.stringify(formData.specifications));
      uploadedPhotos.forEach((p) => fd.append('Photos', p.file));
      if (uploadedVideo) fd.append('Video', uploadedVideo.file);

      const response = await apiClient.post('/machines', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(true);
      setCreatedId(response.data?.id ?? null);
      setFormData({
        type: '',
        subType: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        location: '',
        description: '',
        sellerName: '',
        sellerPhone: '',
        sellerEmail: '',
        sellerWhatsApp: '',
        specifications: {
          gauge: '',
          width: '',
          needleNumber: '',
          feeders: '',
          rpm: '',
          powerRating: '',
          condition: 'Good'
        }
      });
      setUploadedPhotos([]);
      setUploadedVideo(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not post this machine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-machine-page">
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>← Dashboard</button>
        <h1>📤 Post New Machine</h1>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="machine-form">

          {/* Messages */}
          {error && <div className="error-message">{error}</div>}
          {success && (
            <div className="success-message">
              ✅ Machine posted successfully!{' '}
              {createdId && (
                <button type="button" className="success-message__link" onClick={() => navigate(`/machines/${createdId}`)}>
                  View it live →
                </button>
              )}
            </div>
          )}

          {/* Machine Type Section */}
          <section className="form-section">
            <h2>Machine Type</h2>
            <div className="form-group">
              <label>Machine Type *</label>
              <select
                value={formData.type}
                onChange={(e) => {
                  handleInputChange('type', e.target.value);
                  handleInputChange('subType', '');
                }}
                required
              >
                <option value="">Select Type</option>
                <option value="knitting">Knitting</option>
                <option value="weaving">Weaving</option>
                <option value="warping">Warping</option>
              </select>
            </div>

            {formData.type && (
              <div className="form-group">
                <label>Sub Type *</label>
                <select
                  value={formData.subType}
                  onChange={(e) => handleInputChange('subType', e.target.value)}
                  required
                >
                  <option value="">Select Sub Type</option>
                  {machineTypes[formData.type].map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            )}
          </section>

          {/* Machine Details Section */}
          <section className="form-section">
            <h2>Machine Details</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Brand *</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="e.g., Karl Mayer"
                  required
                />
              </div>
              <div className="form-group">
                <label>Model *</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="e.g., HKS 3-M"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Year Manufactured *</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  min="1990"
                  max={new Date().getFullYear()}
                  required
                />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Machine condition, features, maintenance history..."
                rows="4"
              ></textarea>
            </div>
          </section>

          {/* Specifications Section */}
          <section className="form-section">
            <h2>Specifications</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Gauge (E)</label>
                <input
                  type="text"
                  value={formData.specifications.gauge}
                  onChange={(e) => handleSpecChange('gauge', e.target.value)}
                  placeholder="e.g., E28"
                />
              </div>
              <div className="form-group">
                <label>Width (inch)</label>
                <input
                  type="text"
                  value={formData.specifications.width}
                  onChange={(e) => handleSpecChange('width', e.target.value)}
                  placeholder="e.g., 210"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Needle Number</label>
                <input
                  type="text"
                  value={formData.specifications.needleNumber}
                  onChange={(e) => handleSpecChange('needleNumber', e.target.value)}
                  placeholder="e.g., 51.50"
                />
              </div>
              <div className="form-group">
                <label>Feeders</label>
                <input
                  type="text"
                  value={formData.specifications.feeders}
                  onChange={(e) => handleSpecChange('feeders', e.target.value)}
                  placeholder="e.g., 168"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>RPM</label>
                <input
                  type="text"
                  value={formData.specifications.rpm}
                  onChange={(e) => handleSpecChange('rpm', e.target.value)}
                  placeholder="e.g., 35"
                />
              </div>
              <div className="form-group">
                <label>Power Rating</label>
                <input
                  type="text"
                  value={formData.specifications.powerRating}
                  onChange={(e) => handleSpecChange('powerRating', e.target.value)}
                  placeholder="e.g., 15 KW"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Condition</label>
              <select
                value={formData.specifications.condition}
                onChange={(e) => handleSpecChange('condition', e.target.value)}
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </section>

          {/* Seller Information Section */}
          <section className="form-section">
            <h2>Seller Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Seller Name</label>
                <input
                  type="text"
                  value={formData.sellerName}
                  onChange={(e) => handleInputChange('sellerName', e.target.value)}
                  placeholder="Your name or company"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.sellerPhone}
                  onChange={(e) => handleInputChange('sellerPhone', e.target.value)}
                  placeholder="+91..."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.sellerEmail}
                  onChange={(e) => handleInputChange('sellerEmail', e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className="form-group">
                <label>WhatsApp</label>
                <input
                  type="tel"
                  value={formData.sellerWhatsApp}
                  onChange={(e) => handleInputChange('sellerWhatsApp', e.target.value)}
                  placeholder="+91..."
                />
              </div>
            </div>
          </section>

          {/* Photos Upload Section */}
          <section className="form-section">
            <h2>📸 Machine Photos</h2>
            <p className="info-text">Upload up to 5 photos (JPEG, PNG)</p>

            <div className="upload-box">
              <input
                type="file"
                id="photo-input"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadedPhotos.length >= 5}
              />
              <label htmlFor="photo-input" className="upload-label">
                📁 Click to upload or drag photos here
              </label>
            </div>

            {uploadedPhotos.length > 0 && (
              <div className="photo-gallery">
                <h3>Uploaded Photos ({uploadedPhotos.length}/5)</h3>
                <div className="gallery-grid">
                  {uploadedPhotos.map((photo) => (
                    <div key={photo.id} className="photo-item">
                      <img src={photo.src} alt={photo.name} />
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removePhoto(photo.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Video Upload Section */}
          <section className="form-section">
            <h2>🎥 Working Machine Video</h2>
            <p className="info-text">Upload one video (MP4, WebM)</p>

            <div className="upload-box">
              <input
                type="file"
                id="video-input"
                accept="video/*"
                onChange={handleVideoUpload}
                disabled={!!uploadedVideo}
              />
              <label htmlFor="video-input" className="upload-label">
                📁 Click to upload working video
              </label>
            </div>

            {uploadedVideo && (
              <div className="video-preview">
                <h3>Video Preview</h3>
                <div className="video-item">
                  <video controls width="200">
                    <source src={uploadedVideo.src} type="video/mp4" />
                  </video>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={removeVideo}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Submit Button */}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate('/admin/dashboard')}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '⏳ Posting...' : '✅ Post Machine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostMachine;
