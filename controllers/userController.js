const User = require('../models/User');

exports.login = async (req, res) => {
  try {
    console.log('Attempting login...');
    const { username, password } = req.body;
    console.log(`Received username: ${username}, password: ${password}`);
    
    // Find the user by username
    const user = await User.findOne({ username });

    if (user) {
      // Usporedba lozinke u obliku jasnog teksta
      if (password === user.password) {
        console.log(`User found: ${user}`);
        req.session.user = user; // Postavljanje korisnika u sesiju
        res.status(200).json({ message: 'Uspješna prijava', user });
      } else {
        console.log('User found but incorrect password');
        res.status(401).json({ message: 'Neuspješna prijava. Provjerite korisničko ime i lozinku.' });
      }
    } else {
      console.log('User not found');
      res.status(401).json({ message: 'Neuspješna prijava. Provjerite korisničko ime i lozinku.' });
    }
  } catch (error) {
    console.log('Error during login attempt', error);
    res.status(500).json({ message: 'Greška prilikom prijave', error });
  }
};


exports.logout = async (req, res) => {
  try {
    req.session.destroy(); // Uništavanje sesije prilikom odjave
    res.status(200).json({ message: 'Uspješna odjava' });
  } catch (error) {
    res.status(500).json({ message: 'Greška prilikom odjave', error });
  }
};
