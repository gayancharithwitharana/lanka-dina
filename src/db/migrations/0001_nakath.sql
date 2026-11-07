CREATE TABLE `aya_waya` (
	`year` integer NOT NULL,
	`lagna` text NOT NULL,
	`aya` integer NOT NULL,
	`waya` integer NOT NULL,
	PRIMARY KEY(`year`, `lagna`)
);
--> statement-breakpoint
CREATE TABLE `maru` (
	`weekday` integer PRIMARY KEY NOT NULL,
	`direction` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `nakath` (
	`id` text PRIMARY KEY NOT NULL,
	`year` integer NOT NULL,
	`sort_order` integer NOT NULL,
	`key` text NOT NULL,
	`name_en` text NOT NULL,
	`name_si` text,
	`name_ta` text,
	`starts_at` text NOT NULL,
	`ends_at` text,
	`direction` text,
	`color` text,
	`notes_en` text,
	`notes_si` text,
	`notes_ta` text
);
--> statement-breakpoint
CREATE TABLE `rahu_kalaya` (
	`weekday` integer PRIMARY KEY NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `reminders` ADD `nakath_id` text REFERENCES nakath(id);