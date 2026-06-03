import { execFileSync } from "node:child_process";

const port = process.env.PORT ?? "3000";

try {
  const output = execFileSync("lsof", [`-tiTCP:${port}`, "-sTCP:LISTEN"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();

  if (output) {
    console.error(
      `Port ${port} deja utilise par le process ${output.split("\n")[0]}. Arrete le serveur Next actif avant de relancer npm run dev, sinon les assets CSS/JS peuvent devenir incoherents.`,
    );
    process.exit(1);
  }
} catch {
  process.exit(0);
}
