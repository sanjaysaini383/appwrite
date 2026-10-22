import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { categoryMeta, type LngLat, type Post } from '../lib/types';

type Props = {
  center: LngLat;
  radiusKm: number;
  posts: Post[];
  selectedId: string | null;
  freshIds: Set<string>;
  composing: boolean;
  dark: boolean;
  me: LngLat | null;
  onMove: (center: LngLat) => void;
  onSelect: (id: string) => void;
  flyTo: { at: LngLat; seq: number } | null;
};

const toLatLng = ([lng, lat]: LngLat): [number, number] => [lat, lng];

function pinIcon(post: Post, selected: boolean, fresh: boolean) {
  const meta = categoryMeta(post.category);
  const classes = [
    'pin',
    `pin--${post.kind}`,
    `pin--${post.status}`,
    post.urgency === 'high' && post.status === 'open' ? 'pin--urgent' : '',
    selected ? 'pin--selected' : '',
    fresh ? 'pin--fresh' : '',
  ].join(' ');
  return L.divIcon({
    className: 'pin-wrap',
    html: `<div class="${classes}" style="--pin:${meta.color}"><span>${meta.emoji}</span></div>`,
    iconSize: [40, 48],
    iconAnchor: [20, 46],
  });
}

const meIcon = L.divIcon({ className: 'pin-wrap', html: '<div class="me-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });

function Events({ onMove }: { onMove: (c: LngLat) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const c = map.getCenter();
      onMove([c.lng, c.lat]);
    },
  });
  return null;
}

function Flyer({ flyTo }: { flyTo: Props['flyTo'] }) {
  const map = useMap();
  useEffect(() => {
    if (flyTo) map.flyTo(toLatLng(flyTo.at), Math.max(map.getZoom(), 15), { duration: 0.8 });
  }, [flyTo, map]);
  return null;
}

export function MapView(props: Props) {
  const { center, radiusKm, posts, selectedId, freshIds, composing, dark, me, onMove, onSelect, flyTo } = props;
  const initial = useMemo(() => toLatLng(center), []);

  const tiles = dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <div className={`map ${composing ? 'map--composing' : ''}`}>
      <MapContainer center={initial} zoom={14} zoomControl={false} className="map__leaflet">
        <TileLayer
          key={tiles}
          url={tiles}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <Events onMove={onMove} />
        <Flyer flyTo={flyTo} />
        <Circle
          center={toLatLng(center)}
          radius={radiusKm * 1000}
          pathOptions={{ color: '#ff7a3d', weight: 1.5, dashArray: '6 6', fillColor: '#ff7a3d', fillOpacity: 0.04 }}
          interactive={false}
        />
        {me && <Marker position={toLatLng(me)} icon={meIcon} interactive={false} />}
        {posts.map((p) => (
          <Marker
            key={p.$id}
            position={toLatLng(p.location)}
            icon={pinIcon(p, p.$id === selectedId, freshIds.has(p.$id))}
            eventHandlers={{ click: () => onSelect(p.$id) }}
            zIndexOffset={p.$id === selectedId ? 1000 : p.status === 'open' ? 100 : 0}
          />
        ))}
      </MapContainer>
      {composing && (
        <div className="crosshair" aria-hidden>
          <div className="crosshair__pin">📍</div>
          <div className="crosshair__hint">Drag the map to place your pin</div>
        </div>
      )}
    </div>
  );
}
