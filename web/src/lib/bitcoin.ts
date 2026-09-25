import {MINT_FEE_SATS, TREASURY_ADDRESS} from "./protocol";
import {ProtocolError} from "./store";

type MempoolOutput = {
  value: number;
  scriptpubkey_address?: string;
};

type MempoolInput = {
  prevout?: {
    scriptpubkey_address?: string;
  };
};

type MempoolTransaction = {
  txid: string;
  vin: MempoolInput[];
  vout: MempoolOutput[];
};

const TXID = /^[0-9a-f]{64}$/i;

/**
 * Verify a real mainnet transaction against mempool.space.
 * Confirmation is not required, but the transaction must be propagated and
 * pay the configured Taproot treasury output.
 */
export async function verifyIssuancePayment(input: {
  txid: string;
  payerAddress: string;
}): Promise<void> {
  if (!TXID.test(input.txid)) {
    throw new ProtocolError("invalid transaction id");
  }
  if (!input.payerAddress.startsWith("bc1")) {
    throw new ProtocolError("mainnet Bitcoin payer address required");
  }

  const response = await fetch(
    `https://mempool.space/api/tx/${input.txid.toLowerCase()}`,
    {cache: "no-store"},
  );

  if (response.status === 404) {
    throw new ProtocolError(
      "transaction not propagated yet; retry after broadcast",
      422,
    );
  }
  if (!response.ok) {
    throw new ProtocolError("Bitcoin verification unavailable", 503);
  }

  const tx = (await response.json()) as MempoolTransaction;
  const paid = tx.vout.some(
    (output) =>
      output.scriptpubkey_address === TREASURY_ADDRESS &&
      output.value >= MINT_FEE_SATS,
  );
  if (!paid) {
    throw new ProtocolError("transaction does not contain issuance output");
  }

  const payerOwnsInput = tx.vin.some(
    (vin) => vin.prevout?.scriptpubkey_address === input.payerAddress,
  );
  if (!payerOwnsInput) {
    throw new ProtocolError("payer address does not match transaction inputs");
  }
}
