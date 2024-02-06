import request from 'supertest';
import canonicalize from 'canonicalize';
import * as cipher from './cipher.js';
import * as gatekeeper from './gatekeeper.js';
import server from './gk-api.js';  // Path to your server file

beforeEach(async () => {
    await gatekeeper.start();
});

afterEach(async () => {
    await gatekeeper.stop();
});

describe('GET /version', () => {
  it('should respond with version', async () => {
    const res = await request(server).get('/version');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(1);
  });
});

// async function createAgentTxn(keypair) {
//     const txn = {
//         op: "create",
//         mdip: {
//             version: 1,
//             type: "agent",
//             registry: "peerbit",
//         },
//         publicJwk: keypair.publicJwk,
//     };

//     const msg = canonicalize(txn);
//     const msgHash = cipher.hashMessage(msg);
//     txn.signature = await cipher.signHash(msgHash, keypair.privateJwk);
//     return txn;
// }

// describe('POST /did', () => {
//   it('should create a new DID', async () => {
//     const keypair = cipher.generateRandomJwk();
//     const agentTxn = await createAgentTxn(keypair);
//     const res = await request(server).post('/did').send(agentTxn);
//     expect(res.statusCode).toEqual(200);
//     // Add your assertions here
//   });
// });
