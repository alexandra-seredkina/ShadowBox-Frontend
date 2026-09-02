/** Wrong key or tampered ciphertext; AEAD does not tell the two apart. */
export class DecryptionFailedError extends Error {
  readonly code = "DECRYPTION_FAILED";

  constructor(options?: ErrorOptions) {
    super("Decryption failed", options);
    this.name = "DecryptionFailedError";
  }
}

export class InvalidRecoveryPhraseError extends Error {
  readonly code = "INVALID_RECOVERY_PHRASE";

  constructor(options?: ErrorOptions) {
    super("Recovery phrase is not valid", options);
    this.name = "InvalidRecoveryPhraseError";
  }
}
