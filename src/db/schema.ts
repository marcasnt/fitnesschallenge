import {
  mysqlTable,
  text,
  varchar,
  int,
  real,
  boolean,
  timestamp,
  mysqlEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ─────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────
export const genderEnum = ["MALE", "FEMALE"] as const;
export const ageCategoryEnum = ["JUNIOR", "SENIOR", "MASTER"] as const;
export const competitionLevelEnum = ["GOLD", "SILVER", "BRONZE", "SPEED_FIT"] as const;
export const competitionModalityEnum = ["INDIVIDUAL", "PAIR_MALE", "PAIR_FEMALE", "PAIR_MIXED", "TEAM_6", "SPEED_FIT_INDIVIDUAL", "SPEED_FIT_TEAM_4"] as const;
export const mesocyclePhaseEnum = ["ACCUMULATION", "TRANSFORMATION", "REALIZATION", "PEAK", "TAPERING"] as const;
export const sessionTypeEnum = ["STRENGTH", "ENDURANCE", "TECHNIQUE", "SIMULATION", "CARDIO", "ACTIVE_RECOVERY", "REST"] as const;
export const exerciseStationEnum = ["STATION_1", "STATION_2", "STATION_3", "STATION_4", "STATION_5", "STATION_6"] as const;
export const techAlertSeverityEnum = ["WARNING", "INVALID", "PROHIBITED"] as const;
export const dayOfWeekEnum = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;
export const macrocycleTypeEnum = ["COMPLETE", "STANDARD", "REDUCED", "SHOCK", "PEAK_ONLY"] as const;
export const userRoleEnum = ["ATHLETE", "COACH", "ADMIN"] as const;

// ─────────────────────────────────────────────────────
// USERS / AUTH
// ─────────────────────────────────────────────────────
export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: mysqlEnum("role", userRoleEnum).notNull().default("ATHLETE"),
    isActive: boolean("is_active").notNull().default(true),
    isEmailVerified: boolean("is_email_verified").notNull().default(false),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
  })
);

export const sessions = mysqlTable(
  "auth_sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 512 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    tokenIdx: uniqueIndex("auth_sessions_token_idx").on(t.token),
    userIdx: index("auth_sessions_user_idx").on(t.userId),
  })
);

// ─────────────────────────────────────────────────────
// ATHLETES
// ─────────────────────────────────────────────────────
export const athletes = mysqlTable(
  "athletes",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    dateOfBirth: timestamp("date_of_birth").notNull(),
    gender: mysqlEnum("gender", genderEnum).notNull(),
    bodyWeightKg: real("body_weight_kg"),
    profileImageUrl: text("profile_image_url"),
    ageCategory: mysqlEnum("age_category", ageCategoryEnum).notNull(),
    competitionLevel: mysqlEnum("competition_level", competitionLevelEnum).notNull(),
    competitionModality: mysqlEnum("competition_modality", competitionModalityEnum).notNull(),
    competitionDate: timestamp("competition_date"),
    availableDaysJson: text("available_days_json").notNull().default("[]"),
    maxSessionMinutes: int("max_session_minutes").notNull().default(60),
    experienceLevel: int("experience_level").notNull().default(5),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    userIdx: uniqueIndex("athletes_user_idx").on(t.userId),
    compDateIdx: index("athletes_competition_date_idx").on(t.competitionDate),
  })
);

// ─────────────────────────────────────────────────────
// PERIODIZATION
// ─────────────────────────────────────────────────────
export const macrocycles = mysqlTable(
  "macrocycles",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    athleteId: varchar("athlete_id", { length: 36 })
      .notNull()
      .references(() => athletes.id, { onDelete: "cascade" }),
    type: mysqlEnum("type", macrocycleTypeEnum).notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    totalWeeks: int("total_weeks").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    athleteIdx: uniqueIndex("macrocycles_athlete_idx").on(t.athleteId),
  })
);

