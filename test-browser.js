#!/usr/bin/env node

const CDP = require('chrome-remote-interface');

async function test() {
  let client;

  try {
    // Connect to Chrome
    console.log('Connecting to Chrome...');
    client = await CDP({ host: 'localhost', port: 9222 });

    const { Page, Runtime } = client;

    // Enable necessary domains
    await Page.enable();
    await Runtime.enable();

    console.log('✓ Connected to Chrome');

    // Navigate to a URL
    console.log('\nNavigating to example.com...');
    await Page.navigate({ url: 'https://example.com' });
    await Page.loadEventFired();
    console.log('✓ Page loaded');

    // Get the page title
    const result = await Runtime.evaluate({
      expression: 'document.title'
    });
    console.log(`✓ Page title: "${result.result.value}"`);

    // Get the body text
    const bodyText = await Runtime.evaluate({
      expression: 'document.body.innerText.substring(0, 100)'
    });
    console.log(`✓ Body preview: "${bodyText.result.value}..."`);

    console.log('\n✅ Browser is working correctly!');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

test();
