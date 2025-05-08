import { testWithSynpress } from '@synthetixio/synpress'
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright'
import basicSetup from '../wallet-setup/basic.setup'

// Set up the test environment with Synpress and MetaMask fixtures, using the basic setup configuration
const test = testWithSynpress(metaMaskFixtures(basicSetup))

const { expect } = test

// test('has title', async ({ page }) => {
//   await page.goto('/');

//   // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/TSender/);
// });

test('should connect', async ({ context, page, metamaskPage, extensionId }) => {
  // Navigate to the root page
  await page.goto('/');
  await expect(page.getByText('Please connect a wallet')).toBeVisible();

  // Create a new MetaMask instance with the provided context, page, password, and extension ID
  const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId)

  // Click the connect button to initiate the wallet connection
  await page.getByTestId('rk-connect-button').click()
  await page.getByTestId('rk-wallet-option-io.metamask').waitFor({
    state: 'visible',
    timeout: 30000
  });
  await page.getByTestId('rk-wallet-option-io.metamask').click();
  await metamask.connectToDapp();

  const customNetwork = {
    name: 'Anvil',
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 31337,
    symbol: 'ETH'
  }
  await metamask.addNetwork(customNetwork);
  await page.getByRole('textbox', { name: '0x', exact: true }).waitFor({
    state: 'visible',
    timeout: 30000
  });
  // Verify that we're connected and can see the Token Address field
  await expect(page.getByText('Token Address')).toBeVisible({ timeout: 10000 })
})
