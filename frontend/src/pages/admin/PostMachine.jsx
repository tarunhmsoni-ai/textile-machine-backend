import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import './PostMachine.css';

const machineTypes = {
  knitting: ['Warp Knitting', 'Circular Knitting', 'Flat Knitting', 'Beams'],
  weaving: ['Waterjet Loom', 'Airjet Loom', 'Rapier Loom', 'Power Loom'],
  warping: ['Direct Warping', 'Split Warping', 'Beamer']
};

// Specification fields per machine sub-type, as supplied by the client
// (Machine Categories.docx). Each sub-type has its own set of extra
// parameters in addition to the common fields (Brand, Model, Year,
// Location, Asking Price, Number of Machines) already captured above.
const WEAVING_LOOM_FIELDS = [
  { key: 'subSubType', label: 'Sub Sub Type' },
  { key: 'width', label: 'Width' },
  { key: 'numberOfHealdFrames', label: 'Number of Heald Frames' },
  { key: 'feeder', label: 'Feeder' },
  { key: 'plainCamDobby', label: 'Plain / Cam or Dobby' },
  { key: 'other1', label: 'Other 1' },
  { key: 'other2', label: 'Other 2' },
  { key: 'other3', label: 'Other 3' },
];

const SPEC_FIELDS = {
  'Warp Knitting': [
    { key: 'subSubType', label: 'Sub Sub Type' },
    { key: 'width', label: 'Width' },
    { key: 'numberOfBars', label: 'Number of Bars' },
    { key: 'needleBarType', label: 'Needle Bar (Single/Double)' },
    { key: 'gauge', label: 'Gauge', placeholder: 'e.g., E28' },
    { key: 'needleNumber', label: 'Needle Number', placeholder: 'e.g., 51.50' },
    { key: 'chainLinking', label: 'Chain Linking (Disk/EL)' },
    { key: 'other', label: 'Other' },
  ],
  'Circular Knitting': [
    { key: 'subSubType', label: 'Sub Sub Type' },
    { key: 'dia', label: 'Dia' },
    { key: 'gauge', label: 'Gauge', placeholder: 'e.g., E28' },
    { key: 'feeder', label: 'Feeder', placeholder: 'e.g., 168' },
    { key: 'needleNumber', label: 'Needle Number' },
    { key: 'other1', label: 'Other 1' },
    { key: 'other2', label: 'Other 2' },
    { key: 'other3', label: 'Other 3' },
  ],
  'Flat Knitting': [
    { key: 'subSubType', label: 'Sub Sub Type' },
    { key: 'width', label: 'Width' },
    { key: 'system', label: 'System' },
    { key: 'gauge', label: 'Gauge', placeholder: 'e.g., E28' },
    { key: 'numberOfCarriage', label: 'Number of Carriage' },
    { key: 'sinker', label: 'Sinker' },
    { key: 'transfer', label: 'Transfer' },
    { key: 'other1', label: 'Other 1' },
    { key: 'other2', label: 'Other 2' },
    { key: 'other3', label: 'Other 3' },
  ],
  Beams: [
    { key: 'subSubType', label: 'Sub Sub Type' },
    { key: 'size', label: 'Size' },
    { key: 'weight', label: 'Weight' },
    { key: 'other1', label: 'Other 1' },
    { key: 'other2', label: 'Other 2' },
    { key: 'other3', label: 'Other 3' },
  ],
  'Waterjet Loom': WEAVING_LOOM_FIELDS,
  'Airjet Loom': WEAVING_LOOM_FIELDS,
  'Rapier Loom': WEAVING_LOOM_FIELDS,
  'Power Loom': WEAVING_LOOM_FIELDS,
  'Direct Warping': [
    { key: 'subSubType', label: 'Sub Sub Type' },
    { key: 'ends', label: 'Ends' },
    { key: 'lines', label: 'Lines' },
    { key: 'other1', label: 'Other 1' },
    { key: 'other2', label: 'Other 2' },
    { key: 'other3', label: 'Other 3' },
  ],
  'Split Warping': [
    { key: 'subSubType', label: 'Sub Sub Type' },
    { key: 'numberOfCreel', label: 'Number of Creel' },
    { key: 'other1', label: 'Other 1' },
    { key: 'other2', label: 'Other 2' },
    { key: 'other3', label: 'Other 3' },
  ],
  Beamer: [],
};

