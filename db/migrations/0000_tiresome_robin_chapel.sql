CREATE TABLE `listing` (
	`id` text PRIMARY KEY NOT NULL,
	`address` text NOT NULL,
	`city` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`price` integer NOT NULL,
	`beds` integer NOT NULL,
	`baths` integer NOT NULL,
	`status` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `saved_search` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`q` text,
	`min_price` integer,
	`max_price` integer,
	`beds_min` integer,
	`baths_min` integer,
	`center_lat` real,
	`center_lng` real,
	`radius_km` real,
	`created_at` text NOT NULL
);
