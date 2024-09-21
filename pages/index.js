import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Image from 'next/image';

export default function Home() {
  const [images, setImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [votesLeft, setVotesLeft] = useState(25);
  const [votedImageIds, setVotedImageIds] = useState([]);

  useEffect(() => {
    // Fetch images from the server
    fetch('/api/images')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Received data from /api/images:', data);
        if (Array.isArray(data)) {
          setImages(data);
        } else {
          console.error('Data is not an array:', data);
          setImages([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching images:', error);
        setImages([]);
      });

    // Fetch votesLeft and voted images from the server
    fetch('/api/user-votes')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Received data from /api/user-votes:', data);
        setVotesLeft(data.votesLeft || 25);
        setVotedImageIds(data.votedImageIds || []);
      })
      .catch((error) => {
        console.error('Error fetching votes:', error);
        setVotesLeft(25);
        setVotedImageIds([]);
      });
  }, []);

  const handleVote = (imageId) => {
    fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          setImages((prevImages) =>
            prevImages
              .map((img) =>
                img.id === imageId ? { ...img, votes: data.votes } : img
              )
              .sort((a, b) => b.votes - a.votes)
          );
          setVotesLeft(data.votesLeft);
          setVotedImageIds((prevVotedImageIds) => {
            if (data.hasVoted) {
              return [...prevVotedImageIds, imageId];
            } else {
              return prevVotedImageIds.filter((id) => id !== imageId);
            }
          });
        }
      })
      .catch((error) => {
        console.error('Error voting:', error);
      });
  };

  const hasVotedForImage = (imageId) => {
    return votedImageIds.includes(imageId);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <nav className="p-4 bg-white shadow w-full flex justify-between items-center max-w-md">
        <button onClick={() => setIsModalOpen(true)} className="text-blue-500">
          Upload Your Setup
        </button>
        <span className="text-gray-700">Votes Left: {votesLeft}</span>
      </nav>

      {isModalOpen && (
        <UploadModal setIsModalOpen={setIsModalOpen} setImages={setImages} />
      )}

      <div className="w-full max-w-md mt-6 mb-4 px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          The internet&apos;s favourite desk setups. Curated by you.
        </h1>
      </div>

      <div className="p-4 w-full max-w-md">
        {images && images.length > 0 ? (
          images.map((image) => {
            if (!image || typeof image !== 'object') {
              console.log('Invalid image object:', image);
              return null;
            }
            const hasVoted = hasVotedForImage(image.id);

            return (
              <div
                key={image.id || `fallback-${Math.random()}`}
                className="bg-white p-4 rounded shadow mb-4"
              >
                <div className="w-full h-64 overflow-hidden flex items-center justify-center">
                  <Image
                    src={image.imageUrl}
                    alt="Desk Setup"
                    width={800}
                    height={600}
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
                    onClick={() => handleVote(image.id)}
                    className={`p-2 rounded ${
                      hasVoted ? 'text-red-500' : 'text-gray-500'
                    } hover:text-red-500`}
                    disabled={!hasVoted && votesLeft <= 0}
                  >
                    {hasVoted ? '💔' : '❤️'} {image.votes}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p>No images found.</p>
        )}
      </div>
    </div>
  );
}

function UploadModal({ setIsModalOpen, setImages }) {
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

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Upload response:', data);

      alert('Image uploaded successfully!');
      setImage(null);
      setInstagramHandle('');
      setIsModalOpen(false);

      setImages((prevImages) => [data.image, ...prevImages]);
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload image: ${error.message}`);
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