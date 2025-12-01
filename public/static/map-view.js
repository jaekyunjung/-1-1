// Google Maps Integration for ShipShare
// Displays port locations and shipping routes

class ShipShareMap {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.map = null;
    this.markers = [];
    this.polylines = [];
  }

  // Initialize Google Maps
  async init(containerId) {
    // Load Google Maps API
    if (!window.google) {
      await this.loadGoogleMapsAPI();
    }

    // Create map centered on Pacific Ocean
    const mapContainer = document.getElementById(containerId);
    this.map = new google.maps.Map(mapContainer, {
      center: { lat: 20, lng: 140 }, // Pacific Ocean center
      zoom: 3,
      styles: [
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#a0d6ff' }]
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }]
        }
      ]
    });

    return this.map;
  }

  // Load Google Maps JavaScript API
  loadGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Google Maps API 로딩 실패'));
      };

      document.head.appendChild(script);
    });
  }

  // Add port marker
  addPortMarker(port) {
    if (!this.map) return;

    const marker = new google.maps.Marker({
      position: { lat: port.lat, lng: port.lng },
      map: this.map,
      title: port.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#667eea',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      }
    });

    // Info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px;">
          <h3 style="font-weight: bold; color: #667eea; margin-bottom: 5px;">
            ${port.name}
          </h3>
          <p style="color: #666; font-size: 12px;">
            위도: ${port.lat.toFixed(4)}°<br>
            경도: ${port.lng.toFixed(4)}°
          </p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(this.map, marker);
    });

    this.markers.push(marker);
    return marker;
  }

  // Draw route between two ports
  drawRoute(fromPort, toPort, color = '#667eea') {
    if (!this.map) return;

    const path = [
      { lat: fromPort.lat, lng: fromPort.lng },
      { lat: toPort.lat, lng: toPort.lng }
    ];

    const polyline = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map: this.map
    });

    this.polylines.push(polyline);

    // Calculate distance using Haversine formula
    const distance = this.calculateDistance(
      fromPort.lat, fromPort.lng,
      toPort.lat, toPort.lng
    );

    // Center map on route
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: fromPort.lat, lng: fromPort.lng });
    bounds.extend({ lat: toPort.lat, lng: toPort.lng });
    this.map.fitBounds(bounds);

    return {
      polyline,
      distance: distance.km,
      nauticalMiles: distance.nm,
      estimatedDays: distance.days
    };
  }

  // Calculate distance using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const km = R * c;
    const nm = km * 0.539957; // Convert to nautical miles
    const days = nm / (20 * 24); // Assuming 20 knots average speed

    return {
      km: Math.round(km * 100) / 100,
      nm: Math.round(nm * 100) / 100,
      days: Math.round(days * 10) / 10
    };
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Clear all markers and routes
  clearMap() {
    this.markers.forEach(marker => marker.setMap(null));
    this.polylines.forEach(polyline => polyline.setMap(null));
    this.markers = [];
    this.polylines = [];
  }

  // Highlight specific route
  highlightRoute(fromPort, toPort) {
    this.clearMap();
    this.addPortMarker(fromPort);
    this.addPortMarker(toPort);
    return this.drawRoute(fromPort, toPort, '#f59e0b');
  }

  // Display all major ports
  async displayAllPorts() {
    try {
      const response = await axios.get('/api/maps-google/ports');
      const ports = response.data.ports;

      ports.forEach(port => {
        this.addPortMarker({
          name: port.name,
          lat: port.coordinates.lat,
          lng: port.coordinates.lng
        });
      });

      return ports;
    } catch (error) {
      console.error('항구 데이터 로딩 실패:', error);
      return [];
    }
  }

  // Get port by code
  async getPortByCode(code) {
    try {
      const response = await axios.get('/api/maps-google/ports');
      const ports = response.data.ports;
      return ports.find(p => p.code === code);
    } catch (error) {
      console.error('항구 조회 실패:', error);
      return null;
    }
  }

  // Calculate and display route info
  async displayRouteInfo(fromCode, toCode) {
    const fromPort = await this.getPortByCode(fromCode);
    const toPort = await this.getPortByCode(toCode);

    if (!fromPort || !toPort) {
      console.error('항구를 찾을 수 없습니다');
      return null;
    }

    const routeInfo = this.highlightRoute(
      {
        name: fromPort.name,
        lat: fromPort.coordinates.lat,
        lng: fromPort.coordinates.lng
      },
      {
        name: toPort.name,
        lat: toPort.coordinates.lat,
        lng: toPort.coordinates.lng
      }
    );

    return {
      from: fromPort,
      to: toPort,
      ...routeInfo
    };
  }
}

// Export for use in other scripts
window.ShipShareMap = ShipShareMap;
