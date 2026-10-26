-- Preserve the table created by the original migration before creating the catalog schema.
RENAME TABLE `jogos` TO `jogos_legacy`;

CREATE TABLE `jogos` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(191) NOT NULL,
  `genero` VARCHAR(100) NOT NULL,
  `plataforma` VARCHAR(100) NOT NULL,
  `anoLancamento` INTEGER NULL,
  `nota` DOUBLE NULL,
  `concluido` BOOLEAN NOT NULL DEFAULT false,
  `desenvolvedora` VARCHAR(191) NULL,
  `distribuidora` VARCHAR(191) NULL,
  `classificacaoIndicativa` VARCHAR(20) NULL,
  `horasParaZerar` INTEGER NULL,
  `sinopse` TEXT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `usuarios` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `usuarios_email_key` (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
