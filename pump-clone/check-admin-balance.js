const anchor = require("@coral-xyz/anchor");
const connection = new anchor.web3.Connection("http://localhost:8899", "confirmed");

const adminPubkey = new anchor.web3.PublicKey("F5FjAAU6y22eUisRo1dzm5L6ENB4XTNMUGxJrYKsUBvY");

connection.getBalance(adminPubkey).then(balance => {
  console.log(`Admin balance: ${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`);
}).catch(err => console.error(err));
