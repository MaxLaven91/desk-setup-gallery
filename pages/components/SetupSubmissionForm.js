import React, { useState } from 'react';
import { useRouter } from 'next/router';

const SetupSubmissionForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    setupDescription: '',
    socialLink: '',
  });
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    for (const key in formData) {
      submitData.append(key, formData[key]);
    }
    if (image) {
      submitData.append('image', image);
    }

    try {
      const response = await fetch('/api/submit-setup', {
        method: 'POST',
        body: submitData,
      });

      if (response.ok) {
        alert('Setup submitted successfully!');
        router.push('/thank-you');
      } else {
        throw new Error('Failed to submit setup');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Failed to submit setup: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="setupDescription" className="block text-sm font-medium text-gray-700">Setup Description</label>
        <textarea
          id="setupDescription"
          name="setupDescription"
          value={formData.setupDescription}
          onChange={handleChange}
          required
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        ></textarea>
      </div>
      <div>
        <label htmlFor="socialLink" className="block text-sm font-medium text-gray-700">Social Media Link</label>
        <input
          type="url"
          id="socialLink"
          name="socialLink"
          value={formData.socialLink}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Setup Image</label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
          required
          className="mt-1 block w-full"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Setup'}
      </button>
    </form>
  );
};

export default SetupSubmissionForm;