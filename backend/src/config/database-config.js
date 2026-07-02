const define = {
  timestamps: true,
  freezeTableName: true,
  underscored: true,
};

function isRenderInternalUrl(databaseUrl) {
  try {
    const { hostname } = new URL(databaseUrl);
    return /^dpg-[a-z0-9-]+$/.test(hostname);
  } catch {
    return false;
  }
}

function sqliteConfig() {
  return {
    dialect: 'sqlite',
    storage: 'database.sqlite',
    define,
  };
}

function buildConfig() {
  if (process.env.DATABASE_URL) {
    const isLocalRenderInternalUrl = isRenderInternalUrl(process.env.DATABASE_URL) && !process.env.RENDER;
    if (isLocalRenderInternalUrl) {
      console.warn(
        '[db] DATABASE_URL usa host interno do Render e nao funciona fora do Render. ' +
        'Usando SQLite local. Para Postgres no Docker, use a External Database URL.'
      );
      return sqliteConfig();
    }

    return {
      dialect: 'postgres',
      url: process.env.DATABASE_URL,
      define,
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    };
  }

  if (process.env.PGHOST) {
    return {
      dialect: 'postgres',
      host: process.env.PGHOST,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      username: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      define,
      dialectOptions:
        process.env.PGSSL === 'false' ? {} : { ssl: { require: true, rejectUnauthorized: false } },
    };
  }

  return sqliteConfig();
}

export const databaseConfig = buildConfig();
