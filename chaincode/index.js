const { Contract } = require('fabric-contract-api');

class AssetContract extends Contract {
    constructor() {
        super('AssetContract');
    }

    async InitLedger(ctx) {
        console.info('Initializing ledger with sample assets');
        const assets = [
            {
                assetId: 'ASSET001',
                orgId: 'Org1',
                metadata: JSON.stringify({
                    name: 'Organic Coffee Beans',
                    origin: 'Colombia',
                    carbonFootprint: '2.5kg CO2',
                    certification: 'Fair Trade',
                    timestamp: new Date().toISOString()
                }),
                owner: 'Org1',
                status: 'CREATED'
            },
            {
                assetId: 'ASSET002',
                orgId: 'Org2',
                metadata: JSON.stringify({
                    name: 'Recycled Paper',
                    origin: 'Sweden',
                    carbonFootprint: '1.2kg CO2',
                    certification: 'FSC',
                    timestamp: new Date().toISOString()
                }),
                owner: 'Org2',
                status: 'CREATED'
            }
        ];

        for (const asset of assets) {
            await ctx.stub.putState(asset.assetId, Buffer.from(JSON.stringify(asset)));
            console.info(`Added asset: ${asset.assetId}`);
        }
    }

    async CreateAsset(ctx, assetId, orgId, metadata) {
        console.info(`Creating asset: ${assetId} for org: ${orgId}`);

        const exists = await this.AssetExists(ctx, assetId);
        if (exists) {
            throw new Error(`Asset ${assetId} already exists`);
        }

        const asset = {
            assetId,
            orgId,
            metadata,
            owner: orgId,
            status: 'CREATED',
            timestamp: new Date().toISOString(),
            history: []
        };

        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        
        // Emit event
        ctx.stub.setEvent('AssetCreated', Buffer.from(JSON.stringify(asset)));
        
        return JSON.stringify(asset);
    }

    async ReadAsset(ctx, assetId) {
        const assetJSON = await ctx.stub.getState(assetId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`Asset ${assetId} does not exist`);
        }
        return assetJSON.toString();
    }

    async UpdateAsset(ctx, assetId, newMetadata) {
        const assetJSON = await ctx.stub.getState(assetId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`Asset ${assetId} does not exist`);
        }

        const asset = JSON.parse(assetJSON.toString());
        
        // Add to history
        asset.history.push({
            previousMetadata: asset.metadata,
            newMetadata,
            updatedBy: ctx.stub.getCreator().getMspid(),
            timestamp: new Date().toISOString()
        });
        
        asset.metadata = newMetadata;
        asset.lastUpdated = new Date().toISOString();

        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        
        ctx.stub.setEvent('AssetUpdated', Buffer.from(JSON.stringify(asset)));
        
        return JSON.stringify(asset);
    }

    async TransferAsset(ctx, assetId, newOwner) {
        const assetJSON = await ctx.stub.getState(assetId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`Asset ${assetId} does not exist`);
        }

        const asset = JSON.parse(assetJSON.toString());
        const previousOwner = asset.owner;
        
        asset.owner = newOwner;
        asset.status = 'TRANSFERRED';
        asset.transferHistory = asset.transferHistory || [];
        asset.transferHistory.push({
            from: previousOwner,
            to: newOwner,
            timestamp: new Date().toISOString(),
            transferredBy: ctx.stub.getCreator().getMspid()
        });
        asset.lastUpdated = new Date().toISOString();

        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        
        ctx.stub.setEvent('AssetTransferred', Buffer.from(JSON.stringify(asset)));
        
        return JSON.stringify(asset);
    }

    async GetAllAssets(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        
        return JSON.stringify(allResults);
    }

    async AssetExists(ctx, assetId) {
        const assetJSON = await ctx.stub.getState(assetId);
        return assetJSON && assetJSON.length > 0;
    }

    async GetAssetHistory(ctx, assetId) {
        const historyIterator = await ctx.stub.getHistoryForKey(assetId);
        const history = [];
        
        while (true) {
            const historyResult = await historyIterator.next();
            if (historyResult.done) {
                await historyIterator.close();
                return JSON.stringify(history);
            }
            
            const tx = historyResult.value;
            history.push({
                txId: tx.txId,
                timestamp: tx.timestamp,
                isDelete: tx.isDelete.toString(),
                value: tx.value.toString('utf8')
            });
        }
    }
}

module.exports = AssetContract;

