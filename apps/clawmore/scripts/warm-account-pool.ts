import {
  createManagedAccount,
  waitForAccountCreation,
  bootstrapManagedAccount,
} from '../lib/aws/vending';
import { createServerlessSCP, attachSCPToAccount } from '../lib/aws/governance';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

const EXPECTED_ACCOUNT_ID = '316759592139';

/**
 * Script to pre-provision a "Warm Pool" of AWS accounts for ClawMore.
 */
async function warmPool(targetSize: number = 3) {
  // 0. Safety Check
  const sts = new STSClient({});
  const identity = await sts.send(new GetCallerIdentityCommand({}));
  if (identity.Account !== EXPECTED_ACCOUNT_ID) {
    console.error(
      `[CRITICAL] Safety check failed! Expected ${EXPECTED_ACCOUNT_ID}, found ${identity.Account}. Aborting.`
    );
    process.exit(1);
  }

  console.log(`[WarmPool] Verified Hub Account: ${identity.Account}`);
  console.log(`[WarmPool] Checking pool status (Target: ${targetSize})...`);

  // Must be the email tied to the master AWS account (aiready org)
  const adminEmail = process.env.ADMIN_EMAIL || 'caodanju@gmail.com';

  // 1. Check existing pool
  // For a robust script, we'd list all accounts and filter by tag.
  // But let's assume we want to add one if the pool needs warming.

  for (let i = 0; i < targetSize; i++) {
    console.log(`[WarmPool] Provisioning account ${i + 1}/${targetSize}...`);

    try {
      const { requestId } = await createManagedAccount(
        adminEmail,
        'WarmPool',
        undefined,
        true
      );
      console.log(`[WarmPool] Request ${requestId} initiated. Waiting...`);

      const accountId = await waitForAccountCreation(requestId);
      console.log(`[WarmPool] Account ${accountId} created. Bootstrapping...`);

      // Bootstrap with SCPs
      const scpId = await createServerlessSCP();
      await attachSCPToAccount(scpId, accountId);

      // Bootstrap with IAM roles
      await bootstrapManagedAccount(accountId);

      console.log(`[WarmPool] Account ${accountId} is now WARM and READY.`);
    } catch (err) {
      console.error(`[WarmPool] Failed to warm account:`, err);
    }
  }
}

// Get target size from CLI arg
const size = parseInt(process.argv[2] || '3', 10);
warmPool(size).then(() => console.log('[WarmPool] Finished.'));
