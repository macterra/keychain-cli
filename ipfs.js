// import { noise } from '@chainsafe/libp2p-noise'
// import { yamux } from '@chainsafe/libp2p-yamux'
// import { bootstrap } from '@libp2p/bootstrap'
// import { identify } from '@libp2p/identify'
// import { tcp } from '@libp2p/tcp'
// import { createHelia } from 'helia';
// import { FsBlockstore } from 'blockstore-fs';
import { MemoryDatastore } from 'datastore-core'
// import { createLibp2p } from 'libp2p'



import { createHelia } from 'helia';
import { FsBlockstore } from 'blockstore-fs';
import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp'
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { identifyService } from 'libp2p/identify'
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import { webSockets } from '@libp2p/websockets';
import { mplex } from '@libp2p/mplex';
import { all } from '@libp2p/websockets/filters'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery';
import { mdns } from '@libp2p/mdns'

// the blockstore is where we store the blocks that make up files
const blockstore = new FsBlockstore('./ipfs');

// application-specific data lives in the datastore
const datastore = new MemoryDatastore()

export async function createHeliaNode() {
    try {
        const libp2p = await createLibp2p({
            datastore,
            // relay: { enabled: true, hop: { enabled: true, active: true } },
            // EXPERIMENTAL: { pubsub: true },
            // for local
            relay: { enabled: true, hop: { enabled: false, active: false }, autoRelay: { enabled: true, maxListeners: 2 } },
            addresses: {
                listen: ['/ip4/0.0.0.0/tcp/4001', '/ip4/0.0.0.0/tcp/4002/ws']
            },
            transports: [
                tcp(),
                webSockets({ filter: all }),
            ],
            // transportManager: {
            //     faultTolerance: FaultTolerance.NO_FATAL,
            // },
            connectionEncryption: [
                noise()
            ],
            // connectionManager: {
            //     autoDial: false
            // },
            // peerStore: {
            //     persistence: false,
            //     // threshold: 5
            // },
            streamMuxers: [
                yamux({
                    maxStreamWindowSize: 131072 * 100,
                    initialStreamWindowSize: 131072 * 100,
                    maxMessageSize: 131072 * 100,
                }),
                mplex({
                    maxStreamWindowSize: 131072 * 100,
                    initialStreamWindowSize: 131072 * 100,
                    maxMessageSize: 131072 * 100,
                }),
            ],
            peerDiscovery: [
                pubsubPeerDiscovery({
                    interval: 10000,
                    listenOnly: false
                }),
                mdns({
                    interval: 1000
                })
            ],
            pubsub: {
                enabled: true,
                emitSelf: true
            },
            dht: {
                enabled: true,
                randomWalk: {
                    enabled: true
                }
            },
            services: {
                identify: identifyService(),
                pubsub: gossipsub({ allowPublishToZeroPeers: true })
            }
        });
        // This creates the final object, helia, which the createHeliaNode function returns.
        const helia = await createHelia({ blockstore, datastore, libp2p });

        return helia;


    } catch (err) {
        console.error('Error creating Helia node: ', err);
    }
}


export async function createNode() {
    // the blockstore is where we store the blocks that make up files
    const blockstore = new FsBlockstore('./ipfs');

    // application-specific data lives in the datastore
    const datastore = new MemoryDatastore()

    // libp2p is the networking layer that underpins Helia
    const libp2p = await createLibp2p({
        datastore,
        addresses: {
            listen: [
                '/ip4/127.0.0.1/tcp/0'
            ]
        },
        transports: [
            tcp()
        ],
        connectionEncryption: [
            noise()
        ],
        streamMuxers: [
            yamux()
        ],
        peerDiscovery: [
            bootstrap({
                list: [
                    '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
                    '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
                    '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
                    '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
                ]
            })
        ],
        services: {
            identify: identify()
        }
    })

    return await createHelia({
        datastore,
        blockstore,
        libp2p
    })
}
