const { getFolderPath } = require('./index');

async function test() {
  console.log('Opening folder picker...');
  const selectedPath = await getFolderPath();
  
  if (selectedPath) {
    console.log('Selected folder:', selectedPath);
  } else {
    console.log('No folder selected or dialog cancelled');
  }
}

test().catch(console.error);