export const mesocycles = mysqlTable(
  "mesocycles",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    macrocycleId: varchar("macrocycle_id", { length: 36 })
      .notNull()
      .references(() => macrocycles.id, { onDelete: "cascade" }),
    phase: mysqlEnum("phase", mesocyclePhaseEnum).notNull(),
    orderIndex: int("order_index").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    weekCount: int("week_count").notNull(),
    title: varchar("title", { length: 150 }).notNull(),
    description: text("description").notNull(),
    mainObjective: text("main_objective").notNull(),
  },
  (t) => ({
    macroIdx: index("mesocycles_macro_idx").on(t.macrocycleId),
  })
);

export const microcycles = mysqlTable(
  "microcycles",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    mesocycleId: varchar("mesocycle_id", { length: 36 })
      .notNull()
      .references(() => mesocycles.id, { onDelete: "cascade" }),
    weekNumber: int("week_number").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    weekObjective: text("week_objective").notNull(),
    volumeLevel: int("volume_level").notNull(),
    intensityLevel: int("intensity_level").notNull(),
  },
  (t) => ({
    mesoIdx: index("microcycles_meso_idx").on(t.mesocycleId),
    datesIdx: index("microcycles_dates_idx").on(t.startDate, t.endDate),
  })
);

export const plannedSessions = mysqlTable(
  "planned_sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    microcycleId: varchar("microcycle_id", { length: 36 })
      .notNull()
      .references(() => microcycles.id, { onDelete: "cascade" }),
    dayOfWeek: mysqlEnum("day_of_week", dayOfWeekEnum).notNull(),
    sessionType: mysqlEnum("session_type", sessionTypeEnum).notNull(),
    estimatedMinutes: int("estimated_minutes").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    orderIndex: int("order_index").notNull(),
    specialMode: varchar("special_mode", { length: 100 }),
    specialModeConfig: text("special_mode_config"),
    alerts: text("alerts"),
  },
  (t) => ({
    microIdx: index("planned_sessions_micro_idx").on(t.microcycleId),
    dayIdx: index("planned_sessions_day_idx").on(t.dayOfWeek),
  })
);

export const plannedBlocks = mysqlTable(
  "planned_blocks",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    plannedSessionId: varchar("planned_session_id", { length: 36 })
      .notNull()
      .references(() => plannedSessions.id, { onDelete: "cascade" }),
    exerciseId: varchar("exercise_id", { length: 36 })
      .notNull()
      .references(() => exercises.id),
    station: mysqlEnum("station", exerciseStationEnum),
    sets: int("sets"),
    repsTarget: int("reps_target"),
    durationSeconds: int("duration_seconds"),
    restSeconds: int("rest_seconds"),
    intensityPercent: int("intensity_percent"),
    workSeconds: int("work_seconds").default(120),
    transitionSeconds: int("transition_seconds").default(120),
    isSimulation: boolean("is_simulation").notNull().default(false),
    volumeModifier: real("volume_modifier").notNull().default(1.0),
    notes: text("notes"),
    orderIndex: int("order_index").notNull(),
  },
  (t) => ({
    sessionIdx: index("planned_blocks_session_idx").on(t.plannedSessionId),
    exerciseIdx: index("planned_blocks_exercise_idx").on(t.exerciseId),
  })
);

// ─────────────────────────────────────────────────────
// EXECUTED SESSIONS
// ─────────────────────────────────────────────────────
export const trainingSessions = mysqlTable(
  "training_sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    athleteId: varchar("athlete_id", { length: 36 })
      .notNull()
      .references(() => athletes.id, { onDelete: "cascade" }),
    plannedSessionId: varchar("planned_session_id", { length: 36 }).references(() => plannedSessions.id),
    sessionDate: timestamp("session_date").notNull(),
    sessionType: mysqlEnum("session_type", sessionTypeEnum).notNull(),
    durationMinutes: int("duration_minutes"),
    perceivedEffort: int("perceived_effort"),
    notes: text("notes"),
    isSimulation: boolean("is_simulation").notNull().default(false),
    completedAt: timestamp("completed_at"),
    totalRepsSimulation: int("total_reps_simulation"),
    repsByStationJson: text("reps_by_station_json"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    athleteIdx: index("training_sessions_athlete_idx").on(t.athleteId),
    dateIdx: index("training_sessions_date_idx").on(t.sessionDate),
  })
);

