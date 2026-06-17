-- ══════════════════════════════════════════════════════════════
-- schema_mysql.sql — Schema MySQL y Semilla de Datos completa
-- Proyecto: IFBB Fitness Challenge Trainer
-- Servidor: Hostinger MySQL (u613470100_fitcha)
-- ══════════════════════════════════════════════════════════════

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- 1. CREACIÓN DE LAS 16 TABLAS DE LA BASE DE DATOS
-- ─────────────────────────────────────────────────────────────

-- ─── USERS ───
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('ATHLETE','COACH','ADMIN') NOT NULL DEFAULT 'ATHLETE',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_email_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `last_login_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_idx` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── AUTH SESSIONS ───
CREATE TABLE IF NOT EXISTS `auth_sessions` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `token` VARCHAR(512) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_sessions_token_idx` (`token`),
  KEY `auth_sessions_user_idx` (`user_id`),
  CONSTRAINT `auth_sessions_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── ATHLETES ───
CREATE TABLE IF NOT EXISTS `athletes` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `date_of_birth` DATETIME NOT NULL,
  `gender` ENUM('MALE','FEMALE') NOT NULL,
  `body_weight_kg` DECIMAL(5,2) NULL,
  `profile_image_url` TEXT NULL,
  `age_category` ENUM('JUNIOR','SENIOR','MASTER') NOT NULL,
  `competition_level` ENUM('GOLD','SILVER','BRONZE','SPEED_FIT') NOT NULL,
  `competition_modality` ENUM('INDIVIDUAL','PAIR_MALE','PAIR_FEMALE','PAIR_MIXED','TEAM_6','SPEED_FIT_INDIVIDUAL','SPEED_FIT_TEAM_4') NOT NULL,
  `competition_date` DATETIME NULL,
  `available_days_json` TEXT NOT NULL,
  `max_session_minutes` INT NOT NULL DEFAULT 60,
  `experience_level` INT NOT NULL DEFAULT 5,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `athletes_user_idx` (`user_id`),
  KEY `athletes_competition_date_idx` (`competition_date`),
  CONSTRAINT `athletes_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── EXERCISES ───
CREATE TABLE IF NOT EXISTS `exercises` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `name_es` VARCHAR(200) NOT NULL,
  `station` ENUM('STATION_1','STATION_2','STATION_3','STATION_4','STATION_5','STATION_6') NOT NULL,
  `level` ENUM('GOLD','SILVER','BRONZE','SPEED_FIT') NOT NULL,
  `description` TEXT NOT NULL,
  `weight_male_kg` DECIMAL(5,2) NULL,
  `weight_female_kg` DECIMAL(5,2) NULL,
  `weight_label` VARCHAR(100) NULL,
  `mixed_pair_exception` TINYINT(1) NOT NULL DEFAULT 0,
  `straps_allowed` TINYINT(1) NOT NULL DEFAULT 0,
  `is_tiebreaker_station` TINYINT(1) NOT NULL DEFAULT 0,
  `requires_equipment` VARCHAR(100) NULL,
  `speed_fit_target_reps` INT NULL,
  `speed_fit_team_reps` INT NULL,
  `video_path` TEXT NULL,
  `image_path` TEXT NULL,
  `thumbnail_path` TEXT NULL,
  `tech_requirements_json` TEXT NOT NULL,
  `common_errors_json` TEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `exercises_station_level_idx` (`station`, `level`),
  KEY `exercises_level_idx` (`level`),
  KEY `exercises_station_idx` (`station`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── TECH ALERTS ───
CREATE TABLE IF NOT EXISTS `tech_alerts` (
  `id` VARCHAR(36) NOT NULL,
  `exercise_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `severity` ENUM('WARNING','INVALID','PROHIBITED') NOT NULL,
  `trigger_condition` TEXT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `tech_alerts_exercise_idx` (`exercise_id`),
  CONSTRAINT `tech_alerts_exercise_fk` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── MACROCYCLES ───
