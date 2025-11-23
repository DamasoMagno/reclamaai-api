import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);

  // -----------------------------
  // 1. Criar categorias
  // -----------------------------
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
      data: { name: category.name },
    });
  }

  console.log("✔ Categorias criadas!");

  // -----------------------------
  // 2. Criar tópico principal
  // -----------------------------
  const category = await prisma.category.findFirst({
    where: { name: "Meio Ambiente" },
  });

  if (!category) throw new Error("Categoria 'Meio Ambiente' não encontrada.");

  const topic = await prisma.topic.create({
    data: {
      title: "Incêndio na serra de Itapipoca-CE",
      summary:
        "Incêndio florestal ocorrido entre 28 e 30 de setembro de 2025, devastando grande parte da serra próxima à cidade. Moradores denunciaram demora das autoridades.",
      priority: "HIGH",
      categoryId: category.id,
      locationHint: "Serra de Itapipoca, CE",
      categoryHint:
        "Problema ambiental envolvendo fogo descontrolado e demora na resposta pública.",
    },
  });

  console.log("✔ Tópico criado:", topic.title);

  // -----------------------------
  // 3. Criar usuários fictícios
  // -----------------------------
  const fakeUsers = [
    { name: "Maria do Carmo Oliveira", email: "maria.carmo@email.com" },
    { name: "João Victor Mendes", email: "joao.mendes@email.com" },
    { name: "Ana Luiza Ferreira", email: "ana.luiza@email.com" },
    { name: "Carlos Henrique Lopes", email: "carlos.hlopes@email.com" },
    { name: "Fernanda Araújo Silva", email: "fernanda.araujo@email.com" },
    { name: "Rafael Monteiro Dias", email: "rafael.dias@email.com" },
    { name: "Juliana Beatriz Costa", email: "juliana.costa@email.com" },
    { name: "Pedro Lucas Tavares", email: "pedro.tavares@email.com" },
    { name: "Larissa Lima Ribeiro", email: "larissa.ribeiro@email.com" },
    { name: "Sérgio Matos Almeida", email: "sergio.almeida@email.com" },
  ];

  const createdUsers = [];

  for (const usr of fakeUsers) {
    const user = await prisma.user.create({
      data: {
        name: usr.name,
        email: usr.email,
        password: "hash_senha_teste",
      },
    });

    createdUsers.push(user);
  }

  console.log("✔ 10 usuários criados!");

  // -----------------------------
  // 4. Reclamações geradas
  // -----------------------------
  const complaintsTexts = [
    "A fumaça tomou conta da cidade inteira e dificultou a respiração de todos. As autoridades demoraram demais para agir.",
    "O fogo avançou muito rápido e ninguém apareceu para ajudar os moradores próximos da serra.",
    "Acordei de madrugada com minha casa cheia de fuligem. Isso poderia ter sido evitado se os órgãos responsáveis tivessem agido antes.",
    "Os animais silvestres estão fugindo para as áreas urbanas. A situação está descontrolada.",
    "A prefeitura só se manifestou depois de quase 24 horas de incêndio. Um absurdo.",
    "Os moradores fizeram vaquinha para comprar água e ajudar a combater o fogo enquanto as autoridades não chegavam.",
    "Meu avô, que tem problemas respiratórios, passou mal pela grande quantidade de fumaça.",
    "As chamas estavam tão perto da estrada que ficou perigoso trafegar. Falta total de preparo.",
    "A serra está devastada. Uma área enorme de mata foi perdida por descaso.",
    "Muitos voluntários ajudaram, mas o poder público falhou completamente no tempo de resposta.",
  ];

  for (let i = 0; i < complaintsTexts.length; i++) {
    await prisma.complaint.create({
      data: {
        text: complaintsTexts[i],
        location: "Serra de Itapipoca, CE",
        topicId: topic.id,
        userId: createdUsers[i].id,
      },
    });
  }

  console.log("✔ 10 reclamações criadas!");
  console.log("🌱 SEED COMPLETO FINALIZADO!");
}

main()
  .catch((e) => {
    console.error("❌ ERRO NO SEED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
