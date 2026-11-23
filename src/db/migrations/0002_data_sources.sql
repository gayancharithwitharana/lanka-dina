CREATE TABLE `data_sources` (
	`dataset` text NOT NULL,
	`year` integer NOT NULL,
	`version` integer NOT NULL,
	`source_en` text NOT NULL,
	`source_si` text,
	`source_ta` text,
	`source_url` text,
	`retrieved_at` text NOT NULL,
	`countdown_key` text,
	PRIMARY KEY(`dataset`, `year`)
);
--> statement-breakpoint
ALTER TABLE `holidays` DROP COLUMN `poya_start`;--> statement-breakpoint
ALTER TABLE `holidays` DROP COLUMN `poya_end`;