CREATE TABLE IF NOT EXISTS `macrocycles` (
  `id` VARCHAR(36) NOT NULL,
  `athlete_id` VARCHAR(36) NOT NULL,
  `type` ENUM('COMPLETE','STANDARD','REDUCED','SHOCK','PEAK_ONLY') NOT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `total_weeks` INT NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `macrocycles_athlete_idx` (`athlete_id`),
  CONSTRAINT `macrocycles_athlete_fk` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── MESOCYCLES ───
CREATE TABLE IF NOT EXISTS `mesocycles` (
  `id` VARCHAR(36) NOT NULL,
  `macrocycle_id` VARCHAR(36) NOT NULL,
  `phase` ENUM('ACCUMULATION','TRANSFORMATION','REALIZATION','PEAK','TAPERING') NOT NULL,
  `order_index` INT NOT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `week_count` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `main_objective` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `mesocycles_macro_idx` (`macrocycle_id`),
  CONSTRAINT `mesocycles_macro_fk` FOREIGN KEY (`macrocycle_id`) REFERENCES `macrocycles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── MICROCYCLES ───
CREATE TABLE IF NOT EXISTS `microcycles` (
  `id` VARCHAR(36) NOT NULL,
  `mesocycle_id` VARCHAR(36) NOT NULL,
  `week_number` INT NOT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `week_objective` TEXT NOT NULL,
  `volume_level` INT NOT NULL,
  `intensity_level` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `microcycles_meso_idx` (`mesocycle_id`),
  KEY `microcycles_dates_idx` (`start_date`, `end_date`),
  CONSTRAINT `microcycles_meso_fk` FOREIGN KEY (`mesocycle_id`) REFERENCES `mesocycles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── PLANNED SESSIONS ───
CREATE TABLE IF NOT EXISTS `planned_sessions` (
  `id` VARCHAR(36) NOT NULL,
  `microcycle_id` VARCHAR(36) NOT NULL,
  `day_of_week` ENUM('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') NOT NULL,
  `session_type` ENUM('STRENGTH','ENDURANCE','TECHNIQUE','SIMULATION','CARDIO','ACTIVE_RECOVERY','REST') NOT NULL,
  `estimated_minutes` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `order_index` INT NOT NULL,
  `special_mode` VARCHAR(100) NULL,
  `special_mode_config` TEXT NULL,
  `alerts` TEXT NULL,
  PRIMARY KEY (`id`),
  KEY `planned_sessions_micro_idx` (`microcycle_id`),
  KEY `planned_sessions_day_idx` (`day_of_week`),
  CONSTRAINT `planned_sessions_micro_fk` FOREIGN KEY (`microcycle_id`) REFERENCES `microcycles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── PLANNED BLOCKS ───
CREATE TABLE IF NOT EXISTS `planned_blocks` (
  `id` VARCHAR(36) NOT NULL,
  `planned_session_id` VARCHAR(36) NOT NULL,
  `exercise_id` VARCHAR(36) NOT NULL,
  `station` ENUM('STATION_1','STATION_2','STATION_3','STATION_4','STATION_5','STATION_6') NULL,
  `sets` INT NULL,
  `reps_target` INT NULL,
  `duration_seconds` INT NULL,
  `rest_seconds` INT NULL,
  `intensity_percent` INT NULL,
  `work_seconds` INT NULL DEFAULT 120,
  `transition_seconds` INT NULL DEFAULT 120,
  `is_simulation` TINYINT(1) NOT NULL DEFAULT 0,
  `volume_modifier` DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  `notes` TEXT NULL,
  `order_index` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `planned_blocks_session_idx` (`planned_session_id`),
  KEY `planned_blocks_exercise_idx` (`exercise_id`),
  CONSTRAINT `planned_blocks_session_fk` FOREIGN KEY (`planned_session_id`) REFERENCES `planned_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `planned_blocks_exercise_fk` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── TRAINING SESSIONS ───
CREATE TABLE IF NOT EXISTS `training_sessions` (
  `id` VARCHAR(36) NOT NULL,
  `athlete_id` VARCHAR(36) NOT NULL,
  `planned_session_id` VARCHAR(36) NULL,
  `session_date` DATETIME NOT NULL,
  `session_type` ENUM('STRENGTH','ENDURANCE','TECHNIQUE','SIMULATION','CARDIO','ACTIVE_RECOVERY','REST') NOT NULL,
  `duration_minutes` INT NULL,
  `perceived_effort` INT NULL,
  `notes` TEXT NULL,
  `is_simulation` TINYINT(1) NOT NULL DEFAULT 0,
  `completed_at` DATETIME NULL,
  `total_reps_simulation` INT NULL,
  `reps_by_station_json` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `training_sessions_athlete_idx` (`athlete_id`),
  KEY `training_sessions_date_idx` (`session_date`),
  CONSTRAINT `training_sessions_athlete_fk` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `training_sessions_planned_fk` FOREIGN KEY (`planned_session_id`) REFERENCES `planned_sessions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── EXECUTED BLOCKS ───
CREATE TABLE IF NOT EXISTS `executed_blocks` (
  `id` VARCHAR(36) NOT NULL,
  `session_id` VARCHAR(36) NOT NULL,
  `exercise_id` VARCHAR(36) NOT NULL,
  `station` ENUM('STATION_1','STATION_2','STATION_3','STATION_4','STATION_5','STATION_6') NULL,
  `order_index` INT NOT NULL,
  `total_valid_reps` INT NULL,
  `total_invalid_reps` INT NULL DEFAULT 0,
  `total_reps` INT NULL,
  `weight_used_kg` DECIMAL(5,2) NULL,
  `duration_seconds` INT NULL,
  `is_simulation_block` TINYINT(1) NOT NULL DEFAULT 0,
  `work_duration_sec` INT NULL DEFAULT 120,
  `notes` TEXT NULL,
  PRIMARY KEY (`id`),
  KEY `executed_blocks_session_idx` (`session_id`),
  KEY `executed_blocks_exercise_idx` (`exercise_id`),
  CONSTRAINT `executed_blocks_session_fk` FOREIGN KEY (`session_id`) REFERENCES `training_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `executed_blocks_exercise_fk` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── REP SETS ───
CREATE TABLE IF NOT EXISTS `rep_sets` (
  `id` VARCHAR(36) NOT NULL,
  `block_id` VARCHAR(36) NOT NULL,
  `set_number` INT NOT NULL,
  `reps_total` INT NOT NULL,
  `reps_valid` INT NOT NULL,
  `reps_invalid` INT NOT NULL DEFAULT 0,
  `weight_kg` DECIMAL(5,2) NULL,
  `duration_seconds` INT NULL,
  PRIMARY KEY (`id`),
  KEY `rep_sets_block_idx` (`block_id`),
  CONSTRAINT `rep_sets_block_fk` FOREIGN KEY (`block_id`) REFERENCES `executed_blocks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── PERSONAL RECORDS ───
CREATE TABLE IF NOT EXISTS `personal_records` (
  `id` VARCHAR(36) NOT NULL,
  `athlete_id` VARCHAR(36) NOT NULL,
  `exercise_id` VARCHAR(36) NOT NULL,
  `max_reps_in_2min` INT NULL,
  `min_time_for_30_reps` DECIMAL(6,2) NULL,
  `max_weight_kg` DECIMAL(5,2) NULL,
  `max_reps_strength` INT NULL,
  `record_date` DATETIME NOT NULL,
  `session_id` VARCHAR(36) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `personal_records_athlete_idx` (`athlete_id`),
  KEY `personal_records_exercise_idx` (`exercise_id`),
  KEY `personal_records_date_idx` (`record_date`),
  CONSTRAINT `personal_records_athlete_fk` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `personal_records_exercise_fk` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── TEAMS ───
CREATE TABLE IF NOT EXISTS `teams` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `level` ENUM('GOLD','SILVER','BRONZE','SPEED_FIT') NOT NULL,
  `competition_date` DATETIME NULL,
  `male_count` INT NOT NULL DEFAULT 3,
  `female_count` INT NOT NULL DEFAULT 3,
  `invite_code` VARCHAR(8) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `teams_invite_code_idx` (`invite_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── TEAM MEMBERS ───
CREATE TABLE IF NOT EXISTS `team_members` (
  `id` VARCHAR(36) NOT NULL,
  `team_id` VARCHAR(36) NOT NULL,
  `athlete_id` VARCHAR(36) NOT NULL,
  `assigned_station` ENUM('STATION_1','STATION_2','STATION_3','STATION_4','STATION_5','STATION_6') NOT NULL,
  `is_captain` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `team_members_unique` (`team_id`, `athlete_id`),
  KEY `team_members_team_idx` (`team_id`),
  CONSTRAINT `team_members_team_fk` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_members_athlete_fk` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── PAIRS ───
CREATE TABLE IF NOT EXISTS `pairs` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `modality` ENUM('INDIVIDUAL','PAIR_MALE','PAIR_FEMALE','PAIR_MIXED','TEAM_6','SPEED_FIT_INDIVIDUAL','SPEED_FIT_TEAM_4') NOT NULL,
  `level` ENUM('GOLD','SILVER','BRONZE','SPEED_FIT') NOT NULL,
  `competition_date` DATETIME NULL,
  `invite_code` VARCHAR(8) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pairs_invite_code_idx` (`invite_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── PAIR MEMBERS ───
CREATE TABLE IF NOT EXISTS `pair_members` (
  `id` VARCHAR(36) NOT NULL,
  `pair_id` VARCHAR(36) NOT NULL,
  `athlete_id` VARCHAR(36) NOT NULL,
  `is_leader` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pair_members_unique` (`pair_id`, `athlete_id`),
  CONSTRAINT `pair_members_pair_fk` FOREIGN KEY (`pair_id`) REFERENCES `pairs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pair_members_athlete_fk` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── NOTIFICATIONS ───
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(36) NOT NULL,
  `athlete_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `body` TEXT NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `scheduled_for` DATETIME NULL,
  `sent_at` DATETIME NULL,
  `data_json` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `notifications_athlete_idx` (`athlete_id`),
  KEY `notifications_scheduled_idx` (`scheduled_for`),
  KEY `notifications_read_idx` (`is_read`),
  CONSTRAINT `notifications_athlete_fk` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ─────────────────────────────────────────────────────────────
-- 2. SEMILLA DE DATOS: 18 EJERCICIOS OFICIALES IFBB
-- ─────────────────────────────────────────────────────────────

-- ─── NIVEL ORO (GOLD) ───
INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `mixed_pair_exception`, `straps_allowed`, `is_tiebreaker_station`, 
   `tech_requirements_json`, `common_errors_json`, `sort_order`) 
VALUES 
  ('ifbb-gold-st1', 'Chin-Ups Prone & Strict', 'Dominadas Pronadas y Estrictas', 
   'STATION_1', 'GOLD', 
   'Dominadas estrictas con agarre pronado (palmas hacia afuera). Posición inicial con codos completamente extendidos. La barbilla debe superar el borde superior de la barra en cada repetición.',
   0, 0, 'Peso corporal', 0, 0, 0,
   '["Agarre pronado (palmas hacia afuera) al ancho de los hombros","Iniciar con codos completamente extendidos — posición muerta","Barbilla debe superar completamente el borde superior de la barra","Bajar hasta extensión completa con codos bloqueados","Movimiento estrictamente vertical, sin oscilación"]',
   '["Balanceo del cuerpo (kipping)","Barbilla que no supera la barra","Codos que no se bloquean al bajar"]',
   1)
ON DUPLICATE KEY UPDATE 
  name = VALUES(name), 
  description = VALUES(description), 
  tech_requirements_json = VALUES(tech_requirements_json);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `is_tiebreaker_station`, `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-gold-st2', 'Kettlebell Squat and Pull', 'Sentadilla y Tirón con Kettlebell', 
   'STATION_2', 'GOLD', 
   'Sentadilla profunda con kettlebell entre las piernas seguida de un tirón hasta el pecho. La base del kettlebell debe tocar el suelo en cada repetición.',
   32, 24, 'Kettlebell (kg)', 0,
   '["KB colocada entre las piernas con agarre pronado","Sentadilla hasta que la BASE del KB toca claramente el suelo","Levantarse con extensión COMPLETA de caderas y rodillas","Tirar de la KB hasta que el ASA quede a la altura del medio del pecho","Movimiento fluido: sentadilla + tirón en una sola secuencia"]',
   2)
ON DUPLICATE KEY UPDATE 
  name = VALUES(name), 
  weight_male_kg = VALUES(weight_male_kg), 
  weight_female_kg = VALUES(weight_female_kg);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-gold-st3', 'Dips Feet Forward', 'Fondos en Paralelas con Pies Adelantados', 
   'STATION_3', 'GOLD', 
   'Fondos en paralelas con los pies ligeramente adelantados respecto a las manos. Se requiere pausa de 1 segundo arriba con codos bloqueados.',
   0, 0, 'Peso corporal',
   '["Codos completamente bloqueados en posición inicial","Piernas extendidas ligeramente por delante de las manos","Sin balanceo en ningún momento del movimiento","Bajar hasta que codos formen exactamente 90°","Empujar hasta extensión completa con PAUSA de 1 segundo arriba"]',
   3)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `mixed_pair_exception`, `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-gold-st4', 'Walking Lunges with Barbell', 'Zancadas Caminando con Barra', 
   'STATION_4', 'GOLD', 
   'Zancadas caminando con barra sobre los hombros. La rodilla trasera DEBE tocar el suelo en cada repetición. Excepción: en parejas mixtas se permite peso diferenciado por sexo.',
   50, 30, 'Barra sobre hombros (kg)', 1,
   '["Barra descansando sobre los hombros (no en el cuello)","Zancadas caminando hacia adelante con desplazamiento","Ambas rodillas deben alcanzar 90° de flexión","La rodilla de la pierna TRASERA DEBE TOCAR el suelo obligatoriamente","Torso erguido en todo momento"]',
   4)
ON DUPLICATE KEY UPDATE mixed_pair_exception = VALUES(mixed_pair_exception);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `straps_allowed`, `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-gold-st5', 'Toes to Bar', 'Pies a la Barra', 
   'STATION_5', 'GOLD', 
   'Pies a la barra colgado. Ambos pies deben tocar la barra simultáneamente. ÚNICO ejercicio donde se permiten correas de agarre.',
   0, 0, 'Peso corporal', 1,
   '["Colgado de la barra con brazos completamente extendidos","Elevar piernas hasta que AMBOS pies toquen la barra simultáneamente","Al descender: talones O rodillas deben pasar DETRÁS de la línea vertical de la barra","Se permite balanceo ligero para el movimiento","Correas de agarre PERMITIDAS (única excepción reglamentaria)"]',
   5)
ON DUPLICATE KEY UPDATE straps_allowed = VALUES(straps_allowed);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `is_tiebreaker_station`, `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-gold-st6', 'Burpees & Devil Press', 'Burpees y Press del Diablo', 
   'STATION_6', 'GOLD', 
   'Burpees con press sobre la cabeza usando dos mancuernas. Movimiento snatch ESTRICTAMENTE PROHIBIDO. ⭐ ESTACIÓN DE DESEMPATE OFICIAL.',
   15, 10, 'Par de mancuernas (kg c/u)', 1,
   '["Iniciar de pie con las dos mancuernas en el suelo","Apoyarse en las mancuernas y ejecutar push-up con PECHO AL SUELO","Incorporarse y llevar mancuernas a los hombros (curl)","Empujar las mancuernas sobre la cabeza hasta BLOQUEAR los codos","Cuerpo completamente erguido al finalizar el press","PROHIBIDO movimiento tipo Snatch (desde suelo hasta arriba directo)"]',
   6)
ON DUPLICATE KEY UPDATE is_tiebreaker_station = VALUES(is_tiebreaker_station);

-- ─── NIVEL PLATA (SILVER) ───
INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-silver-st1', 'Horizontal Chin-Ups', 'Dominadas Horizontales', 
   'STATION_1', 'SILVER', 
   'Dominadas con el cuerpo en posición completamente horizontal bajo la barra. El pecho debe tocar la barra en cada repetición.',
   0, 0, 'Peso corporal',
   '["Cuerpo suspendido bajo la barra en posición completamente horizontal","Agarre al ancho de los hombros","Cuerpo recto como una tabla (sin flexionar caderas)","Tirar hasta que el PECHO TOQUE la barra","Volver a extensión completa de codos"]',
   7)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-silver-st2', 'Jefferson Squat', 'Sentadilla Jefferson con Barra', 
   'STATION_2', 'SILVER', 
   'Sentadilla con la barra entre las piernas en posición de caballero a horcajadas. Los discos deben tocar el suelo en cada repetición.',
   60, 40, 'Barra (kg)',
   '["Barra colocada entre las piernas (posición de caballero a horcajadas)","Una mano en agarre pronado adelante, otra supina detrás","Bajar hasta que los DISCOS de la barra toquen el suelo","Columna en posición NEUTRA durante todo el movimiento","Extensión completa de rodillas y caderas arriba"]',
   8)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-silver-st3', 'Bench Dips', 'Fondos en Banco', 
   'STATION_3', 'SILVER', 
   'Fondos con manos apoyadas en el borde de un banco. Los codos deben alcanzar 90° de flexión.',
   0, 0, 'Peso corporal',
   '["Manos apoyadas en el borde del banco detrás del cuerpo","Pies apoyados frente al cuerpo en el suelo o banco elevado","Bajar hasta que codos formen EXACTAMENTE 90°","Empujar hasta extensión completa de los codos"]',
   9)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-silver-st4', 'Static Lunges with Dumbbells', 'Zancadas Estáticas con Mancuernas', 
   'STATION_4', 'SILVER', 
   'Zancadas en el sitio con mancuernas a los costados. La rodilla trasera debe tocar el suelo.',
   15, 10, 'Par de mancuernas (kg c/u)',
   '["Una mancuerna en cada mano a los costados del cuerpo","Zancadas EN EL SITIO (sin desplazamiento)","Ambas rodillas deben alcanzar 90° de flexión","Rodilla trasera DEBE TOCAR el suelo obligatoriamente","Alternar pierna en cada repetición o completar una pierna antes de cambiar"]',
   10)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-silver-st5', 'Weighted Sit-Ups', 'Abdominales con Disco de 10kg', 
   'STATION_5', 'SILVER', 
   'Abdominales con un disco de 10kg sostenido sobre el pecho. El tronco debe quedar perpendicular y tocar los pies al llegar arriba.',
   10, 10, 'Disco sobre el pecho (kg)',
   '["Comenzar acostado con rodillas y caderas a 90°","Disco de 10kg sostenido firmemente sobre el pecho","Incorporarse hasta que el tronco quede PERPENDICULAR al suelo","Tocar los pies con el disco (o manos) al llegar arriba"]',
   11)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `is_tiebreaker_station`, `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-silver-st6', 'Kettlebell Snatch', 'Arrancada con Kettlebell', 
   'STATION_6', 'SILVER', 
   'Movimiento balístico de una sola mano. La kettlebell sube en un solo arco hasta sobre la cabeza con bloqueo completo del codo. ⭐ ESTACIÓN DE DESEMPATE.',
   12, 8, 'Kettlebell (kg)', 1,
   '["Movimiento balístico de una sola mano desde entre las piernas","La KB sube en un solo arco continuo hasta sobre la cabeza","Bloqueo COMPLETO del codo en posición superior","Cuerpo completamente estable y erguido al finalizar","Alternar brazos según criterio del atleta"]',
   12)
ON DUPLICATE KEY UPDATE is_tiebreaker_station = VALUES(is_tiebreaker_station);

-- ─── NIVEL BRONCE (BRONZE) ───
INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-bronze-st1', 'Supine Grip Chin-Ups (Feet Supported)', 'Dominadas Supinas con Talones en el Suelo', 
   'STATION_1', 'BRONZE', 
   'Dominadas con agarre supino y talones apoyados en el suelo. Pausa de 2 segundos en posición inicial.',
   0, 0, 'Peso corporal asistido',
   '["Agarre SUPINO (palmas hacia el cuerpo) al ancho de los hombros","TALONES APOYADOS EN EL SUELO en todo momento","Detener 2 segundos en posición inicial (colgado)","Tronco, caderas y rodillas completamente rectos (como una tabla)","Tirar hasta que el PECHO TOQUE la barra","Sin balanceo en ningún momento"]',
   13)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-bronze-st2', 'Kettlebell Squat', 'Sentadilla con Kettlebell', 
   'STATION_2', 'BRONZE', 
   'Sentadilla frontal con kettlebell. La kettlebell debe tocar el suelo en cada repetición.',
   32, 24, 'Kettlebell (kg)',
   '["Pies ligeramente más anchos que los hombros","KB sostenida FRENTE AL CUERPO con agarre pronado","Sentadilla flexionando caderas y rodillas","KB debe TOCAR EL SUELO en cada repetición","Torso erguido, mirada al frente"]',
   14)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `requires_equipment`, `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-bronze-st3', 'Push-Ups Elbows Flare (Handball Ball)', 'Flexiones Codos Abiertos con Balón', 
   'STATION_3', 'BRONZE', 
   'Flexiones con codos abiertos y balón de balonmano bajo el pecho. El pecho debe tocar el balón en cada repetición.',
   0, 0, 'Peso corporal', 'handball_ball',
   '["Partir desde posición de extensión completa de codos","Codos abiertos hacia los lados (NO pegados al cuerpo)","Descender hasta que el PECHO TOQUE el balón de balonmano","Codos deben alcanzar 90° de flexión","Empujar hasta extensión completa"]',
   15)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-bronze-st4', 'Backward Lunges with Dumbbells', 'Zancadas Hacia Atrás con Mancuernas', 
   'STATION_4', 'BRONZE', 
   'Zancadas hacia atrás (no hacia adelante) con mancuernas. La rodilla trasera debe tocar el suelo.',
   12.5, 7.5, 'Par de mancuernas (kg c/u)',
   '["Una mancuerna en cada mano","Paso hacia ATRÁS (no hacia adelante — eso sería inválido)","Mantenerse EN EL SITIO (sin desplazamiento)","Ambas rodillas deben alcanzar 90°","Rodilla trasera DEBE TOCAR el suelo obligatoriamente"]',
   16)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-bronze-st5', 'Sit-Ups Touch Feet', 'Abdominales Tocando los Pies', 
   'STATION_5', 'BRONZE', 
   'Abdominales sin peso. Ambas manos deben tocar los pies al llegar arriba con el tronco perpendicular.',
   0, 0, 'Sin peso',
   '["Comenzar acostado con rodillas y caderas a 90°","Puede usarse impulso de brazos para iniciar el movimiento","Incorporarse hasta que el tronco quede perpendicular al suelo","AMBAS MANOS deben tocar los pies al llegar arriba"]',
   17)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `is_tiebreaker_station`, `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-bronze-st6', 'Kettlebell Overhead Swing', 'Swing de Kettlebell sobre la Cabeza', 
   'STATION_6', 'BRONZE', 
   'Swing balístico de kettlebell sobre la cabeza con brazos completamente extendidos y pausa breve en vertical. ⭐ ESTACIÓN DE DESEMPATE.',
   12, 8, 'Kettlebell (kg)', 1,
   '["Flexión de caderas para pasar la KB entre las piernas","Balanceo continuo y explosivo hacia arriba","Brazos COMPLETAMENTE EXTENDIDOS sobre la cabeza","Detenerse brevemente en posición VERTICAL con KB sobre la cabeza","Cuerpo completamente erguido al finalizar"]',
   18)