export const executedBlocks = mysqlTable(
  "executed_blocks",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    sessionId: varchar("session_id", { length: 36 })
      .notNull()
      .references(() => trainingSessions.id, { onDelete: "cascade" }),
    exerciseId: varchar("exercise_id", { length: 36 })
      .notNull()
      .references(() => exercises.id),
    station: mysqlEnum("station", exerciseStationEnum),
    orderIndex: int("order_index").notNull(),
    totalValidReps: int("total_valid_reps"),
    totalInvalidReps: int("total_invalid_reps").default(0),
    totalReps: int("total_reps"),
    weightUsedKg: real("weight_used_kg"),
    durationSeconds: int("duration_seconds"),
    isSimulationBlock: boolean("is_simulation_block").notNull().default(false),
    workDurationSec: int("work_duration_sec").default(120),
    notes: text("notes"),
  },
  (t) => ({
    sessionIdx: index("executed_blocks_session_idx").on(t.sessionId),
    exerciseIdx: index("executed_blocks_exercise_idx").on(t.exerciseId),
  })
);

export const repSets = mysqlTable(
  "rep_sets",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    blockId: varchar("block_id", { length: 36 })
      .notNull()
      .references(() => executedBlocks.id, { onDelete: "cascade" }),
    setNumber: int("set_number").notNull(),
    repsTotal: int("reps_total").notNull(),
    repsValid: int("reps_valid").notNull(),
    repsInvalid: int("reps_invalid").notNull().default(0),
    weightKg: real("weight_kg"),
    durationSeconds: int("duration_seconds"),
  },
  (t) => ({
    blockIdx: index("rep_sets_block_idx").on(t.blockId),
  })
);

// ─────────────────────────────────────────────────────
// EXERCISES
// ─────────────────────────────────────────────────────
export const exercises = mysqlTable(
  "exercises",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 200 }).notNull(),
    nameEs: varchar("name_es", { length: 200 }).notNull(),
    station: mysqlEnum("station", exerciseStationEnum).notNull(),
    level: mysqlEnum("level", competitionLevelEnum).notNull(),
    description: text("description").notNull(),
    weightMaleKg: real("weight_male_kg"),
    weightFemaleKg: real("weight_female_kg"),
    weightLabel: varchar("weight_label", { length: 100 }),
    mixedPairException: boolean("mixed_pair_exception").notNull().default(false),
    strapsAllowed: boolean("straps_allowed").notNull().default(false),
    isTiebreakerStation: boolean("is_tiebreaker_station").notNull().default(false),
    requiresEquipment: varchar("requires_equipment", { length: 100 }),
    speedFitTargetReps: int("speed_fit_target_reps"),
    speedFitTeamReps: int("speed_fit_team_reps"),
    videoPath: text("video_path"),
    imagePath: text("image_path"),
    thumbnailPath: text("thumbnail_path"),
    techRequirementsJson: text("tech_requirements_json").notNull(),
    commonErrorsJson: text("common_errors_json"),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    levelIdx: index("exercises_level_idx").on(t.level),
    stationIdx: index("exercises_station_idx").on(t.station),
  })
);

export const techAlerts = mysqlTable(
  "tech_alerts",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    exerciseId: varchar("exercise_id", { length: 36 })
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    severity: mysqlEnum("severity", techAlertSeverityEnum).notNull(),
    triggerCondition: text("trigger_condition"),
    sortOrder: int("sort_order").notNull().default(0),
  },
  (t) => ({
    exerciseIdx: index("tech_alerts_exercise_idx").on(t.exerciseId),
  })
);

