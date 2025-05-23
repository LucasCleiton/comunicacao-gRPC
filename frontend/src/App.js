import { useEffect, useState } from "react";
import "./App.css";

// Importações do React-Leaflet
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Importa o CSS do Leaflet

// Import para corrigir o ícone padrão do Leaflet no Webpack/Create React App
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

// Corrige o bug dos ícones padrão do Leaflet no Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: shadow,
});


export default function App() {
  const [veiculos, setVeiculos] = useState([]);
  const [estimativa, setEstimativa] = useState("");

  // Posição central inicial do mapa (ex: São Paulo)
  // Você pode ajustar para uma área onde seus veículos simulados realmente estejam
  const defaultCenter = [-23.5505, -46.6333]; // Coordenadas de São Paulo
  const defaultZoom = 12; // Nível de zoom

  useEffect(() => {
    const id = setInterval(() => {
      fetch("http://localhost:3001/veiculos")
        .then(r => r.json())
        .then(setVeiculos)
        .catch(console.error);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const pedirEstimativa = id =>
    fetch("http://localhost:3001/estimativa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_veiculo: id, destino: "Centro" })
    })
      .then(r => r.json())
      .then(d => setEstimativa(`${id}: ${d.tempo_estimado}`))
      .catch(console.error);

  return (
    <div className="container">
      <h1>Central de Rastreamento</h1>

      <div className="map-container">
        <MapContainer center={defaultCenter} zoom={defaultZoom} scrollWheelZoom={true} style={{ height: '500px', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {veiculos.map(v => (
            <Marker key={v.id} position={[v.lat, v.lng]}>
              <Popup>
                <strong>{v.id}</strong><br />
                Lat: {v.lat.toFixed(3)}, Lng: {v.lng.toFixed(3)}<br />
                Velocidade: {v.velocidade.toFixed(1)} km/h<br />
                Status: {v.status}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <ul className="veiculo-lista">
        {veiculos.length === 0 ? (
          <p className="no-vehicles">Nenhum veículo online no momento...</p>
        ) : (
          veiculos.map(v => (
            <li key={v.id} className="veiculo-card">
              <div><strong>{v.id}</strong></div>
              <div>{v.lat.toFixed(3)}, {v.lng.toFixed(3)}</div>
              <div>{v.velocidade.toFixed(1)} km/h</div>
              <button onClick={() => pedirEstimativa(v.id)}>Estimativa</button>
            </li>
          ))
        )}
      </ul>
      {estimativa && <p className="estimativa">{estimativa}</p>}
    </div>
  );
}