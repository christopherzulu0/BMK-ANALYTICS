import "dotenv/config";
import { PrismaMssql } from '@prisma/adapter-mssql';
import { PrismaClient } from "./generated/prisma";

// Parse DATABASE_URL to extract connection parameters
// Supports formats:
// - sqlserver://server:port;database=dbname;user=username;password=password;encrypt=true
// - sqlserver://user:password@server:port;database=dbname;encrypt=true
function parseDatabaseUrl(url: string) {
  if (!url) {
    throw new Error("DATABASE_URL is not defined");
  }

  // Remove any whitespace
  url = url.trim();

  // Check if it starts with sqlserver://
  if (!url.startsWith('sqlserver://')) {
    throw new Error(`Invalid DATABASE_URL format. Expected to start with 'sqlserver://'. Got: ${url.substring(0, 20)}...`);
  }

  // Remove the protocol prefix
  const urlWithoutProtocol = url.replace(/^sqlserver:\/\//, '');

  // Try to parse as URL first (for user:password@host:port format)
  let hostname: string;
  let port: string = '1433';
  let user: string | undefined;
  let password: string | undefined;
  const params: Record<string, string> = {};

  // Check if it has @ (user:password@host format)
  if (urlWithoutProtocol.includes('@')) {
    const [authPart, rest] = urlWithoutProtocol.split('@');
    const [userPart, passPart] = authPart.split(':');
    user = decodeURIComponent(userPart);
    password = decodeURIComponent(passPart || '');
    
    // Parse the rest
    const [hostPart, ...paramParts] = rest.split(';');
    const [host, portPart] = hostPart.includes(':') ? hostPart.split(':') : [hostPart, '1433'];
    hostname = host;
    port = portPart || '1433';

    // Parse remaining parameters
    for (const param of paramParts) {
      if (!param.trim()) continue; // Skip empty parameters (e.g., trailing semicolon)
      const [key, value] = param.split('=');
      if (key && value) {
        params[key.toLowerCase().trim()] = value.trim();
      }
    }
  } else {
    // Parse semicolon-separated format: server:port;key=value;key=value
    const parts = urlWithoutProtocol.split(';');
    const serverPart = parts[0];
    const [host, portPart] = serverPart.includes(':') 
      ? serverPart.split(':') 
      : [serverPart, '1433'];
    hostname = host;
    port = portPart || '1433';

    // Parse parameters
    for (let i = 1; i < parts.length; i++) {
      if (!parts[i].trim()) continue; // Skip empty parameters (e.g., trailing semicolon)
      const [key, value] = parts[i].split('=');
      if (key && value) {
        params[key.toLowerCase().trim()] = decodeURIComponent(value.trim());
      }
    }
  }

  // Extract values from params (override if they were in URL auth)
  // Support both 'database' and 'databaseName' parameter names
  const database = params['database'] || params['databasename'];
  user = user || params['user'];
  password = password || params['password'];
  const encryptParam = params['encrypt'];
  const trustServerCertParam = params['trustservercertificate'];
  const integratedSecurityParam = params['integratedsecurity'];

  // Validate required fields
  if (!database) {
    throw new Error("DATABASE_URL must include 'database' or 'databaseName' parameter");
  }
  // Only require user/password if integratedSecurity is false or not set
  const integratedSecurity = integratedSecurityParam?.toLowerCase() === 'true';
  if (!integratedSecurity) {
    if (!user) {
      throw new Error("DATABASE_URL must include 'user' parameter or user in URL auth");
    }
    if (!password) {
      throw new Error("DATABASE_URL must include 'password' parameter or password in URL auth");
    }
  }

  // Parse encrypt (default to true if not specified)
  const encrypt = encryptParam === undefined ? true : encryptParam.toLowerCase() === 'true';
  const trustServerCertificate = trustServerCertParam?.toLowerCase() === 'true';

  // Only decode if not already decoded (params from semicolon format are already decoded)
  const finalUser = user.includes('%') ? decodeURIComponent(user) : user;
  const finalPassword = password.includes('%') ? decodeURIComponent(password) : password;
  const finalDatabase = database.includes('%') ? decodeURIComponent(database) : database;

  return {
    user: finalUser,
    password: finalPassword,
    database: finalDatabase,
    server: port && port !== '1433' ? `${hostname},${port}` : hostname,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    },
    options: {
      encrypt: encrypt,
      trustServerCertificate: trustServerCertificate
    }
  };
}

let sqlConfig;
try {
  sqlConfig = parseDatabaseUrl(process.env.DATABASE_URL || '');
} catch (error) {
  console.error('Error parsing DATABASE_URL:', error);
  throw error;
}

let adapter;
try {
  adapter = new PrismaMssql(sqlConfig);
} catch (error) {
  console.error('Error creating PrismaMssql adapter:', error);
  console.error('Config used:', { ...sqlConfig, password: '***' });
  throw error;
}

// PrismaClient with adapter - DATABASE_URL should be available in environment for Prisma's internal use
const prisma = new PrismaClient({ adapter });

export { prisma }