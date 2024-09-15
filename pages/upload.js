// pages/upload.js
import { useState } from 'react';

export default function Upload() {
  const [image, setImage] = useState(null);
  const [socialLink, setSocialLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image || !socialLink) {
      alert('Please provide both an image and your social media link.');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('socialLink', socialLink);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      alert('Image uploaded successfully!');
      setImage(null);
      setSocialLink('');
    } else {
      alert('Failed to upload image.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl mb-4">Upload Your Desk Setup</h2>
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
            type="url"
            placeholder="Your Social Media Link"
            value={socialLink}
            onChange={(e) => setSocialLink(e.target.value)}
            className="w-full p-2 border rounded"
            required
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
  );
}