const getSpecFields = (subType) => SPEC_FIELDS[subType] || [];

const buildSpecTemplate = (subType) => {
  const template = { condition: 'Good' };
  getSpecFields(subType).forEach((f) => {
    template[f.key] = '';
  });
  return template;
};

const chunkPairs = (arr) => {
  const pairs = [];
  for (let i = 0; i < arr.length; i += 2) pairs.push(arr.slice(i, i + 2));
  return pairs;
};

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
    askingPrice: '',
    quantity: 1,
    description: '',
    sellerName: '',
    sellerPhone: '',
    sellerEmail: '',
    sellerWhatsApp: '',
    specifications: buildSpecTemplate(''),
  });

  const specFields = getSpecFields(formData.subType);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSpecChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      specifications: { ...prev.specifications, [field]: value }
    }));
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

      if (!formData.year || Number(formData.year) <= 0) {
        throw new Error('Please enter the year manufactured');
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
      fd.append('AskingPrice', formData.askingPrice || '0');
      fd.append('Quantity', formData.quantity || '1');
      fd.append('Description', formData.description);
      fd.append('Condition', formData.specifications.condition);
      fd.append('SellerName', formData.sellerName);
      fd.append('SellerPhone', formData.sellerPhone);
      fd.append('SellerEmail', formData.sellerEmail);
      fd.append('SellerWhatsApp', formData.sellerWhatsApp);
      // Only persist the parameters the admin actually filled in — per the
      // client's spec, unfilled fields should never surface to the customer.
      const filledSpecs = Object.fromEntries(
        Object.entries(formData.specifications).filter(([, v]) => v !== '' && v != null)
      );
      fd.append('SpecificationsJson', JSON.stringify(filledSpecs));
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
        askingPrice: '',
        quantity: 1,
        description: '',
        sellerName: '',
        sellerPhone: '',
        sellerEmail: '',
        sellerWhatsApp: '',
        specifications: buildSpecTemplate(''),
      });
      setUploadedPhotos([]);
      setUploadedVideo(null);
    } catch (err) {
      const data = err.response?.data;
      const validationErrors = data?.errors && Object.values(data.errors).flat().join(' ');
      setError(data?.message || validationErrors || err.message || 'Could not post this machine. Please try again.');
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
                  onChange={(e) => {
                    const subType = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      subType,
                      specifications: buildSpecTemplate(subType),
                    }));
                  }}
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

            <div className="form-row">
              <div className="form-group">
                <label>Asking Price (₹)</label>
                <input
                  type="number"
                  value={formData.askingPrice}
                  onChange={(e) => handleInputChange('askingPrice', e.target.value)}
                  placeholder="e.g., 2300000"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Number of Machines</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="e.g., 1"
                  min="1"
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

          {/* Specifications Section — fields change based on the selected Sub Type */}
          <section className="form-section">
            <h2>Specifications</h2>

            {!formData.subType && (
              <p className="info-text">Select a Machine Type and Sub Type above to see its specific fields.</p>
            )}

            {formData.subType && specFields.length === 0 && (
              <p className="info-text">No additional specification fields for this sub type.</p>
            )}

            {chunkPairs(specFields).map((pair) => (
              <div className="form-row" key={pair.map((f) => f.key).join('-')}>
                {pair.map((f) => (
                  <div className="form-group" key={f.key}>
                    <label>{f.label}</label>
                    <input
                      type="text"
                      value={formData.specifications[f.key] || ''}
                      onChange={(e) => handleSpecChange(f.key, e.target.value)}
                      placeholder={f.placeholder || ''}
                    />
                  </div>
                ))}
              </div>
            ))}

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
