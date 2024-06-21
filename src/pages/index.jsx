import React, { useEffect, useState } from "react";
import axios from "axios";
import qs from "qs";
import ColorThief from "colorthief";
import "./index.css";

const CLIENT_ID = "e331f04fea5c4b659dd76603e3e3b908";
const CLIENT_SECRET = "4d6ee58d9cab4f1e9cfcc0af6f91abe7";

const App = ({
  appTitle,
  inputPlaceholderText,
  buttonText,
  popularity,
  unsupportedWarning,
  noResult,
}) => {
  const [token, setToken] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState(null);
  const [albumColors, setAlbumColors] = useState({});
  const [limit] = useState(50);

  useEffect(() => {
    const getAccessToken = async () => {
      const authOptions = {
        method: "POST",
        url: "https://accounts.spotify.com/api/token",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
        },
        data: qs.stringify({
          grant_type: "client_credentials",
        }),
      };

      try {
        const response = await axios(authOptions);
        setToken(response.data.access_token);
      } catch (error) {
        console.error("Error fetching token", error);
      }
    };

    getAccessToken();
  }, []);

  const handleSearch = async () => {
    if (token && query) {
      try {
        const response = await axios.get(`https://api.spotify.com/v1/search`, {
          headers: {
            Authorization: "Bearer " + token,
          },
          params: {
            q: query,
            type: "track,artist",
            limit: limit,
          },
        });
        const tracks = response.data.tracks.items;
        setResults(tracks);

        tracks.forEach((track) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.src = track.album.images[0].url;
          img.onload = () => {
            const colorThief = new ColorThief();
            const color = colorThief.getColor(img);
            setAlbumColors((prevColors) => ({
              ...prevColors,
              [track.id]: color,
            }));
          };
        });
      } catch (error) {
        console.error("Error searching tracks", error);
      }
    }
  };

  const handlePlay = (track) => {
    if (playingTrack && playingTrack.id === track.id) {
      setPlayingTrack(null);
    } else {
      setPlayingTrack(track);
    }
  };

  return (
    <div className="app">
      <h1>{appTitle}</h1>
      <div className="search-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={inputPlaceholderText}
        />
        <button onClick={handleSearch}>{buttonText}</button>
      </div>
      <div className="results">
        {results.length > 0 ? (
          results.map((track) => (
            <div
              key={track.id}
              className="card"
              style={{
                backgroundColor: albumColors[track.id]
                  ? `rgb(${albumColors[track.id].join(",")})`
                  : "white",
              }}
            >
              <img
                src={track.album.images[0].url}
                alt={track.name}
                className="album-art"
              />
              <div className="track-info">
                <h2>{track.name}</h2>
                <p>{track.artists[0].name}</p>
                <p>{track.album.name}</p>
                <p>
                  {popularity} {track.popularity}
                </p>
              </div>
              <div className="button-play">
                {track.preview_url && (
                  <button onClick={() => handlePlay(track)}>
                    {playingTrack && playingTrack.id === track.id
                      ? "Pause"
                      : "Play"}
                  </button>
                )}
                {playingTrack && playingTrack.id === track.id && (
                  <audio controls autoPlay>
                    <source src={track.preview_url} type="audio/mpeg" />
                    {unsupportedWarning}
                  </audio>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>{noResult}</p>
        )}
      </div>
    </div>
  );
};

App.defaultProps = {
  appTitle: "Spotify Search",
  inputPlaceholderText: "Procure por um artista ou música",
  buttonText: "Pesquisar",
  popularity: "Popularidade:",
  unsupportedWarning: "Navegador não suportado",
  noResult: "Nenhum resultado encontrado",
};

export default App;
