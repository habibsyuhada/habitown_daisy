-- CreateTable
CREATE TABLE "Habit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'daily',
    "target" INTEGER NOT NULL DEFAULT 1,
    "icon" TEXT,
    "color" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "category" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitRecord" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "habitId" INTEGER NOT NULL,
    "value" DOUBLE PRECISION,
    "notes" TEXT,
    "mood" INTEGER,
    "difficulty" INTEGER,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HabitRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currency" (
    "base_code" VARCHAR NOT NULL,
    "conversion_rates" TEXT,
    "update_date" TIMESTAMP(6),

    CONSTRAINT "currency_pkey" PRIMARY KEY ("base_code")
);

-- CreateTable
CREATE TABLE "documentinteractive" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "desc" TEXT,
    "userId" TEXT,
    "document_html" TEXT,

    CONSTRAINT "documentinteractive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentinteractive_variable" (
    "id" SERIAL NOT NULL,
    "documentId" INTEGER NOT NULL,
    "name" VARCHAR,
    "value" VARCHAR,

    CONSTRAINT "documentinteractive_variable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_currency" (
    "code" VARCHAR NOT NULL,
    "name" VARCHAR,

    CONSTRAINT "master_currency_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "HabitRecord_date_key" ON "HabitRecord"("date");

-- CreateIndex
CREATE INDEX "HabitRecord_habitId_date_idx" ON "HabitRecord"("habitId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "documentinteractive_variable_documentId_idx" ON "documentinteractive_variable"("documentId");

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitRecord" ADD CONSTRAINT "HabitRecord_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentinteractive_variable" ADD CONSTRAINT "documentinteractive_variable_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documentinteractive"("id") ON DELETE CASCADE ON UPDATE CASCADE;
