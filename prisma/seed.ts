import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL); // debug rápido

  const categories = [
    { name: "Saúde" },
    { name: "Segurança" },
    { name: "Infraestrutura" },
    { name: "Educação" },
    { name: "Transporte" },
    { name: "Saneamento" },
    { name: "Assistência Social" },
    { name: "Habitação" },
    { name: "Meio Ambiente" },
    { name: "Cultura e Lazer" },
    { name: "Mobilidade Urbana" },
    { name: "Iluminação Pública" },
    { name: "Limpeza Urbana" },
    { name: "Direitos Humanos" },
    { name: "Tecnologia e Inovação" },
    { name: "Emprego e Renda" },
    { name: "Administração Pública" },
  ];

  for (const category of categories) {
    await prisma.category.create({
      data: {
        name: category.name,
      },
    });
  }

  console.log("Seed de categorias criado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
