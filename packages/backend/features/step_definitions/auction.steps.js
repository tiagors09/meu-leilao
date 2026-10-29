import assert from 'node:assert/strict';
import { Given, Then, When, setWorldConstructor } from '@cucumber/cucumber';
import { BidService } from '../../src/services/BidService.js';
import { WalletService } from '../../src/services/WalletService.js';

class AuctionWorld {
  wallet = null;
  lot = null;
  bidderId = 1;
  highestBid = null;
  result = null;
  error = null;

  async placeBid(amount) {
    const world = this;
    const bidRepository = {
      withLotTransaction: async (_lotId, operation) => operation({
        lot: world.lot,
        highestBid: world.highestBid,
        latestBid: world.highestBid ? { hash: 'a'.repeat(64) } : null,
        getWalletsForUpdate: async (userIds) => new Map(userIds.map((userId) => [
          Number(userId),
          Number(userId) === world.bidderId
            ? world.wallet
            : { user_id: userId, balance_total: 1000, balance_pledged: 100 },
        ])),
        updatePledgedBalance: async (userId, delta) => {
          const target = Number(userId) === world.bidderId
            ? world.wallet
            : { balance_pledged: 100 };
          target.balance_pledged = Number(target.balance_pledged) + Number(delta);
        },
        createBid: async (bid) => ({ ...bid, hash: 'b'.repeat(64) }),
        extendLotEndTime: async () => new Date(Date.now() + 60_000),
      }),
    };
    const bidService = new BidService({ bidRepository });
    return bidService.placeBid(this.lot.id, this.bidderId, amount);
  }
}

setWorldConstructor(AuctionWorld);

Given('que minha carteira possui saldo total de {int} reais e nenhum valor comprometido', function (balance) {
  this.wallet = { user_id: this.bidderId, balance_total: balance, balance_pledged: 0 };
});

When('deposito {int} reais', async function (amount) {
  const repository = {
    findByUserId: async () => ({ ...this.wallet }),
    increaseBalance: async (_userId, delta) => {
      this.wallet.balance_total = Number(this.wallet.balance_total) + Number(delta);
      return { ...this.wallet };
    },
  };
  const service = new WalletService({ walletRepository: repository });
  this.result = await service.deposit(this.bidderId, amount);
});

Then('o saldo total deve ser {int} reais', function (amount) {
  assert.equal(this.result.balance_total, amount);
});

Then('o saldo disponivel deve ser {int} reais', function (amount) {
  assert.equal(this.result.balance_available, amount);
});

Given('que o lote ao vivo tem preco inicial de {int} reais e incremento minimo de {int} reais', function (initialPrice, increment) {
  this.lot = {
    id: 7,
    initial_price: initialPrice,
    min_increment: increment,
    start_time: new Date(Date.now() - 60_000),
    end_time: new Date(Date.now() + 60_000),
    status: 'LIVE',
  };
});

When('dou um lance de {int} reais', async function (amount) {
  try { this.result = await this.placeBid(amount); }
  catch (error) { this.error = error; }
});

Then('o lance deve ser aceito', function () {
  assert.equal(this.error, null);
  assert.ok(this.result.bid);
});

Then('{int} reais devem ficar comprometidos', function (amount) {
  assert.equal(Number(this.wallet.balance_pledged), amount);
});

Then('o lance deve ser rejeitado por valor abaixo do minimo', function () {
  assert.equal(this.error?.statusCode, 400);
  assert.match(this.error?.message, /lance minimo/i);
});

Given('que eu sou o lider com lance de {int} reais', function (amount) {
  this.wallet = { user_id: this.bidderId, balance_total: 1000, balance_pledged: amount };
  this.highestBid = { bidder_id: this.bidderId, amount, hash: 'a'.repeat(64) };
});

When('dou um novo lance de {int} reais', async function (amount) {
  try { this.result = await this.placeBid(amount); }
  catch (error) { this.error = error; }
});

Then('o lance deve ser rejeitado por lideranca atual', function () {
  assert.equal(this.error?.statusCode, 409);
  assert.match(this.error?.message, /lider atual/i);
});
