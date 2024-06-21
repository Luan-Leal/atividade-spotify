import React, { useEffect, useState } from "react";
import axios from "axios";

const CLIENT_ID = "YOUR_CLIENT_ID";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET";

const MainPage = () => {
  const [token, setToken] = useState("");
  const [track, setTrack] = useState(null);

  useEffect(() => {
    // Fetch the access token from Spotify API
    const getAccessToken = async () => {
      const authOptions = {
        method: "POST",
        url: "https://accounts.spotify.com/api/token",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
        },
        data: "grant_type=client_credentials",
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

  useEffect(() => {
    if (token) {
      // Fetch a track from Spotify API
      const fetchTrack = async () => {
        try {
          const response = await axios.get(
            "https://api.spotify.com/v1/tracks/3n3Ppam7vgaVa1iaRUc9Lp",
            {
              headers: {
                Authorization: "Bearer " + token,
              },
            }
          );
          setTrack(response.data);
        } catch (error) {
          console.error("Error fetching track", error);
        }
      };

      fetchTrack();
    }
  }, [token]);

  return (
    <div>
      <h1>Spotify Track Data</h1>
      {track ? (
        <div>
          <h2>{track.name}</h2>
          <p>{track.artists[0].name}</p>
          <p>{track.album.name}</p>
          <p>{track.popularity}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default MainPage;
