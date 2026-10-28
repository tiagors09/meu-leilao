-- 1. Tabela de Usuarios (Users)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'LEILOEIRO', 'LICITANTE')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Carteiras (Wallets)
CREATE TABLE IF NOT EXISTS wallets (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance_total >= 0),
  balance_pledged DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance_pledged >= 0),
  CONSTRAINT check_balance_pledged_limit CHECK (balance_pledged <= balance_total)
);

-- 3. Tabela de Cache de Itens Externos (Items)
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  id_externo VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  image_url TEXT,
  raw_payload JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Lotes do Leilao (AuctionLots)
CREATE TABLE IF NOT EXISTS auction_lots (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  item_id INT REFERENCES items(id) ON DELETE SET NULL,
  initial_price DECIMAL(12, 2) NOT NULL CHECK (initial_price >= 0),
  min_increment DECIMAL(12, 2) NOT NULL CHECK (min_increment > 0),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' 
    CHECK (status IN ('SCHEDULED', 'LIVE', 'CLOSED', 'CANCELLED')),
  seller_id INT NOT NULL REFERENCES users(id),
  winner_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_valid_dates CHECK (end_time > start_time)
);

-- 5. Tabela de Lances (Bids) - Com suporte a hash para auditoria de integridade
CREATE TABLE IF NOT EXISTS bids (
  id SERIAL PRIMARY KEY,
  lot_id INT NOT NULL REFERENCES auction_lots(id) ON DELETE CASCADE,
  bidder_id INT NOT NULL REFERENCES users(id),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  previous_hash VARCHAR(64),
  hash VARCHAR(64) NOT NULL
);

-- 6. Tabela de Comprovantes (Receipts)
CREATE TABLE IF NOT EXISTS receipts (
  id SERIAL PRIMARY KEY,
  lot_id INT UNIQUE NOT NULL REFERENCES auction_lots(id) ON DELETE CASCADE,
  winner_id INT NOT NULL REFERENCES users(id),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  share_code VARCHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDICES PARA DESEMPENHO (Opcional, mas melhora bastante a velocidade das buscas)
CREATE INDEX IF NOT EXISTS idx_auction_lots_status ON auction_lots(status);
CREATE INDEX IF NOT EXISTS idx_bids_lot_id ON bids(lot_id);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at);
CREATE INDEX IF NOT EXISTS idx_receipts_share_code ON receipts(share_code);
