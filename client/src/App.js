import axios from "axios";
import { Resizable } from "re-resizable";
import React, { forwardRef, useRef, useState } from "react";
import Draggable from "react-draggable";
import ReactPlayer from "react-player";

const DraggableWrapper = forwardRef((props, ref) => (
  <Draggable {...props} nodeRef={ref}>
    <div ref={ref} style={{ display: "inline-block" }}>
      {props.children}
    </div>
  </Draggable>
));

function App() {
  const [videoURL, setVideoURL] = useState("");
  const [logoURL, setLogoURL] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 100, height: 100 });

  const dragRef = useRef(null);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return alert("No file selected!");

    const formData = new FormData();
    formData.append("video", file);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/upload-video",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Uploaded Video Path:", data.filePath);
      setVideoURL(`http://localhost:5000${data.filePath}`);
    } catch (error) {
      console.error("Error uploading video:", error.response?.data || error);
      alert("Failed to upload video!");
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return alert("No file selected!");

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/upload-logo",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Uploaded Logo Path:", data.filePath);
      setLogoURL(`http://localhost:5000${data.filePath}`);
    } catch (error) {
      console.error("Error uploading logo:", error.response?.data || error);
      alert("Failed to upload logo!");
    }
  };

  const processVideo = async () => {
    console.log("Processing Video with Paths:");
    console.log("Video Path:", videoURL);
    console.log("Logo Path:", logoURL);

    if (!videoURL || !logoURL) {
      alert("Please upload both video and logo before processing!");
      return;
    }
    try {
      const { data } = await axios.post("http://localhost:5000/process-video", {
        videoPath: videoURL,
        logoPath: logoURL,
        positionX: position.x,
        positionY: position.y,
        logoSize: size.width,
      });
      alert("video downloaded in uploads folder!");
      setVideoURL(`http://localhost:5000${data.processedVideo}`);
    } catch (error) {
      console.error("Error processing video:", error);
      alert("Failed to process video!");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1 style={{ color: "#333", marginBottom: "15px" }}>
        Upload Your Video & Logo
      </h1>

      <label
        htmlFor="videoUpload"
        style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}
      >
        Select a Video:
      </label>
      <input
        type="file"
        id="videoUpload"
        accept="video/*"
        onChange={handleVideoUpload}
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          width: "100%",
          maxWidth: "300px",
        }}
      />

      <br />
      <br />

      <label
        htmlFor="logoUpload"
        style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}
      >
        Select a Logo:
      </label>
      <input
        type="file"
        id="logoUpload"
        accept="image/*"
        onChange={handleLogoUpload}
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          width: "100%",
          maxWidth: "300px",
        }}
      />

      <br />
      <br />

      <button
        onClick={processVideo}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          background: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Process & Download
      </button>

      <div
        style={{
          position: "relative",
          width: "600px",
          height: "360px",
          margin: "20px auto",
          backgroundColor: "#000",
        }}
      >
        {videoURL && (
          <ReactPlayer
            url={videoURL}
            controls
            width="100%"
            height="100%"
            style={{ position: "absolute", top: 0, left: 0 }}
          />
        )}

        {logoURL && (
          <Draggable
            nodeRef={dragRef}
            bounds="parent"
            onStop={(e, data) => setPosition({ x: data.x, y: data.y })}
          >
            <div
              ref={dragRef}
              style={{
                position: "absolute",
                top: position.y,
                left: position.x,
              }}
            >
              <Resizable
                size={{ width: size.width, height: size.height }}
                onResizeStop={(e, direction, ref, delta) =>
                  setSize({ width: ref.offsetWidth, height: ref.offsetHeight })
                }
                enable={{ top: false, right: true, bottom: true, left: true }}
                handleStyles={{
                  right: { cursor: "ew-resize" },
                  bottom: { cursor: "ns-resize" },
                  bottomRight: { cursor: "nwse-resize" },
                }}
                style={{
                  border: "1px dashed red",
                  background: "rgba(255, 255, 255, 0.5)",
                }}
              >
                <div style={{ width: "100%", height: "100%", cursor: "move" }}>
                  <img
                    src={logoURL}
                    alt="Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </Resizable>
            </div>
          </Draggable>
        )}
      </div>
    </div>
  );
}

export default App;
