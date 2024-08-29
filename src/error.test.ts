import { FuelError, ScriptTransactionRequest, Wallet } from "fuels";
import { launchTestNode } from "fuels/test-utils";

describe('Error', () => {
  it('should throw an error', async () => {
    const launched = await launchTestNode({
      nodeOptions: {
        args: ['--poa-instant', 'false', '--poa-interval-period', '1s'],
      },
      walletsConfig: {
        coinsPerAsset: 1,
        amountPerCoin: 10_000,
      },
    });
    const {
      provider,
      wallets: [wallet],
      cleanup
    } = launched;

    const baseAssetId = provider.getBaseAssetId();
    const recipient1 = Wallet.generate({ provider });
    const recipient2 = Wallet.generate({ provider });

    const resources = await wallet.getResourcesToSpend([[10_000, baseAssetId]]);

    const request = new ScriptTransactionRequest({
      maxFee: 1000,
    });

    const balanceBefore1 = (await recipient1.getBalance(baseAssetId)).toNumber();
    const balanceBefore2 = (await recipient2.getBalance(baseAssetId)).toNumber();

    expect(balanceBefore1).toBe(0);
    expect(balanceBefore2).toBe(0);

    request.addCoinOutput(recipient1.address, 100, baseAssetId);
    request.addCoinOutput(recipient2.address, 100, baseAssetId);

    request.addResources(resources);

    expect(request.gasLimit.toNumber()).toBe(0);
    const submitted = await wallet.sendTransaction(request);

    try {
      await submitted.waitForResult();
    } catch (error) {
      console.error(error);
      expect(/OutOfGas/.test((<FuelError>error).message)).toBeTruthy();
    }

    const balanceAfter1 = (await recipient1.getBalance(baseAssetId)).toNumber();
    const balanceAfter2 = (await recipient2.getBalance(baseAssetId)).toNumber();

    // expect(balanceBefore1).toEqual(balanceAfter1);
    // expect(balanceBefore2).toEqual(balanceAfter2);

    console.log('balanceAfter1: ', balanceAfter1)
    console.log('balanceAfter2: ', balanceAfter2)

    cleanup()
  });
})
