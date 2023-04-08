import EventEmitter from 'eventemitter3'
import { PublicKey, Transaction } from '@solana/web3.js'
import { WalletAdapter } from './types'
import { DEFAULT_PUBLICKEY } from '@consts/static'

interface ExodusProvider {
  isConnected: boolean
  publicKey?: PublicKey
  signTransaction: (transaction: Transaction) => Promise<Transaction>
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>
  connect: () => Promise<{ publicKey: PublicKey }>
  disconnect: () => Promise<void>
}

export class ExodusWalletAdapter extends EventEmitter implements WalletAdapter {
  _publicKey: PublicKey

  constructor() {
    super()
    this._publicKey = DEFAULT_PUBLICKEY
  }

  get autoApprove() {
    return false
  }

  get connected() {
    return this._provider.isConnected
  }

  public async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (!this._provider) {
      return transactions
    }

    return await this._provider.signAllTransactions(transactions)
  }

  private get _provider(): ExodusProvider {
    if ((window as any)?.exodus?.solana) {
      return (window as any).exodus.solana
    } else {
      throw new Error('Exodus: unable to get provider')
    }
  }

  get publicKey() {
    return this._publicKey || DEFAULT_PUBLICKEY
  }

  async signTransaction(transaction: Transaction) {
    if (!this._provider) {
      return transaction
    }

    return await this._provider.signTransaction(transaction)
  }

  async connect() {
    try {
      const pk = await this._provider.connect()
      this._publicKey = pk.publicKey
      this.emit('connect')
      return pk
    } catch (error) {
      console.log(error)
    }
  }

  async disconnect() {
    if (this._publicKey) {
      await this._provider.disconnect()
      this._publicKey = DEFAULT_PUBLICKEY
      this.emit('disconnect')
    }
  }
}
