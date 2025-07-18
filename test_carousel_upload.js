const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testCarouselUpload() {
  try {
    // First, login to get a session
    const loginResponse = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'jnlanahan',
        password: '0p;/9ol.)P:?(OL>'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    // Get session cookie
    const sessionCookie = loginResponse.headers.get('set-cookie');
    console.log('Session cookie:', sessionCookie);
    
    // Create form data for carousel image
    const formData = new FormData();
    formData.append('title', 'Test Carousel Image');
    formData.append('caption', 'This is a test carousel image for Life in Pictures');
    formData.append('altText', 'Test carousel image');
    formData.append('position', '1');
    formData.append('isVisible', 'true');
    formData.append('image', fs.createReadStream('./attached_assets/ROKFC1_1752810852416.jpg'));
    
    // Upload carousel image
    const uploadResponse = await fetch('http://localhost:5000/api/carousel-images', {
      method: 'POST',
      headers: {
        'Cookie': sessionCookie
      },
      body: formData
    });
    
    console.log('Upload response status:', uploadResponse.status);
    
    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      console.log('Upload success:', uploadData);
    } else {
      const errorData = await uploadResponse.text();
      console.log('Upload error:', errorData);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCarouselUpload();
