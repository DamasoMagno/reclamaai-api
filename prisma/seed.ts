import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { Impact, Recurrence, Status } from "../generated/prisma/enums";

async function main() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);

  // ---------------------------------------------------
  // 1. Criar Categorias (8 generalistas)
  // ---------------------------------------------------
  const categoriesData = [
    { name: "Meio Ambiente" },
    { name: "Infraestrutura" },
    { name: "Saúde Pública" },
    { name: "Transporte" },
    { name: "Segurança" },
    { name: "Educação" },
    { name: "Saneamento" },
    { name: "Administração Pública" },
  ];

  const categories = [];

  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
      },
    });
    categories.push(created);
  }

  console.log("✔ Categorias criadas!");

  // ---------------------------------------------------
  // 2. Criar Subcategorias (4 para cada categoria)
  // ---------------------------------------------------
  const subcategoryMap: Record<string, any[]> = {};

  const subcategoriesByCategory = {
    "Meio Ambiente": ["Poluição", "Desmatamento", "Queimadas", "Preservação"],
    "Infraestrutura": ["Vias Urbanas", "Iluminação Pública", "Pavimentação", "Sinalização"],
    "Saúde Pública": ["Hospitais", "Postos de Saúde", "Agentes de Saúde", "Vigilância Sanitária"],
    "Transporte": ["Ônibus", "Pontos de Apoio", "Trânsito", "Acessibilidade"],
    "Segurança": ["Policiamento", "Monitoramento", "Iluminação", "Guarda Municipal"],
    "Educação": ["Escolas", "Professores", "Merenda Escolar", "Transporte Escolar"],
    "Saneamento": ["Água", "Esgoto", "Coleta de Lixo", "Drenagem"],
    "Administração Pública": ["Atendimento", "Serviços Digitais", "Burocracia", "Gestão Pública"],
  };

  for (const category of categories) {
    const subs = subcategoriesByCategory[category.name as keyof typeof subcategoriesByCategory];

    for (const sub of subs) {
      const created = await prisma.subcategory.create({
        data: {
          name: sub,
          categoryId: category.id,
        },
      });

      if (!subcategoryMap[category.name]) subcategoryMap[category.name] = [];
      subcategoryMap[category.name].push(created);
    }
  }

  console.log("✔ Subcategorias criadas!");

  // ---------------------------------------------------
  // 3. Criar problemas
  // ---------------------------------------------------

  const problemsData = [
    {
      title: "Incêndio na serra de Itapipoca",
      location: "Serra de Itapipoca, CE",
      sub: subcategoryMap["Meio Ambiente"].find((s) => s.name === "Queimadas")!,
      recurrence: "FIRST",
      impact: "CITY",
      status: "STATED",
    },
    {
      title: "Esgoto a céu aberto",
      location: "Rua João Batista, Bairro Centro",
      sub: subcategoryMap["Saneamento"].find((s) => s.name === "Esgoto")!,
      recurrence: "ALWAYS",
      impact: "STREET",
      status: "IN_PROGRESS",
    },
    {
      title: "Acúmulo de lixo nas ruas",
      location: "Avenida Perimetral, Itapipoca",
      sub: subcategoryMap["Saneamento"].find((s) => s.name === "Coleta de Lixo")!,
      recurrence: "SOMETIMES",
      impact: "NEIGHBORHOOD",
      status: "STATED",
    },
  ];

  const problems = [];

  for (const data of problemsData) {
    const created = await prisma.problem.create({
      data: {
        location: data.location,
        recurrence: data.recurrence as Recurrence,
        impact: data.impact as Impact,
        status: data.status as Status,
        subcategoryId: data.sub.id,
      },
    });

    problems.push(created);
  }

  console.log("✔ Problemas criados!");

  // ---------------------------------------------------
  // 4. Criar comentários (4 para cada problema)
  // ---------------------------------------------------

  const fakeUsers = [];

  for (let i = 1; i <= 12; i++) {
    const usr = await prisma.user.create({
      data: {
        name: `Usuário ${i}`,
        email: `usuario${i}@email.com`,
        password: "senha_teste",
      },
    });

    fakeUsers.push(usr);
  }

  console.log("✔ Usuários criados!");

  const commentsByProblem = [
    [
      "A fumaça tomou conta do bairro inteiro!",
      "Demoraram demais para agir, isso é um absurdo.",
      "Os moradores tiveram que ajudar enquanto nada era feito.",
      "A serra ficou devastada, é muito triste ver isso acontecendo.",
    ],
    [
      "O cheiro é insuportável, impossível morar assim.",
      "Esse esgoto escorrendo na rua é um risco para as crianças.",
      "Já faz meses e ninguém resolve.",
      "A proliferação de insetos está aumentando cada dia mais.",
    ],
    [
      "O acúmulo de lixo está atraindo muitos animais.",
      "A coleta deveria ser mais frequente.",
      "A rua fica intransitável de tanto lixo.",
      "Há semanas ninguém passa recolhendo.",
    ],
  ];

  let userIndex = 0;

  for (let i = 0; i < problems.length; i++) {
    const problem = problems[i];
    const comments = commentsByProblem[i];

    for (const content of comments) {
      await prisma.comment.create({
        data: {
          content,
          problemId: problem.id,
          userId: fakeUsers[userIndex].id,
        },
      });
      userIndex++;
    }
  }

  console.log("✔ Comentários criados!");
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
