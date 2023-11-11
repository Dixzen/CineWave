import React, { useRef, useState, useEffect } from 'react';
import './videoPlayer.css';
import WaveSurfer from 'wavesurfer.js';

const VideoPlayer = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [videoMetadata, setVideoMetadata] = useState({});
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const waveformRef = useRef(null);
    const wavesurfer = useRef(null);
    let animationFrameId;

    useEffect(() => {
        wavesurfer.current = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: 'violet',
            progressColor: 'purple',
            height: 80
        });
    }, []);

    const handleFileChange = (event) => {

        const file = event.target.files[0];

        if (file) {
          const videoURL = URL.createObjectURL(file);
          const videoElement = document.createElement('video');
        //   const videoElement = videoRef.current;
          videoElement.src = videoURL;
          
          videoElement.addEventListener('loadeddata', () => {
            // Check if the video has an audio track
            if (videoElement.mozHasAudio ||
                Boolean(videoElement.webkitAudioDecodedByteCount) ||
                Boolean(videoElement.audioTracks && videoElement.audioTracks.length)) {
              setVideoFile(videoURL);
              wavesurfer.current.load(videoURL);
              extractAudioWaveform(videoElement);
            } 
            else {
              alert('Video without audio cannot be uploaded.');
              URL.revokeObjectURL(videoURL);
            }
          });
        }
    };


    const extractAudioWaveform = (videoElement) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(videoElement);
        
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        // Use wavesurfer.js to create a waveform
        const wavesurfer = WaveSurfer.create({
          container: '.audio-waveform',
          waveColor: 'violet',
          progressColor: 'purple',
          backend: 'MediaElement'
        });
        wavesurfer.load(videoElement);
    };
      

    const handleMetadata = (e) => {

        const video = e.target;
    
        setVideoMetadata({
            duration: video.duration, 
            videoWidth: video.videoWidth, 
            videoHeight: video.videoHeight, 

        });
    
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }
    };

    const drawVideoFrame = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        animationFrameId = requestAnimationFrame(drawVideoFrame);
    };

    const togglePlayPause = () => {
        const video = videoRef.current;
        if (video.paused) {
            video.play();
            drawVideoFrame();
        } else {
            video.pause();
            cancelAnimationFrame(animationFrameId);
        }
    };

    useEffect(() => {
        return () => {
            if (wavesurfer.current) {
                wavesurfer.current.destroy();
            }
        };
    }, []);

    return (
        
        <div className="container mt-5">

            <h1 className='display-1 mb-5'>VTube</h1>

            <div className="row">
                <div className="col-md-8">
                    <div className="input-group mb-3">
                        <input type="file" className="form-control" onChange={handleFileChange} accept="video/*" />
                    </div>

                    {videoFile && (
                    <div className="video-container mb-3">
                        <canvas ref={canvasRef} className="img-fluid" />
                        <video ref={videoRef} src={videoFile} onLoadedMetadata={handleMetadata} hidden />
                        <div className="controls text-center mt-2">
                            <button className="btn btn-primary btn-lg btn-danger" onClick={togglePlayPause}>Play/Pause</button>
                        </div>
                    </div>
                    )}
                    </div>

                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Video Metadata</h5>
                            <p className="card-text">Duration: {videoMetadata.duration ? `${videoMetadata.duration.toFixed(2)} seconds` : 'Not available'}</p>
                            <p className="card-text">Width: {videoMetadata.videoWidth || 'Not available'}</p>
                            <p className="card-text">Height: {videoMetadata.videoHeight || 'Not available'}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                <div ref={waveformRef} className="audio-waveform" />
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
