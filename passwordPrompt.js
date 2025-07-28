const readline = require('readline');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter password to start the app: ', (password) => {
  // Verify the password
  if (password === 'Apoo124@#') {
    // Correct password, start the Next.js build and app
    console.log('Password correct. Starting Next.js build and app...');
    

      // Run the start command after the build is complete
      exec('npm start', (startError, startStdout, startStderr) => {
        if (startError) {
          console.error(`Error during start: ${startError}`);
          process.exit(1);
        }
        
        console.log(startStdout);
        rl.close();
      });
  } else { 
    console.log('Incorrect password. Exiting...');
    rl.close();
  }
});
