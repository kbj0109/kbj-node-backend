const fs = require('fs-extra');
const path = require('path');
const dotenv = require('dotenv');
const chalk = require('chalk');

/**
 * 우선순위대로 env override
 * 1: .env.(development | production).local
 * 2: .env.(development | production)
 * 3: .env.local
 * 4: .env
 */

// 환경변수 Override
function envOverride(filepath) {
  try {
    const envConfig = dotenv.parse(
      fs.readFileSync(path.join(__dirname, filepath)),
    );
    Object.keys(envConfig).forEach(k => {
      process.env[k] = envConfig[k];
    });
  } catch (e) {
    // console.log(e);
  }
}

// 공통 환경변수
dotenv.config({ path: path.join(__dirname, '.env') });
// local override
envOverride(`.env.local`);

if (
  process.env.NODE_ENV === 'production' ||
  process.env.NODE_ENV === 'development' ||
  process.env.NODE_ENV === 'test'
) {
  envOverride(`.env.${process.env.NODE_ENV}`);

  // local override
  envOverride(`.env.${process.env.NODE_ENV}.local`);
}

console.log(chalk.green(`** process.env.NODE_ENV: ${process.env.NODE_ENV}`));
