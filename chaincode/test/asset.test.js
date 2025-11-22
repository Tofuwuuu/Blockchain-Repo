const { expect } = require('chai');
const { ChaincodeStub } = require('fabric-shim');
const { AssetContract } = require('../index');

describe('AssetContract', () => {
    let contract;
    let mockStub;

    beforeEach(() => {
        contract = new AssetContract();
        mockStub = {
            getState: async (key) => {
                return null;
            },
            putState: async (key, value) => {
                return;
            },
            getStateByRange: async (startKey, endKey) => {
                return {
                    next: async () => ({ done: true })
                };
            },
            getHistoryForKey: async (key) => {
                return {
                    next: async () => ({ done: true }),
                    close: async () => {}
                };
            },
            setEvent: async (eventName, payload) => {
                return;
            },
            getCreator: () => ({
                getMspid: () => 'Org1MSP'
            })
        };
    });

    describe('CreateAsset', () => {
        it('should create a new asset', async () => {
            const ctx = {
                stub: mockStub
            };

            mockStub.getState = async (key) => {
                return null; // Asset doesn't exist
            };

            const result = await contract.CreateAsset(
                ctx,
                'ASSET001',
                'Org1',
                '{"name": "Test Asset"}'
            );

            const asset = JSON.parse(result);
            expect(asset.assetId).to.equal('ASSET001');
            expect(asset.orgId).to.equal('Org1');
            expect(asset.status).to.equal('CREATED');
        });

        it('should throw error if asset already exists', async () => {
            const ctx = {
                stub: mockStub
            };

            mockStub.getState = async (key) => {
                return Buffer.from(JSON.stringify({ assetId: 'ASSET001' }));
            };

            await expect(
                contract.CreateAsset(ctx, 'ASSET001', 'Org1', '{}')
            ).to.be.rejectedWith('Asset ASSET001 already exists');
        });
    });

    describe('ReadAsset', () => {
        it('should read an existing asset', async () => {
            const ctx = {
                stub: mockStub
            };

            const assetData = {
                assetId: 'ASSET001',
                orgId: 'Org1',
                metadata: '{}'
            };

            mockStub.getState = async (key) => {
                return Buffer.from(JSON.stringify(assetData));
            };

            const result = await contract.ReadAsset(ctx, 'ASSET001');
            const asset = JSON.parse(result);
            expect(asset.assetId).to.equal('ASSET001');
        });

        it('should throw error if asset does not exist', async () => {
            const ctx = {
                stub: mockStub
            };

            mockStub.getState = async (key) => {
                return null;
            };

            await expect(
                contract.ReadAsset(ctx, 'NONEXISTENT')
            ).to.be.rejectedWith('Asset NONEXISTENT does not exist');
        });
    });
});

