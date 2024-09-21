const handleSubmit = async (e) => {
  e.preventDefault();
  setIsUploading(true);

  if (!image || !socialLink) {
    alert('Please provide both an image and your social media link.');
    setIsUploading(false);
    return;
  }

  const formData = new FormData();
  formData.append('image', image);
  formData.append('socialLink', socialLink);

  try {
    console.log('Sending upload request...');
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    console.log('Response status:', res.status);
    const responseData = await res.json();
    console.log('Response data:', responseData);

    if (res.ok) {
      // Here, we expect the server to return an object with id, url, and possibly instagramHandle
      if (responseData.id && responseData.url) {
        alert('Image uploaded successfully!');
        setImage(null);
        setSocialLink('');
        // You might want to do something with the returned data here,
        // like updating a list of images or redirecting to a gallery page
      } else {
        throw new Error('Server response is missing expected data');
      }
    } else {
      throw new Error(responseData.error || 'Failed to upload image');
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert(`Failed to upload image: ${error.message}`);
  } finally {
    setIsUploading(false);
  }
};