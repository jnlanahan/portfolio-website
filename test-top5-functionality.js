/**
 * Top 5 Lists Full Functionality Test
 * Tests all CRUD operations for Top 5 lists and items
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const colors = {
    info: '\x1b[34m',    // blue
    success: '\x1b[32m', // green
    error: '\x1b[31m',   // red
    warn: '\x1b[33m',    // yellow
  };
  console.log(`${colors[type]}[${timestamp}] ${message}\x1b[0m`);
}

let sessionCookie = '';

async function login() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      sessionCookie = setCookie.split(';')[0];
    }

    log('✓ Admin login successful', 'success');
    return true;
  } catch (error) {
    log(`✗ Login failed: ${error.message}`, 'error');
    return false;
  }
}

async function testCreateList() {
  try {
    const testList = {
      title: 'Test List Created by Script',
      icon: 'ri-test-line',
      color: '#ff6b6b',
      description: 'A test list created by the automated test script',
      mainImage: 'https://example.com/test-image.jpg',
      position: 99
    };

    const response = await fetch(`${BASE_URL}/api/admin/top5-lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(testList)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Create list failed: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    log(`✓ List created successfully: ID ${data.id}`, 'success');
    return data;
  } catch (error) {
    log(`✗ Create list failed: ${error.message}`, 'error');
    return null;
  }
}

async function testAddItem(listId) {
  try {
    const testItem = {
      title: 'Test Item #1',
      description: 'This is a test item created by the automated script',
      link: 'https://example.com',
      linkText: 'Visit Example',
      image: 'https://example.com/test-item.jpg',
      highlight: false,
      position: 1
    };

    const response = await fetch(`${BASE_URL}/api/admin/top5-lists/${listId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(testItem)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Add item failed: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    log(`✓ Item added successfully: ID ${data.id}`, 'success');
    return data;
  } catch (error) {
    log(`✗ Add item failed: ${error.message}`, 'error');
    return null;
  }
}

async function testAddMinimalItem(listId) {
  try {
    const minimalItem = {
      title: 'Minimal Test Item',
      position: 2
    };

    const response = await fetch(`${BASE_URL}/api/admin/top5-lists/${listId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(minimalItem)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Add minimal item failed: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    log(`✓ Minimal item added successfully: ID ${data.id}`, 'success');
    return data;
  } catch (error) {
    log(`✗ Add minimal item failed: ${error.message}`, 'error');
    return null;
  }
}

async function testGetListItems(listId) {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/top5-lists/${listId}/items`, {
      headers: {
        'Cookie': sessionCookie
      }
    });

    if (!response.ok) {
      throw new Error(`Get items failed: ${response.status}`);
    }

    const data = await response.json();
    log(`✓ Retrieved ${data.length} items from list ${listId}`, 'success');
    return data;
  } catch (error) {
    log(`✗ Get items failed: ${error.message}`, 'error');
    return null;
  }
}

async function testUpdateItem(itemId) {
  try {
    const updateData = {
      title: 'Updated Test Item',
      description: 'This item has been updated by the test script',
      highlight: true
    };

    const response = await fetch(`${BASE_URL}/api/admin/top5-list-items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Update item failed: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    log(`✓ Item updated successfully: ID ${data.id}`, 'success');
    return data;
  } catch (error) {
    log(`✗ Update item failed: ${error.message}`, 'error');
    return null;
  }
}

async function testFormValidation() {
  try {
    // Test empty title (should fail)
    const invalidItem = {
      description: 'Item without title',
      position: 1
    };

    const response = await fetch(`${BASE_URL}/api/admin/top5-lists/1/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(invalidItem)
    });

    if (response.ok) {
      log('✗ Validation test failed: Should have rejected empty title', 'error');
      return false;
    } else {
      log('✓ Validation working: Empty title correctly rejected', 'success');
      return true;
    }
  } catch (error) {
    log(`✗ Validation test failed: ${error.message}`, 'error');
    return false;
  }
}

async function cleanup(listId) {
  try {
    // Delete the test list (this will also delete all items)
    const response = await fetch(`${BASE_URL}/api/admin/top5-lists/${listId}`, {
      method: 'DELETE',
      headers: {
        'Cookie': sessionCookie
      }
    });

    if (!response.ok) {
      throw new Error(`Cleanup failed: ${response.status}`);
    }

    log('✓ Test data cleaned up successfully', 'success');
  } catch (error) {
    log(`✗ Cleanup failed: ${error.message}`, 'error');
  }
}

async function runFullTest() {
  log('🚀 Starting Top 5 Lists Full Functionality Test...', 'info');
  
  // Login
  if (!await login()) {
    log('❌ Test failed: Could not login', 'error');
    return;
  }

  // Create test list
  const testList = await testCreateList();
  if (!testList) {
    log('❌ Test failed: Could not create test list', 'error');
    return;
  }

  // Add full item
  const testItem = await testAddItem(testList.id);
  if (!testItem) {
    log('❌ Test failed: Could not add item', 'error');
    await cleanup(testList.id);
    return;
  }

  // Add minimal item
  const minimalItem = await testAddMinimalItem(testList.id);
  if (!minimalItem) {
    log('❌ Test failed: Could not add minimal item', 'error');
    await cleanup(testList.id);
    return;
  }

  // Get all items
  const items = await testGetListItems(testList.id);
  if (!items || items.length !== 2) {
    log(`❌ Test failed: Expected 2 items, got ${items ? items.length : 0}`, 'error');
    await cleanup(testList.id);
    return;
  }

  // Update item
  const updatedItem = await testUpdateItem(testItem.id);
  if (!updatedItem) {
    log('❌ Test failed: Could not update item', 'error');
    await cleanup(testList.id);
    return;
  }

  // Test validation
  const validationPassed = await testFormValidation();
  if (!validationPassed) {
    log('❌ Test failed: Validation not working properly', 'error');
    await cleanup(testList.id);
    return;
  }

  // Cleanup
  await cleanup(testList.id);

  log('🎉 ALL TESTS PASSED! Top 5 Lists functionality is working correctly.', 'success');
}

// Run the test
runFullTest().catch(error => {
  log(`❌ Test suite failed: ${error.message}`, 'error');
  process.exit(1);
});