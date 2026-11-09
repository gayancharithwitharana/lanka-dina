CREATE TABLE `holidays` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`name_en` text NOT NULL,
	`name_si` text,
	`name_ta` text,
	`type` text NOT NULL,
	`is_public` integer NOT NULL,
	`is_bank` integer NOT NULL,
	`is_mercantile` integer NOT NULL,
	`poya_start` text,
	`poya_end` text,
	`about_en` text,
	`about_si` text,
	`about_ta` text
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`text` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notes_date_unique` ON `notes` (`date`);--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`holiday_id` text,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`kind` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`holiday_id`) REFERENCES `holidays`(`id`) ON UPDATE no action ON DELETE no action
);
