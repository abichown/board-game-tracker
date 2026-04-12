import "dotenv/config";
import fs from "fs";
import csv from "csv-parser";
import prisma from "../src/lib/prisma";

const results: any[] = [];
const BATCH_SIZE = 500;

fs.createReadStream("data/boardgames.csv")
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", async () => {
    console.log(`Importing ${results.length} games...`);

    for (let i = 0; i < results.length; i += BATCH_SIZE) {
      const batch = results.slice(i, i + BATCH_SIZE);

      await prisma.boardGame.createMany({
        data: batch.map((row) => ({
          id: parseInt(row.id),
          name: row.name,
          yearPublished: row.yearpublished ? parseInt(row.yearpublished) : null,
          rank: row.rank ? parseInt(row.rank) : null,
          bayesAverage: row.bayesaverage ? parseFloat(row.bayesaverage) : null,
          average: row.average ? parseFloat(row.average) : null,
          usersRated: row.usersrated ? parseInt(row.usersrated) : null,
          isExpansion: row.is_expansion === "1",
        })),
        skipDuplicates: true,
      });

      console.log(
        `Inserted ${Math.min(i + BATCH_SIZE, results.length)} / ${results.length}`,
      );
    }

    console.log("Import complete!");
    await prisma.$disconnect();
  });