// ─────────────────────────────────────────────────────
// PERSONAL RECORDS
// ─────────────────────────────────────────────────────
export const personalRecords = mysqlTable(
  "personal_records",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    athleteId: varchar("athlete_id", { length: 36 })
      .notNull()
      .references(() => athletes.id, { onDelete: "cascade" }),
    exerciseId: varchar("exercise_id", { length: 36 })
      .notNull()
      .references(() => exercises.id),
    maxRepsIn2Min: int("max_reps_in_2min"),
    minTimeFor30Reps: real("min_time_for_30_reps"),
    maxWeightKg: real("max_weight_kg"),
    maxRepsStrength: int("max_reps_strength"),
    recordDate: timestamp("record_date").notNull(),
    sessionId: varchar("session_id", { length: 36 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    athleteIdx: index("personal_records_athlete_idx").on(t.athleteId),
    exerciseIdx: index("personal_records_exercise_idx").on(t.exerciseId),
    dateIdx: index("personal_records_date_idx").on(t.recordDate),
  })
);

// ─────────────────────────────────────────────────────
// TEAMS & PAIRS
// ─────────────────────────────────────────────────────
export const teams = mysqlTable(
  "teams",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 150 }).notNull(),
    level: mysqlEnum("level", competitionLevelEnum).notNull(),
    competitionDate: timestamp("competition_date"),
    maleCount: int("male_count").notNull().default(3),
    femaleCount: int("female_count").notNull().default(3),
    inviteCode: varchar("invite_code", { length: 8 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    inviteIdx: uniqueIndex("teams_invite_code_idx").on(t.inviteCode),
  })
);

export const teamMembers = mysqlTable(
  "team_members",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    teamId: varchar("team_id", { length: 36 })
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    athleteId: varchar("athlete_id", { length: 36 })
      .notNull()
      .references(() => athletes.id, { onDelete: "cascade" }),
    assignedStation: mysqlEnum("assigned_station", exerciseStationEnum).notNull(),
    isCaptain: boolean("is_captain").notNull().default(false),
  },
  (t) => ({
    uniquePair: uniqueIndex("team_members_unique").on(t.teamId, t.athleteId),
    teamIdx: index("team_members_team_idx").on(t.teamId),
  })
);

export const pairs = mysqlTable(
  "pairs",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 150 }).notNull(),
    modality: mysqlEnum("modality", competitionModalityEnum).notNull(),
    level: mysqlEnum("level", competitionLevelEnum).notNull(),
    competitionDate: timestamp("competition_date"),
    inviteCode: varchar("invite_code", { length: 8 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    inviteIdx: uniqueIndex("pairs_invite_code_idx").on(t.inviteCode),
  })
);

export const pairMembers = mysqlTable(
  "pair_members",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    pairId: varchar("pair_id", { length: 36 })
      .notNull()
      .references(() => pairs.id, { onDelete: "cascade" }),
    athleteId: varchar("athlete_id", { length: 36 })
      .notNull()
      .references(() => athletes.id, { onDelete: "cascade" }),
    isLeader: boolean("is_leader").notNull().default(false),
  },
  (t) => ({
    uniquePair: uniqueIndex("pair_members_unique").on(t.pairId, t.athleteId),
  })
);

// ─────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────
export const notifications = mysqlTable(
  "notifications",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    athleteId: varchar("athlete_id", { length: 36 })
      .notNull()
      .references(() => athletes.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body").notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    isRead: boolean("is_read").notNull().default(false),
    scheduledFor: timestamp("scheduled_for"),
    sentAt: timestamp("sent_at"),
    dataJson: text("data_json"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    athleteIdx: index("notifications_athlete_idx").on(t.athleteId),
    scheduledIdx: index("notifications_scheduled_idx").on(t.scheduledFor),
    readIdx: index("notifications_read_idx").on(t.isRead),
  })
);

