const define = {
  timestamps: true,
  freezeTableName: true,
  underscored: true,
};

function buildConfig() {
  if (process.env.DATABASE_URL) {
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

  return {
    dialect: 'sqlite',
    storage: 'database.sqlite',
    define,
  };
}

export const databaseConfig = buildConfig();
