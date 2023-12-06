1. Kan du förklara skillnaden mellan synkron och asynkron kod i Node.js?
   I en synkron programmeringsmodell exekveras varje kodrad i ordning, medan i en asynkron modell, som också kallas Asynchronous I/O, styrs exekveringen av en central event loop. När en I/O-operation blockeras överlämnas kontrollen till event loopen, vilket sker vid blockande operationer som tangentbordsinmatning eller filläsning/skrivning.

2. Beskriv användningen av middleware i Express och ge exempel på några vanliga middleware.
   Middleware underlättar organisationen och strukturen för hantering av förfrågningar och svar i Express-applikationer. Det erbjuder en flexibel och modulär arkitektur som underlättar utvecklingen och underhållet av webbapplikationer.

3. Vilka fördelar erbjuder Prisma när det gäller att interagera med databasen?
   Prisma erbjuder Migrations, Active Maintenance och Support for DB of your choice.

4. Hur definierar du en modell för en tabell i Prisma?
   Man skriver in model namnPåTabellen och sen i {} så skriver man in vad man vill ska va i tabellen och sen lägger man sen vad som man vill ha till sin tabell. 
  model User {
  id         Int      @id @default(autoincrement())
  username   String   @unique
  password   String?
  roll       String?
  }

5. Vad är skillnaden mellan npm install och npm install --save?
   När du använder npm install installeras paketet för hela enheten och alla relaterade mappstrukturer. Å andra sidan, med kommandot npm install --save installeras paketet specifikt för en given mapp.