// ─────────────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ one, many }) => ({
  athlete: one(athletes, { fields: [users.id], references: [athletes.userId] }),
  sessions: many(sessions),
}));

export const athletesRelations = relations(athletes, ({ one, many }) => ({
  user: one(users, { fields: [athletes.userId], references: [users.id] }),
  macrocycle: one(macrocycles, {
    fields: [athletes.id],
    references: [macrocycles.athleteId],
  }),
  trainingSessions: many(trainingSessions),
  personalRecords: many(personalRecords),
  notifications: many(notifications),
}));

export const macrocyclesRelations = relations(macrocycles, ({ one, many }) => ({
  athlete: one(athletes, {
    fields: [macrocycles.athleteId],
    references: [athletes.id],
  }),
  mesocycles: many(mesocycles),
}));

export const mesocyclesRelations = relations(mesocycles, ({ one, many }) => ({
  macrocycle: one(macrocycles, {
    fields: [mesocycles.macrocycleId],
    references: [macrocycles.id],
  }),
  microcycles: many(microcycles),
}));

export const microcyclesRelations = relations(microcycles, ({ one, many }) => ({
  mesocycle: one(mesocycles, {
    fields: [microcycles.mesocycleId],
    references: [mesocycles.id],
  }),
  plannedSessions: many(plannedSessions),
}));

export const plannedSessionsRelations = relations(plannedSessions, ({ one, many }) => ({
  microcycle: one(microcycles, {
    fields: [plannedSessions.microcycleId],
    references: [microcycles.id],
  }),
  plannedBlocks: many(plannedBlocks),
}));

export const plannedBlocksRelations = relations(plannedBlocks, ({ one }) => ({
  plannedSession: one(plannedSessions, {
    fields: [plannedBlocks.plannedSessionId],
    references: [plannedSessions.id],
  }),
  exercise: one(exercises, {
    fields: [plannedBlocks.exerciseId],
    references: [exercises.id],
  }),
}));

export const trainingSessionsRelations = relations(trainingSessions, ({ one, many }) => ({
  athlete: one(athletes, {
    fields: [trainingSessions.athleteId],
    references: [athletes.id],
  }),
  executedBlocks: many(executedBlocks),
}));

export const executedBlocksRelations = relations(executedBlocks, ({ one, many }) => ({
  session: one(trainingSessions, {
    fields: [executedBlocks.sessionId],
    references: [trainingSessions.id],
  }),
  exercise: one(exercises, {
    fields: [executedBlocks.exerciseId],
    references: [exercises.id],
  }),
  repSets: many(repSets),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  techAlerts: many(techAlerts),
  plannedBlocks: many(plannedBlocks),
  executedBlocks: many(executedBlocks),
}));

export const techAlertsRelations = relations(techAlerts, ({ one }) => ({
  exercise: one(exercises, {
    fields: [techAlerts.exerciseId],
    references: [exercises.id],
  }),
}));

// Type exports for the application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Athlete = typeof athletes.$inferSelect;
export type NewAthlete = typeof athletes.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type TechAlert = typeof techAlerts.$inferSelect;
export type NewTechAlert = typeof techAlerts.$inferInsert;
export type Macrocycle = typeof macrocycles.$inferSelect;
export type Mesocycle = typeof mesocycles.$inferSelect;
export type Microcycle = typeof microcycles.$inferSelect;
export type PlannedSession = typeof plannedSessions.$inferSelect;
export type PlannedBlock = typeof plannedBlocks.$inferSelect;
export type TrainingSession = typeof trainingSessions.$inferSelect;
export type ExecutedBlock = typeof executedBlocks.$inferSelect;
export type PersonalRecord = typeof personalRecords.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
