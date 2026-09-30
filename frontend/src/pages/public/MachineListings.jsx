import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './MachineListings.css';
import apiClient from '../../services/apiClient';
import Navbar from '../../components/Navbar';

const MachineListings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchMachines();
  }, [filters]);

  const fetchMachines = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.location) params.append('location', filters.location);

      const response = await apiClient.get(`/machines?${params.toString()}`);
      setMachines(response.data || []);
    } catch (error) {
      console.error('Error fetching machines:', error);
      setMachines([
        {
          id: 1,
          type: 'knitting',
          subtype: 'Warp Knitting (Tricot)',
          brand: 'Karl Mayer',
          model: 'HKS 3-M',
          year: 2003,
          location: 'On request',
          price: 0,
          photo: '/machines/karl-mayer-hks3m-plate.webp',
          description: 'E28 gauge, 210" working width, needle number 51.50. Made in Germany.'
        }
      ]);
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

  return (
    <div className="machine-listings">
      <Navbar />
      {/* Header with back button */}
      <div className="listings-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <h1>Browse Machines</h1>
      </div>

      <div className="listings-container">
        {/* Sidebar Filters */}
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

        {/* Main Content */}
        <main className="machines-grid">
          {loading ? (
            <div className="loading">Loading machines...</div>
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
                      <div className="image-placeholder">
                        <img src={machine.photo} alt={`${machine.brand} ${machine.model}`} />
                      </div>
                    </div>
                    <div className="machine-info">
                      <h3>{machine.brand} {machine.model}</h3>
                      <div className="specs">
                        <span className="type-badge">{machine.subtype}</span>
                        <span className="year">{machine.year}</span>
                      </div>
                      <p className="location">📍 {machine.location}</p>
                      <p className="description">{machine.description}</p>
                      <div className="price-section">
                        <p className="price-text">💬 Contact for Price</p>
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
                          💬 Message
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
