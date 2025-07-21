/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Service_url_key" ON "Service"("url");