ON DUPLICATE KEY UPDATE is_tiebreaker_station = VALUES(is_tiebreaker_station);


-- ─────────────────────────────────────────────────────────────
-- 3. SEMILLA DE DATOS: ALERTAS TÉCNICAS (JUEZ VIRTUAL)
-- ─────────────────────────────────────────────────────────────

-- ORO · ESTACIÓN 1 · Dominadas
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-gold-st1-1', 'ifbb-gold-st1', '❌ BALANCEO / KIPPING DETECTADO', 'No se permite ningún tipo de balanceo, impulso con cadera ni kipping. La repetición es inválida.', 'INVALID', 1),
  ('alert-gold-st1-2', 'ifbb-gold-st1', '❌ BARBILLA NO SUPERA LA BARRA', 'La barbilla debe pasar COMPLETAMENTE el borde superior de la barra.', 'INVALID', 2),
  ('alert-gold-st1-3', 'ifbb-gold-st1', '❌ CODOS SIN BLOQUEO COMPLETO', 'Los codos deben quedar completamente bloqueados al finalizar el descenso.', 'INVALID', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description);

-- ORO · ESTACIÓN 2 · KB Squat and Pull
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-gold-st2-1', 'ifbb-gold-st2', '❌ KB NO TOCA EL SUELO', 'La base de la pesa rusa debe tocar claramente el suelo en cada repetición.', 'INVALID', 1),
  ('alert-gold-st2-2', 'ifbb-gold-st2', '❌ TIRÓN INCOMPLETO', 'El asa debe llegar exactamente a la altura del medio del pecho.', 'INVALID', 2),
  ('alert-gold-st2-3', 'ifbb-gold-st2', '❌ EXTENSIÓN INCOMPLETA', 'Caderas y rodillas deben extenderse completamente antes del tirón.', 'INVALID', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ORO · ESTACIÓN 3 · Dips Feet Forward
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-gold-st3-1', 'ifbb-gold-st3', '❌ CODOS NO LLEGAN A 90°', 'Los codos deben formar exactamente un ángulo de 90° en la fase baja.', 'INVALID', 1),
  ('alert-gold-st3-2', 'ifbb-gold-st3', '❌ SIN PAUSA EN POSICIÓN SUPERIOR', 'Se requiere pausa de 1 segundo con codos bloqueados arriba.', 'INVALID', 2),
  ('alert-gold-st3-3', 'ifbb-gold-st3', '❌ BALANCEO DEL CUERPO', 'No se permite balanceo. El movimiento debe ser estrictamente vertical.', 'INVALID', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ORO · ESTACIÓN 4 · Walking Lunges (con EXCEPCIÓN pareja mixta)
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-gold-st4-1', 'ifbb-gold-st4', '❌ RODILLA TRASERA NO TOCA EL SUELO', 'La rodilla de la pierna trasera DEBE tocar el suelo. Rep inválida sin este contacto.', 'INVALID', 1),
  ('alert-gold-st4-2', 'ifbb-gold-st4', '❌ RODILLAS SIN 90°', 'Ambas rodillas deben alcanzar los 90° de flexión.', 'INVALID', 2),
  ('alert-gold-st4-3', 'ifbb-gold-st4', '⚠️ EXCEPCIÓN PAREJA MIXTA', 'Esta es la ÚNICA estación donde la pareja mixta puede usar pesos diferentes por sexo.', 'WARNING', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ORO · ESTACIÓN 5 · Toes to Bar (con correas permitidas)
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-gold-st5-1', 'ifbb-gold-st5', '❌ SOLO UN PIE TOCA LA BARRA', 'Ambos pies deben tocar la barra SIMULTÁNEAMENTE.', 'INVALID', 1),
  ('alert-gold-st5-2', 'ifbb-gold-st5', '❌ RESET INCORRECTO', 'Al descender, talones O rodillas deben pasar claramente detrás de la línea vertical de la barra antes de iniciar la siguiente repetición.', 'INVALID', 2),
  ('alert-gold-st5-3', 'ifbb-gold-st5', '✅ CORREAS PERMITIDAS', 'Las correas de agarre están permitidas SOLO en este ejercicio.', 'WARNING', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ORO · ESTACIÓN 6 · Devil Press (DESEMPATE + SNATCH PROHIBIDO)
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-gold-st6-1', 'ifbb-gold-st6', '🚫 SNATCH PROHIBIDO', 'PROHIBIDO llevar las mancuernas desde el suelo hasta arriba de la cabeza en un solo movimiento. Rep inválida.', 'PROHIBITED', 1),
  ('alert-gold-st6-2', 'ifbb-gold-st6', '❌ PECHO NO TOCA EL SUELO', 'El pecho debe tocar el suelo en cada repetición durante el push-up.', 'INVALID', 2),
  ('alert-gold-st6-3', 'ifbb-gold-st6', '❌ CODOS NO BLOQUEADOS ARRIBA', 'Los codos deben bloquearse completamente al finalizar el press sobre la cabeza.', 'INVALID', 3),
  ('alert-gold-st6-4', 'ifbb-gold-st6', '❌ CUERPO NO ERGUIDO', 'El cuerpo debe estar completamente erguido y estable al finalizar el movimiento.', 'INVALID', 4),
  ('alert-gold-st6-5', 'ifbb-gold-st6', '⭐ ESTACIÓN DE DESEMPATE', 'En caso de empate en repeticiones totales, gana el atleta con más reps en esta estación.', 'WARNING', 5)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- PLATA · ESTACIÓN 1 · Horizontal Chin-Ups
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-silver-st1-1', 'ifbb-silver-st1', '❌ PECHO NO TOCA LA BARRA', 'El pecho debe tocar la barra en cada repetición.', 'INVALID', 1),
  ('alert-silver-st1-2', 'ifbb-silver-st1', '❌ CUERPO NO HORIZONTAL', 'El cuerpo debe mantenerse perfectamente recto y horizontal.', 'INVALID', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- PLATA · ESTACIÓN 2 · Jefferson Squat
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-silver-st2-1', 'ifbb-silver-st2', '❌ DISCOS NO TOCAN EL SUELO', 'Los discos de la barra deben tocar el suelo en cada repetición.', 'INVALID', 1),
  ('alert-silver-st2-2', 'ifbb-silver-st2', '❌ COLUMNA EN CIFOSIS', 'Mantener columna neutra. La cifosis excesiva puede invalidar la repetición.', 'WARNING', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- PLATA · ESTACIÓN 3 · Bench Dips
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-silver-st3-1', 'ifbb-silver-st3', '❌ CODOS NO LLEGAN A 90°', 'Los codos deben alcanzar exactamente 90° en la fase baja.', 'INVALID', 1)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- PLATA · ESTACIÓN 4 · Static Lunges
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-silver-st4-1', 'ifbb-silver-st4', '❌ RODILLA TRASERA NO TOCA EL SUELO', 'La rodilla trasera debe tocar el suelo en cada repetición.', 'INVALID', 1),
  ('alert-silver-st4-2', 'ifbb-silver-st4', '❌ ZANCADAS CON DESPLAZAMIENTO', 'Las zancadas en Nivel Plata son EN EL SITIO, sin caminar.', 'INVALID', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- PLATA · ESTACIÓN 5 · Weighted Sit-Ups
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-silver-st5-1', 'ifbb-silver-st5', '❌ TRONCO NO LLEGA A PERPENDICULAR', 'El tronco debe llegar a posición perpendicular al suelo.', 'INVALID', 1),
  ('alert-silver-st5-2', 'ifbb-silver-st5', '❌ DISCO NO CONTACTA LOS PIES', 'El disco (o manos sosteniendo el disco) debe tocar los pies.', 'INVALID', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- PLATA · ESTACIÓN 6 · KB Snatch (DESEMPATE)
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-silver-st6-1', 'ifbb-silver-st6', '❌ CODO NO SE BLOQUEA ARRIBA', 'El codo debe bloquearse completamente en la posición superior.', 'INVALID', 1),
  ('alert-silver-st6-2', 'ifbb-silver-st6', '⭐ ESTACIÓN DE DESEMPATE', 'En empate total de repeticiones, gana quien más reps tenga en esta estación.', 'WARNING', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- BRONCE · ESTACIÓN 1 · Supine Grip Chin-Ups
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-bronze-st1-1', 'ifbb-bronze-st1', '❌ TALONES SE DESPEGAN DEL SUELO', 'Los talones DEBEN permanecer apoyados en el suelo durante toda la repetición.', 'INVALID', 1),
  ('alert-bronze-st1-2', 'ifbb-bronze-st1', '❌ PECHO NO TOCA LA BARRA', 'El pecho debe tocar la barra en cada repetición.', 'INVALID', 2),
  ('alert-bronze-st1-3', 'ifbb-bronze-st1', '❌ CUERPO NO RECTO', 'Tronco, caderas y rodillas deben formar una línea recta perfecta.', 'INVALID', 3),
  ('alert-bronze-st1-4', 'ifbb-bronze-st1', '❌ SIN PAUSA DE 2 SEGUNDOS INICIAL', 'La posición inicial (colgado, codos extendidos) debe mantenerse 2 segundos.', 'INVALID', 4)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- BRONCE · ESTACIÓN 2 · KB Squat
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-bronze-st2-1', 'ifbb-bronze-st2', '❌ KB NO TOCA EL SUELO', 'La Kettlebell debe tocar el suelo en cada repetición.', 'INVALID', 1)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- BRONCE · ESTACIÓN 3 · Push-Ups Handball
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-bronze-st3-1', 'ifbb-bronze-st3', '❌ PECHO NO TOCA EL BALÓN', 'El pecho debe tocar el balón de balonmano. Es el criterio de validación de la repetición.', 'INVALID', 1),
  ('alert-bronze-st3-2', 'ifbb-bronze-st3', '❌ CODOS NO LLEGAN A 90°', 'Los codos deben alcanzar al menos 90° de flexión.', 'INVALID', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- BRONCE · ESTACIÓN 4 · Backward Lunges
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-bronze-st4-1', 'ifbb-bronze-st4', '❌ RODILLA TRASERA NO TOCA EL SUELO', 'La rodilla trasera debe tocar el suelo obligatoriamente.', 'INVALID', 1),
  ('alert-bronze-st4-2', 'ifbb-bronze-st4', '❌ ZANCADA HACIA ADELANTE', 'El Nivel Bronce exige zancada hacia ATRÁS. Hacia adelante es inválida.', 'INVALID', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- BRONCE · ESTACIÓN 5 · Sit-Ups Touch Feet
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-bronze-st5-1', 'ifbb-bronze-st5', '❌ MANOS NO TOCAN LOS PIES', 'Ambas manos deben tocar los pies en cada repetición.', 'INVALID', 1),
  ('alert-bronze-st5-2', 'ifbb-bronze-st5', '❌ TRONCO NO LLEGA A 90°', 'El tronco debe ser perpendicular al suelo al llegar arriba.', 'INVALID', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- BRONCE · ESTACIÓN 6 · KB Overhead Swing (DESEMPATE)
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-bronze-st6-1', 'ifbb-bronze-st6', '❌ KB NO LLEGA SOBRE LA CABEZA', 'Los brazos deben estar completamente extendidos sobre la cabeza.', 'INVALID', 1),
  ('alert-bronze-st6-2', 'ifbb-bronze-st6', '❌ SIN PARADA EN VERTICAL', 'Debe haber una pausa breve con la KB sobre la cabeza en posición vertical.', 'INVALID', 2),
  ('alert-bronze-st6-3', 'ifbb-bronze-st6', '⭐ ESTACIÓN DE DESEMPATE', 'En empate total de repeticiones, gana quien más reps tenga aquí.', 'WARNING', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title);


-- ─────────────────────────────────────────────────────────────
-- 4. SEMILLA DE DATOS: USUARIO ADMINISTRADOR INICIAL
-- ─────────────────────────────────────────────────────────────

INSERT INTO `users` 
  (`id`, `email`, `password_hash`, `role`, `is_active`, `is_email_verified`) 
VALUES 
  ('admin-ifbb-001', 
   'admin@fenifisc.com', 
   -- Hash bcrypt generado para la contraseña 'mamcyj11JM.,'
   '$2b$12$F6hSlAFgr0eS5fVu5tVi7.Hvsp7A9Uv3R9E2OpHo20ciB2FfYNETy',
   'ADMIN', 1, 1)
ON DUPLICATE KEY UPDATE 
  password_hash = VALUES(password_hash),
  role = 'ADMIN',
  is_active = 1;

-- ─────────────────────────────────────────────────────────────
-- 5. VERIFICACIONES DE INTEGRIDAD
-- ─────────────────────────────────────────────────────────────

SELECT 'Semillas cargadas correctamente!' AS status;
SELECT COUNT(*) AS total_ejercicios FROM `exercises`; -- Debe ser 18
SELECT COUNT(*) AS total_alertas FROM `tech_alerts`;  -- Debe ser 52
SELECT email, role, is_active FROM `users` WHERE role = 'ADMIN';
