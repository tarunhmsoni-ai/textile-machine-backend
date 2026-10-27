import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './MachineListings.css';
import apiClient, { resolveMediaUrl } from '../../services/apiClient';
import Navbar from '../../components/Navbar';
import CategoryBar from '../../components/CategoryBar';
import Breadcrumb from '../../components/Breadcrumb';
import { onImageError } from '../../utils/imageFallback';
import { whatsappShareUrl, facebookShareUrl } from '../../utils/shareLinks';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import FacebookIcon from '../../components/FacebookIcon';

const MachineListings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
    location: ''
  });

  const machineTypes = [
    { id: 'knitting', name: 'Knitting', subtypes: ['Warp Knitting', 'Circular Knitting', 'Flat Knitting', 'Beams'] },
    { id: 'weaving', name: 'Weaving', subtypes: ['Waterjet Loom', 'Airjet Loom', 'Rapier Loom', 'Power Loom'] },
    { id: 'warping', name: 'Warping', subtypes: ['Direct Warping', 'Split Warping', 'Beamer'] }
  ];

  // Clicking a category tab (Knitting/Weaving/Warping) while already on this
  // page changes the URL but doesn't remount the component, so filters.type
  // — only read from the URL once at mount — went stale. Keep it in sync.
  useEffect(() => {
    const urlType = searchParams.get('type') || '';
    setFilters((f) => (f.type === urlType ? f : { ...f, type: urlType }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('type')]);

  useEffect(() => {
    fetchMachines();
  }, [filters]);

  const fetchMachines = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.location) params.append('location', filters.location);

      const response = await apiClient.get(`/machines?${params.toString()}`);
      const data = (response.data || []).map((m) => ({ ...m, photo: resolveMediaUrl(m.photo) }));
      setMachines(data);
    } catch (error) {
      // Never substitute fake/sample listings for real ones here — a buyer
      // clicking into a fake listing hits a dead end (machine not found).
      console.error('Error fetching machines:', error);
      setMachines([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleContactSeller = (machineId) => {
    navigate(`/machines/${machineId}`);
  };

  const activeTypeName = machineTypes.find((t) => t.id === filters.type)?.name;

  return (
    <div className="machine-listings">
      <Navbar />
      <CategoryBar active={filters.type} />
      {/* Header with back button */}
      <div className="listings-header">
        <div className="listings-header__top">
          <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Machines', href: filters.type ? '/machines' : undefined },
              ...(activeTypeName ? [{ label: activeTypeName }] : []),
            ]}
          />
        </div>
        <h1>Browse Machines</h1>
      </div>

      <div className="listings-container">
        {/* Sidebar */}
        <div className="listings-sidebar-col">
          <CategoryBar active={filters.type} layout="vertical" />

          <aside className="filters-sidebar">
          <h3>Filters</h3>

          <div className="filter-group">
            <label>Machine Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              {machineTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Location</label>
            <input
              type="text"
              placeholder="Enter location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
          </div>

          <button className="clear-filters-btn" onClick={() => setFilters({type: '', search: '', minPrice: '', maxPrice: '', location: ''})}>
            Clear Filters
          </button>
          </aside>
        </div>

        {/* Main Content */}
        <main className="machines-grid">
          {loading ? (
            <div className="loading">Loading machines...</div>
          ) : loadError ? (
            <div className="no-results">
              <p>Couldn't load listings right now — please refresh the page.</p>
              <button onClick={() => fetchMachines()}>Retry</button>
            </div>
          ) : machines.length === 0 ? (
            <div className="no-results">
              <p>No machines found matching your criteria</p>
              <button onClick={() => navigate('/')}>Browse All Categories</button>
            </div>
          ) : (
            <>
              <div className="results-info">
                <p>Found {machines.length} machine{machines.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="machines-list">
                {machines.map((machine) => (
                  <div key={machine.id} className="machine-card">
                    <div className="machine-image">
                      <div className="machine-card__image-wrap">
                        <img src={machine.photo} alt={`${machine.brand} ${machine.model}`} onError={onImageError} />
                      </div>
                      <div className="machine-image__ribbon">
                        <span className="machine-card__badge">{machine.subtype}</span>
                        {machine.status && (
                          <span className={`machine-card__status machine-card__status--${machine.status.toLowerCase()}`}>
                            {machine.status}
                          </span>
                        )}
                      </div>
                      <div className="machine-image__share-group">
                        <a
                          href={whatsappShareUrl(`Check out this ${machine.brand} ${machine.model} on Textile Machine`, `${window.location.origin}/machines/${machine.id}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="machine-image__share"
                          aria-label="Share on WhatsApp"
                          title="Share on WhatsApp"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <WhatsAppIcon size={16} />
                        </a>
                        <a
                          href={facebookShareUrl(`${window.location.origin}/machines/${machine.id}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="machine-image__share"
                          aria-label="Share on Facebook"
                          title="Share on Facebook"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FacebookIcon size={16} />
                        </a>
                      </div>
                    </div>
                    <div className="machine-info">
                      <h3>{machine.brand} {machine.model}</h3>
                      <div className="specs">
                        <span className="year">{machine.year}</span>
                        <span className="location">📍 {machine.location}</span>
                        {machine.quantity > 1 && <span className="quantity">× {machine.quantity}</span>}
                      </div>
                      <p className="machine-card__description">{machine.description}</p>
                      <div className="price-section">
                        <button
                          type="button"
                          className="machine-card__price-text machine-card__price-text--btn"
                          onClick={() => handleContactSeller(machine.id)}
                        >
                          💬 Contact for Price
                        </button>
                      </div>
                      <div className="action-buttons">
                        <button
                          className="view-btn"
                          onClick={() => handleContactSeller(machine.id)}
                        >
                          View Details
                        </button>
                        <a
                          href={`https://wa.me/919662001216?text=Interested in ${machine.brand} ${machine.model}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="whatsapp-link"
                        >
                          <WhatsAppIcon size={16} /> Message
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default MachineListings;
