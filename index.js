const express = require('express');
const crypto = require('crypto');
const ethers = require('ethers');
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
app.use(express.static(__dirname));
const jwt = require('jsonwebtoken');
app.use(express.json())
app.use(bodyParser.json());
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});



// GET route to retrieve a nonce value for use in signing
app.get('/api/nonce', (req, res) => {
  // Generate a random 32-byte value to use as the nonce
  const nonce = crypto.randomBytes(32).toString('hex');
  // Return the nonce value as a JSON object in the response body
  res.json({ nonce });
});

const secretKey = 'mySecretKey';

app.post('/login', (req, res) => {
    console.log(req.body)
    const { signedMessage, message, address } = req.body;
    const recoveredAddress = ethers.utils.verifyMessage(message, signedMessage);
    console.log(recoveredAddress);
    if (recoveredAddress !== address) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Generate the JWT token
    const token = jwt.sign({ address }, secretKey, { expiresIn: '10s' });
    console.log(token)
    // Send the JWT token to the frontend
    res.json( token );
});


// Endpoint for verifying the JWT token and logging in the user
app.post('/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, secretKey);
      console.log(decoded)
      const currentTime = Math.floor(Date.now() / 1000);
      console.log(currentTime)
      if (decoded.exp < currentTime) {
        res.json("tokenExpired");
      } else {
        res.json("ok");
      }

      
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });
  
  // Serve the success page
app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname + '/success.html'));
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});