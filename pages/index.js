// pages/index.js
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function Home({ images: initialImages }) {
  const [votesLeft, setVotesLeft] = useState(25);
  const [votedImages, setVotedImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [images, setImages] = useState(initialImages);

  useEffect(() => {
    // Initialize votes left from localStorage
    const votes = localStorage.getItem('votesLeft') || 25;
    setVotesLeft(Number(votes));

    const voted = localStorage.getItem('votedImages') || '[]';
    setVotedImages(JSON.parse(voted));
  }, []);

  // **Removed the useEffect that sorts images to prevent infinite loop**

  const handleVote = (index) => {
    if (votesLeft <= 0) {
      alert('You have no votes left.');
      return;
    }

    if (votedImages.includes(index)) {
      alert('You have already voted for this image.');
      return;
    }

    // Update votes in the backend
    fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index }),
    });

    // Update local state
    setVotesLeft(votesLeft - 1);
    localStorage.setItem('votesLeft', votesLeft - 1);

    const newVotedImages = [...votedImages, index];
    setVotedImages(newVotedImages);
    localStorage.setItem('votedImages', JSON.stringify(newVotedImages));

    // Update the vote count in images state
    const updatedImages = images.map((img, idx) => {
      if (idx === index) {
        return { ...img, votes: img.votes + 1 };
      }
      return img;
    });

    // **Sort the updated images**
    const sortedImages = updatedImages.sort((a, b) => b.votes - a.votes);
    setImages([...sortedImages]);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <nav className="p-4 bg-white shadow w-full flex justify-between items-center max-w-md">
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-blue-500"
        >
          Upload Your Setup
        </button>
        <span>Votes Left: {votesLeft}</span>
      </nav>
      {/* Include the Modal Component */}
      {isModalOpen && (
        <UploadModal
          setIsModalOpen={setIsModalOpen}
          setImages={setImages}
          images={images}
        />
      )}

      {/* Updated Title with Off-Black Color */}
      <div className="w-full max-w-md mt-6 mb-4 px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          The internet's favourite desk setups. Curated by you.
        </h1>
      </div>

      <div className="p-4 w-full max-w-md">
        {images.map((image, idx) => (
          <div key={idx} className="bg-white p-4 rounded shadow mb-4">
            <div className="w-full h-64 overflow-hidden flex items-center justify-center">
              <img
                src={image.imageUrl}
                alt="Desk Setup"
                className="object-cover h-full w-full"
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              {image.instagramHandle ? (
                <a
                  href={`https://instagram.com/${image.instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  @{image.instagramHandle}
                </a>
              ) : (
                <span></span>
              )}
              <button
                onClick={() => handleVote(idx)}
                className={`p-2 rounded ${
                  votedImages.includes(idx)
                    ? 'text-red-500'
                    : 'text-gray-500 hover:text-red-500'
                }`}
                disabled={votedImages.includes(idx)}
              >
                ❤️ {image.votes}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UploadModal({ setIsModalOpen, setImages, images }) {
  const [image, setImage] = useState(null);
  const [instagramHandle, setInstagramHandle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert('Please provide an image.');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('instagramHandle', instagramHandle);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      alert('Image uploaded successfully!');
      setImage(null);
      setInstagramHandle('');
      setIsModalOpen(false); // Close the modal after successful upload

      // Fetch the new images list
      const newImages = await fetch('/api/images').then((res) => res.json());
      
      // **Sort the new images before setting state**
      newImages.sort((a, b) => b.votes - a.votes);
      setImages(newImages);
    } else {
      alert('Failed to upload image.');
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm relative">
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>
        <h2 className="text-xl mb-4">Upload Your Desk Setup</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Your Instagram Handle (optional)"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Upload
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

export async function getServerSideProps() {
  const fs = require('fs');
  const path = require('path');

  const filePath = path.join(process.cwd(), 'data', 'images.json');
  const fileData = fs.existsSync(filePath)
    ? fs.readFileSync(filePath)
    : '[]';
  const images = JSON.parse(fileData);

  // Sort images by highest votes
  images.sort((a, b) => b.votes - a.votes);

  return { props: { images } };
}