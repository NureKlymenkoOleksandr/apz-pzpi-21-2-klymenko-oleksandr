const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000

app.use(cors());

const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
};

const backupDir = path.join(__dirname, "backups");

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

const createBackup = (_, res) => {
  const timestamp = new Date()
    .toISOString()
    .replace(/T/, "_")
    .replace(/:/g, "-")
    .split(".")[0];
  const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);

  const command = `pg_dump -U ${dbConfig.user} -h ${dbConfig.host} -d ${dbConfig.database} -F c -b -v -f "${backupFile}"`;

  exec(
    command,
    { env: { PGPASSWORD: dbConfig.password } },
    (error, _, stderr) => {
      if (error) {
        console.error(`Backup error: ${stderr}`);
        return res.status(500).send(`Backup failed. Error: ${stderr}`);
      }
      console.log(`Backup created successfully: ${backupFile}`);
      res.send(`Backup created successfully: ${backupFile}`);
    }
  );
};

const listBackups = (_, res) => {
  fs.readdir(backupDir, (err, files) => {
    if (err) {
      console.error(`Error reading backup directory: ${err}`);
      return res.status(500).send(`Error reading backup directory: ${err}`);
    }

    const backups = files.map((file) => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      const fileParts = file.split("_");
      const date = `${fileParts[1]}T${fileParts[2].replace(/-/g, ":")}`.split(
        "."
      )[0];
      return {
        date,
        size: stats.size,
      };
    });

    res.json(backups.reverse());
  });
};

app.post("/backups", createBackup);
app.get("/backups", listBackups);

app.listen(port, () => {
  console.log(`Backup service running on port ${port}`);
});
