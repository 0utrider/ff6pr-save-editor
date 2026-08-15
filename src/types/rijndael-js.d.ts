declare module "rijndael-js" {
  type ByteArrayLike = number[] | Uint8Array;

  export default class RijndaelBlock {
    constructor(key: ByteArrayLike, mode: "ecb" | "cbc");
    encrypt(plaintext: ByteArrayLike, blockSize: number, iv?: ByteArrayLike): number[];
    decrypt(ciphertext: ByteArrayLike, blockSize: number, iv?: ByteArrayLike): number[];
  }
}
